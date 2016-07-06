function ClientsCtrl($scope, clients, users, Clients){
	console.log('---clientsCtrl----')
	console.log('clientsCtrl  ', clients)
	$scope.phone = '';
	$scope.filter = {}
	$scope.filter.fio = '';
	$scope.filter.phone = undefined;
	$scope.filter.user = {id: 'all', name: 'Все'};
	$scope.list = {};
	$scope.preload = true;

	clients.$promise.then(function(clients){
		$scope.clients = clients;
		ClientsFilter();
		$scope.preload = false;
	})

	users.$promise.then(function(data){
		$scope.users = data.toDictionary();
		var list = data.filter(function(user){return user.active});
		list.unshift({id: 'all', name: 'Все'});
		$scope.list.users = list;
	})

	$scope.$watch('filter', function(newv, oldv){
		ClientsFilter();
	}, true)

	ClientsFilter = function(){
		byUsers = function(user, clients_user){
			if (clients_user == undefined)
				return false
			return (user.id == 'all' || user.id == clients_user.user)
		}

		byClientFio = function(fio, client){
			if (fio == undefined || fio.length == 0)
				return true;
			var names = [];
			names = fio.split(' ');
			reg_str = names.map(function(name){return '(?=.*'+name+')'}).join('');
			var regExp = new RegExp(reg_str, 'i');
			return regExp.test(client);
		}

		byClientPhone = function(phone, client){
			if (phone == undefined)
				return true;
			phone = phone.substring(0, phone.indexOf('_')) || phone;
			phone = phone.replace(/\(/, "\\(");
			phone = phone.replace(/\)/, "\\)");
			if (phone.length == 0) return true;
			var regExp = new RegExp('^\\'+phone, 'i');
			return regExp.test(client);
		}

		if ($scope.clients == undefined) return;
		$scope.filtered_clients = $scope.clients.filter(function(client){
			return byUsers($scope.filter.user, client.contacts) && byClientFio($scope.filter.fio, client.fio) && byClientPhone($scope.filter.phone, client.phone);
		})
	}

}