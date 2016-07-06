function PaginatedClientsCtrl($scope, clients, users, Clients){
	console.log('---clientsCtrl----')
	console.log('clientsCtrl  ', clients)
	$scope.filter = {}
	$scope.filter.client = ''
	$scope.filter.user = {id: 'all', name: 'Все'}
	$scope.list = {}

	clients.$promise.then(function(clients){
		clients =clients.clients
		clients.forEach(function(client){
			last_contact = false;
			client.contacts.forEach(function(contact){
				last_contact = last_contact || contact;
				if (contact.createdon > last_contact.createdon)
					last_contact = contact;
			})
			client.last_contact = last_contact;
		})
		$scope.clients = clients;
	})

	users.$promise.then(function(data){
		$scope.users = toDictionary(data);
		$scope.list.users = data;
		$scope.list.users.unshift({id: 'all', name: 'Все'});
	})

	toDictionary = function(arr){
		dict = {}
		arr.forEach(function(obj){
			dict[obj.id] = obj
		})
		return dict;
	}
}