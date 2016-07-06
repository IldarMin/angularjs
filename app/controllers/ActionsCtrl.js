function ActionsCtrl($scope, actions, statuses, users, clients, flats, sales){
	console.log('-------ActionsCtrl------------')
	$scope.filter = {}
	$scope.filter.client = '';
	$scope.filter.duration = {from: '', to: ''};
	$scope.filter.user = {id: 'all', name: 'Все'};
	$scope.list = {};
	$scope.filter.type = {id: 'all', name: 'Все'};
	$scope.list.types = [{id: 'all', name: 'Все'},{id: 'sale_added', name: 'Создание акции'},{id: 'status_changed', name: 'Смена статуса(состояния)'},
	{id: 'contact_added', name: 'Добавление контакта'},{id: 'change_price', name: 'Изменение цены'},{id: 'created', name: 'Создание квартиры'}];

	$scope.preload = true;
	sales.$promise.then(function(data){
		$scope.sales = toDictionary(data);
	})

	actions.$promise.then(function(data){
		$scope.actions = data.map(function(obj){return obj.fields});
		$scope.preload = false;
	})

	users.$promise.then(function(data){
		$scope.users = toDictionary(data);
		$scope.list.users = data;
		$scope.list.users.unshift({id: 'all', name: 'Все'});
	})

	clients.$promise.then(function(data){
		$scope.clients = toDictionary(data);
	})

	flats.$promise.then(function(data){
		$scope.flats = toDictionary(data);
	})

	statuses.$promise.then(function(data){
		$scope.states = toDictionary(data['states']);
		$scope.statuses = toDictionary(data['statuses']);
	})

	toDictionary = function(arr){
		dict = {}
		arr.forEach(function(obj){
			dict[obj.id] = obj
		})
		return dict;
	}

	$scope.getSales = function(ids){
		if (ids == undefined || !$scope.sales) return;
		return 'Добавил акции '+ids.map(function(id){return '"'+$scope.sales[id].name+'"'}).join(', ');
	}

	$scope.getActions = function(action){
		verbose = '';
		actions = ''
		switch (action.type){
			case 'sale_added':
				verbose = 'Добавил акции'
				break;
			case 'status_changed':
				verbose  = 'Изменил статус'
				break;
			case 'contact_added':
				verbose  = 'Добавлен контакт'
				break;
		}
		return verbose;
	}


}
