function BronesCtrl($scope, $stateParams, brones, clients, users){
	$scope.filter = {};
	$scope.list = {};
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.fast_duration = {from: null, to: null};
	$scope.filter.detailed = false;
	// $scope.preload = true;
	$scope.preload = {'brones': true, 'clients': true};
	$scope.currentPage = 1;
	$scope.filter.isOverdued = false;

	brones.$promise.then(function(data){
		$scope.brones = data;
		$scope.preload.brones = false;
	});

	if ($stateParams){
		if ($stateParams.date_from && $stateParams.date_from != 'null')
			$scope.filter.duration.from = Date.fromStr($stateParams.date_from);
		if ($stateParams.date_to && $stateParams.date_from != 'null')
			$scope.filter.duration.to = Date.fromStr($stateParams.date_to);
		if ($stateParams.date_from || $stateParams.date_to || ($stateParams.date_from == 'null' && $stateParams.date_from == 'null') )
			$scope.filter.detailed = true;
	}

	clients.$promise.then(function(data){
		$scope.clients = data.toDictionary();
		$scope.preload.clients = false;
	})

	users.$promise.then(function(data){
		var list = data.filter(function(user){return user.active});
		list.unshift({id: 'all', name: 'Все'});
		$scope.list.users = list;
		$scope.filter.user = {id : 'all', name: 'Все'};
		$scope.users = data.toDictionary();
	})

	$scope.isOverdue = function(time){
		// if (!!time) return false;
		var time = Date.fromStr(time),
			now = new Date();
		time.setHours(0,0,0,0);
		now.setHours(0,0,0,0)
		return (now>time);
	}


}
