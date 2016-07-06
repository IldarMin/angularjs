function PriceManageStatusCtrl($scope, buildings, plans_detailed, statuses, $window,
    Sections, PriceManage, Search, PlansFilters){
	nedv = {};
 	$scope.list = {};
    $scope.load = false;
 	plans_detailed.$promise.then(function(data){
        $scope.list.filtered_plans = angular.copy(data);
    })

    $scope.list.rooms = [{name: 'Все', id: 'all'},{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];

	$scope.model = {};
 	$scope.model.area = {};
    $scope.model.room = $scope.list.rooms[0];

    $scope.flats = [];
    $scope.condition = 'edit';

 	init_model = function(){
		$scope.model.building = {id: 'all', name: 'Все'};
        $scope.model.section = {id: 'all', name: 'Все'};
		nedv['all'] = [{name: 'Все', id: 'all'}];
	 	$scope.model.area.from = null;
	 	$scope.model.area.to = null;
	 	// $scope.model.duration.from = null;
	 	// $scope.model.duration.to = null;
 	}

 	init_model();


 	buildings.$promise.then(function(data){
 		$scope.list.sections = []
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

 	statuses.$promise.then(function(data){
        $scope.statuseses = data['statuses'].toDictionary();
        $scope.stateses = data['states'].toDictionary();
        $scope.list.states = data['states'];
        $scope.list.states.sort(function(a,b){return a.id-b.id})
        $scope.statuses = data['statuses'];
        $scope.list.incl_statuses = {};
        $scope.list.states.forEach(function(state){
            $scope.list.incl_statuses[state.id] = []
            state.include.forEach(function(incl){
                $scope.list.incl_statuses[state.id].push(getStatus(incl))
            })
        })
        $scope.model.state = $scope.list.states[0];
    })

    getStatus = function(id){
        if ($scope.statuses)
            return $scope.statuses.filter(function(status){return status.id==id})[0];
        return null
    }

    $scope.$watch(function(){return $scope.model.state}, function(){
    	// console.log('watch   $scope.model.state', $scope.model.state)
        if ($scope.model.state == undefined) return;
        $scope.model.status = $scope.list.incl_statuses[$scope.model.state.id][0];
        $scope.list.statuses = $scope.list.incl_statuses[$scope.model.state.id];
    }, true)

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
    }

    $scope.buildingChanged = function(par){
        $scope.list.sections = nedv[par.id];
        $scope.model.section = nedv[par.id][0];
        filterPlans(par, 'building');
    }

    $scope.sectionChanged = function(par){
        filterPlans(par, 'section');
    }

    $scope.areaChanged = function(){
        filterPlans();
    }

    $scope.roomChanged = function(par){
        filterPlans(par, 'room');
    }

    prepareRequest = function(){
        $scope.model.plans = $scope.list.filtered_plans.filter(function(plan){return plan.selected})
        data = angular.copy($scope.model);

        if ($scope.model.building.id == 'all'){
            delete data.building;
        }
        if ($scope.model.section.id == 'all'){
            delete data.section;
        }
        if ($scope.model.plans.length==0){
            delete data.plans;
        }
        if ($scope.model.area.from == null)
            delete data.area.from;
        if ($scope.model.area.to == null)
            delete data.area.to;
        delete data.room;
        data['typex'] = 'status';
        return data;
    }

    $scope.searchFlats = function(){
        data = prepareRequest();
        Search.save({data: data}, function(data){
            $scope.flats = data;
            console.log('$scope.searchFlats ', data)
            $scope.condition = 'watch'
        })
        $scope.condition = 'load'
    }

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
 	}

 	$scope.cancelChanges = function(){
        $scope.condition = 'edit';
 		init_model();
 	}

    // $scope.isOverdue = function(status_time){
    //     var status_time = new Date(Date.parse(status_time));
    //     var status_date = Date.UTC(status_time.getUTCFullYear(), status_time.getUTCMonth(), status_time.getUTCDate())
    //     var now = new Date();
    //     var now_date = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

    //     if (now_date>status_date)
    //         return true
    //     return false;
    // }


    $scope.isFreeze = function(flat){
        if (flat.state)
            if (flat.state.freeze) return true;
        if (flat.status)
            if (flat.status.freeze) return true;
        return false;
    }

    buildings.$promise.then(function(data){
		$scope.buildings = data.toDictionary();
	})

    // statuses.$promise.then(function(data){
	// 	$scope.statuses = toDictionary(data);
	// })

	// toDictionary = function(arr){
	// 	dict = {}
	// 	arr.forEach(function(obj){
	// 		dict[obj.id] = obj
	// 	})
	// 	return dict;
	// }
}
