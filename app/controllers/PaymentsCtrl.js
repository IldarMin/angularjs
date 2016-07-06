function PaymentsCtrl($scope, Sections, DateFormat,
					payments, clients, buildings, users){
	console.log('-----PaymentsCtrl------')
	$scope.Math = Math;
	$scope.currentPage = 1;
	$scope.preload = {'payments': true, 'clients': true};
	
	payments.$promise.then(function(data){
		$scope.payments = data;
		$scope.preload.payments = false;
	});

	users.$promise.then(function(data){
		$scope.users = data.toDictionary();
	})

	$scope.filter = {};
	$scope.list = {};
	$scope.filter.building = {id: 'all', name: 'Все'};
	$scope.filter.client = '';
	//$scope.list.payments = [{id: 'all', name: 'Все платежи'}, {id: 'reserve', name: 'Резерв оплачен'}, {id: 'full', name: 'Обычный'}, {id: 'install', name: 'Pассрочка'}];
	$scope.list.payments = [{id: 'all', name: 'Все платежи'}, {id: 'full', name: 'Обычный'}, {id: 'install', name: 'Pассрочка'}];
	$scope.filter.payment = $scope.list.payments[0];
	$scope.filter.isOverdued = false;

	$scope.payments_types_names = {'reserve': 'Резерв оплачен', 'full': 'Обычный', 'install': 'Pассрочка'};

	buildings.$promise.then(function(data){
		$scope.list.buildings = data;
		$scope.list.buildings.unshift({id: 'all', name: 'Все'});
 	})
	
	$scope.filter.fakt = {};
	$scope.filter.fakt.detailed = false;
	$scope.filter.fakt.duration = {from: null, to: null};
	$scope.filter.fakt.fast_duration = {from: null, to: null};

	$scope.filter.plan = {};
	$scope.filter.plan.detailed = false;
	$scope.filter.plan.duration = {from: null, to: null};
	$scope.filter.plan.fast_duration = {from: null, to: null};


	clients.$promise.then(function(data){
		$scope.clients = data.toDictionary();
		$scope.preload.clients = false;
	})

	$scope.isOverdue = function(time, fakt_date){
		if (!!fakt_date) return false;
		var time = Date.fromStr(time),
			now = new Date();
		time.setHours(0,0,0,0);
		now.setHours(0,0,0,0)
		return (now>time);
	}
}