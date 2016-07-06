function ReservesCtrl($scope, $stateParams, reserves, clients, users, statuses, buildings, Reserves){
	console.log('----ReservesCtrl-----', reserves)
	console.log('$stateParams', $stateParams)

	$scope.filter = {};
	$scope.filter.detailed = false;
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.fast_duration = {from: null, to: null};
	$scope.currentPage = 1;
	
	if ($stateParams){
		if ($stateParams.date_from && $stateParams.date_from != 'null')
			$scope.filter.duration.from = Date.fromStr($stateParams.date_from);
		if ($stateParams.date_to && $stateParams.date_from != 'null')
			$scope.filter.duration.to = Date.fromStr($stateParams.date_to);
		if ($stateParams.date_from || $stateParams.date_to || ($stateParams.date_from == 'null' && $stateParams.date_from == 'null') )
			$scope.filter.detailed = true;
	}

	$scope.filter.status_types = [];
	$scope.list = {};
	$scope.list.payment_types = [{id: '0', name: 'Не выбран'}, {id: '1', name: 'Наличные'}, {id: '2', name: 'На счет'}];

	$scope.preload = {'reserves': true, 'clients': true};
	$scope.payment_types = $scope.list.payment_types.toDictionary();

	reserves.$promise.then(function(data){
		$scope.reserves = data;
		$scope.preload.reserves = false;
	});

	users.$promise.then(function(data){
		var list = data.filter(function(user){return user.active});
		list.unshift({id: 'all', name: 'Все'});
		$scope.list.users = list;
		$scope.filter.user = $scope.list.users[0];
		$scope.users = data.toDictionary();
	});

	clients.$promise.then(function(data){
		$scope.list.clients = data;
		$scope.clients = data.toDictionary();
		$scope.preload.clients = false;
	});

	statuses.$promise.then(function(data){
		var m_status_types = data['status_types'].map(function(s_t){
			var names = s_t.name.split('-');
			s_t.m_name = names[0];
			s_t.d_name = names[1];
			return s_t;
		})
		$scope.status_types = m_status_types.toDictionary('typex');
		$scope.filter.status_types = data['status_types'].map(function(status_type){ status_type.id=status_type.typex; return status_type});
	});
	
	buildings.$promise.then(function(data){
		$scope.filter.buildings = data.map(function(building){ building.name=building.adres+', '+building.number; return building});
	});

	$scope.updateReserve = function(reserve, field){
		return function(new_val, done_function){
			var data = {};
			data[field] = new_val;
			Reserves.update({pk: reserve.id, data: data}, function(){
				done_function();
			});
		}
	}

	// $scope.changeDetailed = function(){
	// 	if ($scope.filter.detailed){
	// 		$scope.filter.duration.from = angular.copy($scope.filter.fast_duration.from);
	// 		$scope.filter.duration.to = angular.copy($scope.filter.fast_duration.to);
	// 	}
	// }

}