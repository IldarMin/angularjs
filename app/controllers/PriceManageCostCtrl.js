function PriceManageCostCtrl($scope, buildings, plans_detailed, Sections, PriceManage, Search, PlansFilters, $window, FlatsListing){
	var nedv = {};
 	$scope.list = {};
 	// $scope.list.filtered_plans = plans_detailed;
 	$scope.list.filtered_plans = plans_detailed;

 	$scope.list.obj_type = [ {id: 'flat', name: 'квартира'}, {id: 'meter', name: 'кв метр'}];
 	$scope.list.obj_action = [ {id: 'rise', name: 'увеличить'}, {id: 'reduce', name: 'уменьшить'}, {id: 'set', name: 'установить'}];
 	$scope.list.rooms = [{name: 'Все', id: 'all'},{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];

	$scope.model = {};
 	$scope.model.area = {};
 	$scope.model.cost_settings = {};
	$scope.model.duration = {};
	$scope.model.room = $scope.list.rooms[0];

	$scope.flats = [];
	$scope.condition = 'edit';
	$scope.Math = Math;
	$scope.load = false;

 	var init_model = function(){
		// $scope.model.building = {id: 'all', name: 'Все'};
		// $scope.model.section = {id: 'all', name: 'Все'};
		// nedv['all'] = [{name: 'Все', id: 'all'}];
	 	$scope.model.area.from = null;
	 	$scope.model.area.to = null;
	 	$scope.model.cost_settings.obj_type = $scope.list.obj_type[0];
	 	$scope.model.cost_settings.val = null;
	 	$scope.model.cost_settings.action = $scope.list.obj_action[0];
	 	$scope.model.duration.from = null;
	 	$scope.model.duration.to = null;
	 	$scope.list.val_type = ( $scope.model.cost_settings.obj_type.id == 'flat') ?
 			[ {id: 'rub' , name: 'руб.'}, {id: 'percent', name: '%'}] :
 			[ {id: 'rub', name: 'руб.'}];
	 	$scope.model.cost_settings.val_type = $scope.list.val_type[0];
 	}

 	init_model();

 	buildings.$promise.then(function(data){
 		$scope.list.sections = [];
		$scope.list.buildings = data;
 		angular.forEach(data, function(build){
			nedv[build.id] = nedv[build.id] || [];
			Sections.query({b_pk: build.id}).$promise.then(function(sections){
				nedv[build.id] = sections.map(function(s){s.name = build.name + '-' + s.name; return s});
			});
		});
 	});

 	var filterPlans = function(par, type){
 		console.log('filterPlans')
 		if (!plans_detailed.$resolved) return;

 		var buildings = (type == 'building') ? par : $scope.list.buildings;
 		var sections = (type == 'section') ? par : $scope.list.sections;
 		var room = (type == 'room') ? par : $scope.model.room;

 		buildings = buildings.filter(function(b){return b.selected}).map(function(b){return b.id});
 		sections = sections.filter(function(s){return s.selected}).map(function(s){return s.id});

 		$scope.list.filtered_plans = [];

 		$scope.list.filtered_plans = plans_detailed.filter(function(plan){
 			return  PlansFilters.byBuildings(buildings, plan) &&
 					PlansFilters.bySections(sections, plan) &&
 					PlansFilters.byArea($scope.model.area, plan) &&
 					PlansFilters.byRoom(room, plan)
 		})
 		console.log('$scope.list.filtered_plans  ', $scope.list.filtered_plans)
 	};

 	$scope.buildingChanged = function(buildings){
 		$scope.list.sections = [];
 		buildings.forEach(function(building){
 			var sections = nedv[building.id].map(function(section){section.selected = (section.selected && building.selected); return section});
 			if (building.selected)
 				$scope.list.sections = $scope.list.sections.concat(sections);
 		})
 		filterPlans(buildings, 'building');
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
 			[ {id: 'rub', name: 'руб.'}];
 		$scope.model.cost_settings.val_type = $scope.list.val_type[0];
	};

	$scope.cost_actionChanged = function(par){
		$scope.list.val_type = ( par.id == 'set') ?
			[ {id: 'rub' , name: 'руб.'}] :
			[ {id: 'rub', name: 'руб.'}, {id: 'percent', name: '%'}];
		$scope.model.cost_settings.val_type = $scope.list.val_type[0];
	};

 	var prepareRequest = function(){
 		$scope.model.plans = $scope.list.filtered_plans.filter(function(plan){return plan.selected});
 		var buildings = $scope.list.buildings.filter(function(buildings){return buildings.selected}).map( function(p) { return p.id });
 		var sections = $scope.list.sections.filter(function(section){return section.selected}).map( function(p) { return p.id });
 		data = angular.copy($scope.model);
 		data['buildings'] = buildings;
 		data['sections'] = sections;
 		if (buildings.length == 0)
 			delete data.buildings;
 		if (sections.length == 0)
 			delete data.sections;
 		if ($scope.model.plans.length==0)
 			delete data.plans;
 		if ($scope.model.area.from == null)
 			delete data.area.from;
 		if ($scope.model.area.to == null)
 			delete data.area.to;
 		if ($scope.model.duration.from == null)
 			delete data.duration.from;
 		if ($scope.model.duration.to == null)
 			delete data.duration.to;
 		data.rooms_count = $scope.model.room.id;
 		if ($scope.model.room.id == 'all')
 			delete data.room;
 		data['typex'] = 'price';
 		return data;
 	}

 	$scope.searchFlats = function(){
 		data = prepareRequest();
 		Search.save({data: data}, function(data){
 			$scope.flats = data;
 			console.log('$scope.searchFlats ', data);
 			$scope.condition = 'watch';
 		})
 		$scope.condition = 'load';
 	};

	$scope.priceCalculate =function(price, area){
		$scope.price = price;
		$scope.area = area;

		if ($scope.model.cost_settings.obj_type.id == 'flat' && $scope.model.cost_settings.val_type.id == 'rub'){
			if($scope.model.cost_settings.action.id == 'rise'){
				return $scope.price + +$scope.model.cost_settings.val;
			}else if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.model.cost_settings.val;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return $scope.model.cost_settings.val;
			}
		}else if($scope.model.cost_settings.obj_type.id == 'meter' && $scope.model.cost_settings.val_type.id == 'rub'){
			if($scope.model.cost_settings.action.id == 'rise'){
				return $scope.price + +$scope.model.cost_settings.val*$scope.area;
			}else if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.model.cost_settings.val*$scope.area;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return +$scope.model.cost_settings.val*$scope.area;
			}
		}else if($scope.model.cost_settings.obj_type.id == 'flat' && $scope.model.cost_settings.val_type.id == 'percent'){
			if($scope.model.cost_settings.action.id == 'rise'){
				return $scope.price + +$scope.price*$scope.model.cost_settings.val/100;
			}else if ($scope.model.cost_settings.action.id == 'reduce') {
				return $scope.price - +$scope.price*$scope.model.cost_settings.val/100;
			}else if ($scope.model.cost_settings.action.id == 'set') {
				return 0;
			}
		}
	};


 	$scope.saveChanges = function(){
 		$scope.load = true;
 		data = prepareRequest();
 		PriceManage.update({data: data}, function(data){
 			console.log('PriceManage.update ', data)
 			$scope.condition = 'save';
 			$scope.load = false;
			$window.location.reload();
 		})
 		// init_model();
 	};

 	$scope.cancelChanges = function(){
 		$scope.condition = 'edit'
 		init_model();
 	};

	$scope.isFreeze = function(flat){
		if (flat.state)
			if (flat.state.freeze) return true;
		if (flat.status)
			if (flat.status.freeze) return true;
		return false;
	};

	buildings.$promise.then(function(data){
		$scope.buildings = data.toDictionary();
	});

}
