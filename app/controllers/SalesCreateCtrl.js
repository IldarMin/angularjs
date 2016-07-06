function SalesCreateCtrl($scope, $location, buildings, sales, plans_detailed,
	Sections, Sales, DateFormat, Search, PlansFilters){
 	console.log('---SalesEditCtrl----')
 	console.log('buildings ', buildings)
 	// console.log('sections ', sections)
 	console.log('sales ', sales)
 	$scope.mod = 'create';
 	$scope.load = false;

	$scope.Math = Math;

 	$scope.condition = 'edit';
 	$scope.flats = [];

	$scope.model = {};
 	// init form
 	initForm = function(){
 		nedv = {};
	 	$scope.list = {};
	 	// $scope.list.plans = plans;
	 	plans_detailed.$promise.then(function(data){
	 		$scope.list.filtered_plans = data;
	 	});
	 	sales.$promise.then(function(data){
	 		$scope.list.sales = data;
	 	})
	 	$scope.list.obj_type = [ {id: 'flat', name: 'квартира'}, {id: 'meter', name: 'кв метр'}];
	 	$scope.list.duration_type = [{id: 1, name: 'Постоянная'}, {id: 2, name: 'Временная'}];
	 	$scope.list.rooms = [{name: 'Все', id: 'all'},{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];
		$scope.list.obj_action = [{id: 'reduce', name: 'уменьшить'}, {id: 'set', name: 'установить'}];

	 	$scope.model.area = {};
	 	$scope.model.cost_settings = {};
		$scope.model.duration = {}
		$scope.model.room = $scope.list.rooms[0];

		$scope.model.name = '';
		$scope.model.description = '';
	 	$scope.model.area = {from: null, to: null};
	 	$scope.model.cost_settings.obj_type = $scope.list.obj_type[0];
		$scope.model.cost_settings.action = $scope.list.obj_action[0];
	 	$scope.model.cost_settings.val = 0;
	 	$scope.list.val_type = ( $scope.model.cost_settings.obj_type.id == 'flat') ?
 			[ {id: 'rub' , name: 'руб.'}, {id: 'percent', name: '%'}] :
 			[ {id: 'rub', name: 'руб.'}]
 		$scope.model.cost_settings.val_type = $scope.list.val_type[0];

	 	$scope.model.duration = {from: null, to: null};
	 	$scope.model.duration.type = $scope.list.duration_type[0];

	 	buildings.$promise.then(function(data){
			$scope.model.building = {id: 'all', name: 'Все'};
			$scope.model.section = {id: 'all', name: 'Все'};
			$scope.list.sections = [{id: 'all', name: 'Все'}];
			$scope.list.buildings = [{id: 'all', name: 'Все'}];
	 		angular.forEach(data, function(build){
	 			$scope.list.buildings.push(build);
				nedv[build.id] = nedv[build.id] || [];
				Sections.query({b_pk: build.id}).$promise.then(function(sections){
					nedv[build.id] = sections;
					nedv[build.id].unshift({name: 'Все', id: 'all'})
				});
			})
			nedv['all'] = [{name: 'Все', id: 'all'}];
	 	})
 	};

 	initForm();

 	filterPlans = function(par, type){
 		console.log('filterPlans')
 		if (!plans_detailed.$resolved) return;

 		var building = (type == 'building') ? par : $scope.model.building;
 		var section = (type == 'section') ? par : $scope.model.section;
 		var room = (type == 'room') ? par : $scope.model.room;

 		$scope.list.filtered_plans = [];
 		$scope.list.filtered_plans = plans_detailed.filter(function(plan){
 			// plan.selected = false;
 			return  PlansFilters.byBuilding(building, plan) &&
 					PlansFilters.bySection(section, plan) &&
 					PlansFilters.byArea($scope.model.area, plan) &&
 					PlansFilters.byRoom(room, plan)
 		})
 		console.log('$scope.list.filtered_plans  ', $scope.list.filtered_plans)
 	};

	$scope.buildingChanged = function(par){
 		$scope.list.sections = nedv[par.id];
 		$scope.model.section = nedv[par.id][0];
 		filterPlans(par, 'building');
	};

	$scope.sectionChanged = function(par){
 		filterPlans(par, 'section');
	};

	$scope.areaChanged = function(){
		filterPlans();
	};

	$scope.roomChanged = function(par){
		filterPlans(par, 'room');
	};

	$scope.cost_settingsChanged = function(par){
 		$scope.list.val_type = ( par.id == 'flat') ?
 			[ {id: 'rub' , name: 'руб.'}, {id: 'percent', name: '%'}] :
 			[ {id: 'rub', name: 'руб.'}]
 		$scope.model.cost_settings.val_type = $scope.list.val_type[0];
	}

	$scope.cost_actionChanged = function(par){
		$scope.list.val_type = ( par.id == 'set') ?
			[ {id: 'rub' , name: 'руб.'}] :
			[ {id: 'rub', name: 'руб.'}, {id: 'percent', name: '%'}]
		$scope.model.cost_settings.val_type = $scope.list.val_type[0];
	}

	prepareRequest = function(){

		$scope.model.plans = $scope.list.filtered_plans.filter(function(plan){return plan.selected});
 		$scope.model.sales = $scope.list.sales.filter(function(sale){return sale.selected}).map(function(sale){return {name: sale.name, id: sale.id}});
 		data = angular.copy($scope.model);

 		if ($scope.model.building.id == 'all')
 			delete data.building;
 		if ($scope.model.section.id == 'all')
 			delete data.section;
 		if ($scope.model.plans.length==0)
 			delete data.plans;
 		if ($scope.model.area.from == null)
 			delete data.area.from;
 		if ($scope.model.area.to == null)
 			delete data.area.to;
 		if ($scope.model.duration.from == null || $scope.model.duration.type.name == 'Постоянная')
 			delete data.duration.from;
 		if ($scope.model.duration.to == null || $scope.model.duration.type.name == 'Постоянная')
 			delete data.duration.to;
 		return data;
	};

	$scope.searchFlats = function(){
        data = prepareRequest();
        Search.save({data: data}, function(data){
            $scope.flats = data;
            console.log('$scope.searchFlats ', data)
            $scope.condition = 'watch';
        })
        $scope.condition = 'load';
    };


 	$scope.saveChanges = function(){
 		$scope.load = true;
 		data = prepareRequest();
 		Sales.save({data: data}, function(data){
 			console.log('Sales.save ', data)
 			$scope.condition = 'save';
		 	$scope.load = false;
 			$location.path('/sales');
 		})
 	};

 	$scope.cancelChanges = function(){
 		$scope.condition = 'edit';
 		$location.path('/sales');
 	};

	$scope.priceCalculate =function(price, area){
		$scope.price = price;
		$scope.area = area;

		if ($scope.model.cost_settings.obj_type.id == 'flat' && $scope.model.cost_settings.val_type.id == 'rub'){
			if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.model.cost_settings.val;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return +$scope.model.cost_settings.val
			}
		}else if($scope.model.cost_settings.obj_type.id == 'meter' && $scope.model.cost_settings.val_type.id == 'rub'){
			if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.model.cost_settings.val*$scope.area;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return +$scope.model.cost_settings.val*$scope.area;
			}
		}else if($scope.model.cost_settings.obj_type.id == 'flat' && $scope.model.cost_settings.val_type.id == 'percent'){
			if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.price*$scope.model.cost_settings.val/100;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return 0;
			}
		}
	};

	buildings.$promise.then(function(data){
		$scope.buildings = data.toDictionary();
	});

	// toDictionary = function(arr){
	// 	dict = {}
	// 	arr.forEach(function(obj){
	// 		dict[obj.id] = obj
	// 	})
	// 	return dict;
	// }


}
