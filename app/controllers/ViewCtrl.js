function ViewCtrl($scope, $state, $cacheFactory, 
                Sections, TypFloors, UserRole,  
                building_pk, section_pk, 
                building, sections, statuses, plans, typfloors, 
                permissions, settings){
    var b_pk = building_pk;
    $scope.building = building;
    console.log('$scope.building  ', $scope.building)
    $scope.sections = sections;
    $scope.preload = true;
    $scope.permissions = permissions;

    $scope.changeSection = function(){
        console.log('-----$scope.changeSection----')
        s_pk = $scope.filter.ch_section;
        $state.transitionTo('build_view', {s_pk: s_pk}, { location: true, inherit: true, relative: $state.$current, notify: false});
        $scope.section = Sections.get({b_pk: b_pk, s_pk: s_pk}, function(){ $scope.preload = false; });
        $scope.preload = true;
    };

    var initFilter = function(){
        $scope.filter = {};
        $scope.list = {};
        $scope.filter.detailed = true;

        if (!!section_pk){
            $scope.filter.ch_section = section_pk;
            $scope.section = Sections.get({b_pk: b_pk, s_pk: $scope.filter.ch_section}, function(){ $scope.preload = false; })
        } else {
            sections.$promise.then(function(data){
                $scope.filter.ch_section = data.sort(function(a, b){return a.number - b.number})[0].id;
                $scope.section = Sections.get({b_pk: b_pk, s_pk: $scope.filter.ch_section}, function(){ $scope.preload = false; })
            })
        }

        //директора || //застройщики
        if (UserRole.isDirectors() || UserRole.isDevelopers())
            $scope.filter.detailed = false;

        statuses.$promise.then(function(data){
            $scope.legend = {};
            $scope.legend.states = data['states'];
            $scope.legend.statuses = data['statuses'];

            $scope.states = data['states'].toDictionary();
            $scope.statuses = data['statuses'].toDictionary();
            $scope.groups = data['groups'];
            $scope.list.states = data['states'];
        })
        $scope.filter.rooms = [{name: 'Все', id: 'all'},{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];
        $scope.filter.ch_room = $scope.filter.rooms[0];
        $scope.filter.plans = plans;
        $scope.filter.ready = true;
    };

    initFilter();

    newStatusesFilter = function(states){
        var selected_states = states.filter(function(state){return state.selected}),
            uniq = {},
            filter_statuses = [];

        //формируем список id статусов(пересечение + разница)
        selected_states.forEach(function(state){
            state.include.forEach(function(id){
                uniq[id] = true;
            })
        })

        //формируем список статусов по группам
        $scope.groups.forEach(function(group){
            var list = [];
            group.statuses.forEach(function(status){
                if (uniq[status.id] || selected_states.length == 0){
                    status.selected = false;
                    list.push(status);
                }
            })
            if (list.length>0){
                var group_in = angular.copy(group);
                delete group_in['statuses'];
                group_in.selected = false;
                filter_statuses.push({parent: group_in, list: list});
            }
        })
        $scope.list.groups = filter_statuses;
    };

    $scope.$watch(function(){return $scope.list.states}, function(new_selected, oldV){
        if (new_selected == undefined) return;
        newStatusesFilter(new_selected);
    }, true)

    $scope.filterPlans = function(par){
        $scope.filter.plans = plans.filter(function(plan){
            plan.selected=false;
            return (par.id == 'all' || par.id == plan.rooms_count)
        })
    }

    byStatuses = function(statuses, flat){
        var selected = [];
        if (statuses == undefined) return true;
        statuses.forEach(function(group){
            selected = selected.concat(group.list.filter(function(obj){return obj.selected}).map(function(obj){return obj.id}));
        })
        return (selected.length == 0 || selected.indexOf(flat['status'].id)>-1)
    }

    $scope.classByFilter = function(flat){
        if ($scope.filter.ch_room == undefined) return;
        if ($scope.list.groups == undefined) return;
        if ($scope.list.states == undefined) return;

        //by rooms
        if (!($scope.filter.ch_room.id == 'all' || $scope.filter.ch_room.id == flat.plan.rooms_count))
            return 'grey';

        //by plans
        var selected_plans = $scope.filter.plans.filter(function(plan){return plan.selected});
        if (!(selected_plans.length == 0 || selected_plans.some(function(plan){return plan.id == flat.plan.id})))
            return 'grey';

        //by state
        var selected_states = $scope.list.states.filter(function(state){return state.selected});
        if (!(selected_states.length == 0 || selected_states.some(function(state){return state.id == flat.state.id})))
            return 'grey';

        //by statuses
        var selected_statuses = [];
        $scope.list.groups.forEach(function(group){
            selected_statuses = selected_statuses.concat(group.list.filter(function(status){return status.selected}).map(function(status){return status.id}));
        })
        if (!(selected_statuses.length == 0 || selected_statuses.indexOf(flat.status.id)>-1))
            return 'grey';
        return ''
    }

    $scope.editMode = false;
    $scope.editError1 = '';

    $scope.setEditMode = function(mode){
        $scope.editMode = mode;
        if ($scope.editMode){
            $scope.filter.ch_room =  $scope.filter.rooms[0];
            $scope.filter.plans.map(function(plan){return plan.selected=false});
            $scope.filter.ch_state =  $scope.list.states[0];
        }
    };

    $scope.isShow = function(condition, entity){
        return ($scope.modal.condition == condition &&  $scope.modal.entity == entity);
    };

    $scope.modal = {};

    $scope.addSection = function(){
        $scope.modal.condition = 'create'
        $scope.modal.entity = 'section'
        $scope.modal.data = {};
        $scope.modal.data.number = 0;
        $scope.modal.data.entrance = 0;
        $scope.editPreload = false;
        $scope.editError = '';
    };

    $scope.editPreload = false;

    var errorResp = function(error){
        console.log('error  ', error)
        $scope.editPreload = false;
        $scope.editError = 'Возикла ошибка';
    };

    $scope.createSection = function(){
        section = new Sections({b_pk: b_pk})
        section.data = {};
        section.data.number = $scope.modal.data.number;
        section.data.entrance = $scope.modal.data.entrance;
        $scope.editPreload = true;
        $scope.editError = '';
        section.$save(function(data){
            $cacheFactory.get('$http').remove('/api/buildings/'+b_pk+'/sections/');
            Sections.query({b_pk: b_pk}, function(data){
                $scope.sections = data;
                if (!$scope.filter.ch_section){
                    $scope.filter.ch_section = data[0].id;
                    $scope.changeSection();
                }
            });//подъезды
            $scope.modal = {};
            $('#myModal').modal('hide');
            $scope.editPreload = false;
        }, function(error){
            errorResp(error);
        })
    };

    $scope.addFloor = function(){
        $scope.modal.condition = 'create';
        $scope.modal.entity = 'floor';
        $scope.modal.data = {};
        $scope.modal.data.typfloors = typfloors;
        $scope.modal.data.typfloor =  $scope.modal.data.typfloors[0];
        $scope.modal.data.floor = 1;
        $scope.editPreload = false;
        $scope.editError = '';
        if ($scope.section.floors && $scope.section.floors.length>0)
            $scope.modal.data.floor = Math.max.apply(Math, $scope.section.floors.map(function(floor){return floor.number})) + 1;
    };

    $scope.createFloor = function(){
        typfloor = {'typfloor': $scope.modal.data.typfloor.id};
        s_pk = $scope.filter.ch_section;
        $scope.editPreload = true;
        $scope.editError = '';
        Sections.update({b_pk: b_pk, s_pk: s_pk}, {data: typfloor},  function(data){
            $cacheFactory.get('$http').remove('/api/buildings/'+b_pk+'/sections/'+s_pk);
            Sections.get({b_pk: b_pk, s_pk: s_pk}, function(s_data){
                $scope.section = s_data;
                $scope.preload = false;
            })
            $scope.preload = true;
            $scope.modal = {};
            $('#myModal').modal('hide');
            $scope.editPreload = false;
        }, function(error){
            errorResp(error);
        })
    };

    $scope.changeFloor = function(floor){
        $scope.modal.condition = 'update';
        $scope.modal.entity = 'floor';
        $scope.modal.data = {};
        $scope.modal.data.typfloors = typfloors;
        $scope.modal.data.typfloor = $scope.modal.data.typfloors.filter(function(typfloor){return typfloor.id == floor.typfloor})[0];
        $scope.modal.data.floor = floor.number;
        $scope.editPreload = false;
        $scope.editError = '';
    };

    $scope.updateFloor = function(){
        req_data = {};
        req_data.floor = $scope.modal.data.floor;
        req_data.typfloor = $scope.modal.data.typfloor.id;
        s_pk = $scope.filter.ch_section;
        $scope.editPreload = true;
        $scope.editError = '';
        Sections.update({b_pk: b_pk, s_pk: s_pk}, {data: req_data}, function(data){
            $cacheFactory.get('$http').remove('/api/buildings/'+b_pk+'/sections/'+s_pk);
            Sections.get({b_pk: b_pk, s_pk: s_pk}, function(s_data){
                $scope.section = s_data;
                $scope.preload = false;
            })
            $scope.preload = true;
            $scope.modal = {};
            $('#myModal').modal('hide');
            $scope.editPreload = false;
         }, function(error){
            errorResp(error);
        })
    };

    $scope.cancel = function(){
        $scope.modal = {};
        $('#myModal').modal('hide');
        $scope.editPreload = false;
        $scope.editError = '';
    };

    $scope.changeFloorIn = function(floor_number){
        $scope.editFloorMode = true;
    };

    $scope.classIsOverdue = function(status_time, status){
        if (!status_time || !status.possible_delay) return '';
        var status_time = Date.fromStr(status_time);
        status_time.setHours(0,0,0,0);
        var now = new Date();
        now.setHours(0,0,0,0);
        return (now>status_time) ? 'overdue' : '';
    };

}
