function ActionsFlatsCtrl($scope, $stateParams, ActionsFlats, users, statuses, clients) {
	$scope.filter = {};
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.user = {id: 'all', name: 'Все'};
	$scope.filter.delays = false;
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.fast_duration = {from: null, to: null};
	$scope.filter.detailed = false;
	$scope.status_only = false;
	$scope.list = {};
	$scope.preload = {'actions': true, 'users': true, 'clients': true};

	$scope.createResult = function(action){
		var head = 'Результат: ',
			result = null;
		// if (action.changes.status || action.status == 21)
		// 	result = (action.result) ? head+$scope.statuses[action.result].name : '';
		// if (action.changes && !action.result)
		// 	result = '';
		// if (action.changes.status_time && action.result){
		// 	if(action.result_changes.status){
		// 		result = head+$scope.statuses[action.result].name;
		// 	}if (action.result_changes.state) {
		// 		result = head+'Смена типа продажи';
		// 	} else {
		// 		result = head+'Продлено';
		// 	}
		// }
		if(action.result == 21)
			result = head+$scope.statuses[action.result].name;

		if(action.result && action.result_changes.status){
			if(action.result && action.result_changes.state)
				result = head+'Смена типа продажи';
			else
				result = head+$scope.statuses[action.result].name;
		}

		if(action.result && action.result_changes.state)
			result = head+'Смена типа продажи';

		if(action.result && !action.result_changes.status){
			if(action.result == 21)
				result = head+$scope.statuses[action.result].name;
			else if(action.result && action.result_changes.state)
				result = head+'Смена типа продажи';
			else
				result = head+'Продлено';
		}

		return function(){
			return result;
		}();
	};

	var initialPaginator = function(data){
		$scope.paginator.setPages(data.page.count);
		$scope.paginator.setActive(data.page.number);
		$scope.actions = data.objects;
		$scope.preload.actions = false;
	};

	users.$promise.then(function(data){
		$scope.users = data.toDictionary();
		var list = data.filter(function(user){return user.active});
		list.unshift({id: 'all', name: 'Все'});
		$scope.list.users = list;
		$scope.preload.users = false;
	});

	clients.$promise.then(function(data){
		$scope.clients = data.toDictionary();
		$scope.preload.clients = false;
	});

	statuses.$promise.then(function(s_data){
		$scope.states = s_data['states'].toDictionary();
		$scope.statuses = s_data['statuses'].toDictionary();
		$scope.groups = s_data['groups'];
		$scope.list.states = s_data['states'];

		var data = {};
		if ($stateParams){
			if ($stateParams.date_from && $stateParams.date_from != 'null')
				$scope.filter.duration.from = Date.fromStr($stateParams.date_from);
			if ($stateParams.date_to && $stateParams.date_to != 'null')
				$scope.filter.duration.to = Date.fromStr($stateParams.date_to);
			if ($stateParams.date_from || $stateParams.date_to || ($stateParams.date_from == 'null' && $stateParams.date_from == 'null') ){
				$scope.filter.detailed = true;
				$scope.filter.status_only = true;
			}
			var selected = $stateParams.type || [],
				filter_statuses = [];
			$scope.groups.forEach(function(group){
				var list = [];
				if (selected.indexOf(group.id)>-1){
					group.selected = true;
					//не показываем Бронь подрядчик
					//только если переход с главного экрана??
					group.statuses.map(function(status){return status.selected = (status.id != 3)});
				};
				var group_in = angular.copy(group),
					list = angular.copy(group.statuses);
				delete group_in['statuses'];
				filter_statuses.push({parent: group_in, list: list});
			});
			$scope.list.groups = filter_statuses;
		}
		data.filter = getFilter();
		ActionsFlats.save(data, function(r_data){
			initialPaginator(r_data);
		});
	});

    var newStatusesFilter = function(states){
    	var selected_states = states.filter(function(state){return state.selected}),
			uniq = {},
			filter_statuses = [];

		//формируем список id статусов(пересечение + разница)
		selected_states.forEach(function(state){
			state.include.forEach(function(id){
                uniq[id] = true;
            });
		});

		//формируем список статусов по группам
		$scope.groups.forEach(function(group){
			var list = [];
			group.statuses.forEach(function(status){
				if (uniq[status.id] || selected_states.length == 0){
					status.selected = false;
					list.push(status);
				};
			});
			if (list.length>0){
				var group_in = angular.copy(group);
				delete group_in['statuses'];
				group_in.selected = false;
				filter_statuses.push({parent: group_in, list: list});
			};
		});
		$scope.list.groups = filter_statuses;
    };

    $scope.$watch(function(){return $scope.list.states}, function(new_selected, oldV){
        if (oldV == undefined) return;
        console.log('$scope.list.groups  ', $scope.list.groups);
		newStatusesFilter(new_selected);
    }, true)

    var getDuration = function(obj, duration){
		if (!!duration.from)
			obj.from = duration.from;
		if (!!duration.to)
			obj.to = duration.to;
		return obj;
	};

	var getFilter = function(){
		var obj = {};
		obj = ($scope.filter.detailed) ? getDuration(obj, $scope.filter.duration) : getDuration(obj, $scope.filter.fast_duration);
		if ($scope.filter.user.id != 'all')
			obj.user = $scope.filter.user.id;
		if ($scope.list.states.some(function(state){return state.selected}))
			obj.states = $scope.list.states.filter(function(state){return state.selected}).map(function(state){return state.id});
		var statuses = [];
		$scope.list.groups.forEach(function(group){
			statuses = statuses.concat(group.list.filter(function(obj){return obj.selected}).map(function(obj){return obj.id}));
		})
		if (statuses.length>0)
			obj.statuses = statuses;
		obj.status_only = $scope.filter.status_only;
		return obj;
	};

	$scope.filterActions = function(){
		$scope.preload = true;
		var data = {};
		data.filter = getFilter();
		ActionsFlats.save(data, function(data){
			console.log('ActionsFlats  ', data);
			initialPaginator(data);
		})
	};


	$scope.isOverdue = function(action, status_time){
		if (!status_time) return;
		if (!status_time && !action.active && !$scope.statuses[action.status].possible_delay) return false;
        var status_time = Date.fromStr(status_time);
        status_time.setHours(0,0,0,0);
        var now = new Date();
        now.setHours(0,0,0,0);
        return (now > status_time && !!status_time && !!action.active && action.status && !!$scope.statuses[action.status].possible_delay);
	};

	$scope.paginator = {
		pagesMax: 9,
		pagesCenter: 5,
		pages: [],
		three_dots: [null, null],
		pages_count: null,
		last_page: null,
		current: null,
		start: 1,
		setPages: function(count){
			this.pages_count = (count<this.pagesMax) ? count : this.pagesMax;
			this.last_page = count;
		},
		setDots: function(){
			this.three_dots = [null, null];
			this.start = 1;
			if (this.last_page > this.pagesMax){
				if (this.current<=this.pagesCenter){
					this.three_dots = [null, this.pagesMax - 1];//многоточие в конце
				}
				if (this.current>=this.last_page - this.pagesCenter){
					this.three_dots = [2, null];//многоточие в начале
					this.start = this.last_page-8;
				}
				if (this.current>this.pagesCenter && this.current<this.last_page - this.pagesCenter){
					this.three_dots = [2, this.pagesMax - 1];//многоточие в двух концах
					this.start = this.current-4;
				}
			}
		},
		setActive: function(current){
			this.current = current;
			this.setDots();
			this.pages = [];
			var pages_numbers = [];

			for (var i=1; i<=this.pages_count; i++){
				var page = {};
				page.number = this.start++;
				if (i==1)
					page.number = 1;
				if (i==this.three_dots[0] || i==this.three_dots[1])
					page.number = '...';
				if (i==this.pagesMax)
					page.number = this.last_page;
				this.pages.push(page);
			}
		},
		newPage: function(current){
			if (current == this.current) return;
			var self = this;
			var data = {};
			data.filter = getFilter();
			data.page = current;
			$scope.preload_page = true;
			ActionsFlats.save(data, function(data){
				console.log('ActionsFlats  ', data);
				$scope.actions = data.objects;
				self.setActive(current);
				$scope.preload_page = false;
			})
		}
	};

}
