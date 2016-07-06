function ClientCtrl($scope, Clients,
	client, client_form, contact_form, passports_form, requisites_form, users){
	console.log('---ClientCtrl----')
	console.log('client  ', client)
	$scope.client = {}	
	$scope.isLaw = false;
	$scope.preloader = {};
	$scope.preloader.contacts = true;


	client.$promise.then(function(client_data){
		client_form.$promise.then(function(data){
			$scope.client_form = data;
			$scope.typex_choices = $scope.client_form.filter(function(field){return field.name=='typex'})[0].choices;
			// typex_id = client_data['typex'];
			client_data['typex'] = $scope.typex_choices.filter(function(choice){return client_data['typex']==choice.id})[0];
			client_data['data_vidachi'] = client_data['data_vidachi']
			client_data['birthdate'] = client_data['birthdate']
			$scope.client = client_data;
		})
		$scope.contacts = client_data['contacts']
		$scope.preloader.contacts = false;
	})

	users.$promise.then(function(data){
		$scope.users = data.toDictionary();
	})

	contact_form.$promise.then(function(data){
		var dict = data.toDictionary('name');
		$scope.contact_obj = {}
		$scope.contact_obj['typex'] = dict['typex'].choices.toDictionary();
		$scope.contact_obj['source'] = dict['source'].choices.toDictionary();
		$scope.contact_obj['result'] = dict['result'].choices.toDictionary();
	})

	passports_form.$promise.then(function(data){
		data.splice(data.map(function(field){return field.name}).indexOf('surname'), 1);
		data.splice(data.map(function(field){return field.name}).indexOf('patronymic'), 1);
		data.splice(data.map(function(field){return field.name}).indexOf('name'), 1);
		$scope.passports_form = data;
	})
	
	requisites_form.$promise.then(function(data){
		data.splice(data.map(function(field){return field.name}).indexOf('email'), 1);
		data.splice(data.map(function(field){return field.name}).indexOf('phone'), 1);
		$scope.requisites_form = data;
	})

	$scope.$watch(function(){return $scope.client['typex']}, function(){
		if ($scope.client['typex'] == undefined) return;
		$scope.isLaw = ($scope.client['typex'].id == 2);
	}, true)

	$scope.updateClient = function(item, value){
		var regExp = /\[(.*?)\]/g;
		keys = item.match(regExp);
		keys = keys.map(function(key){return key.replace(/\[/g, "").replace(/\]/g, "").replace(/'/g, "").replace(/"/g, "")})
		data = angular.copy($scope.client);
		
		console.log('keys  ', keys)
		console.log('item  ', item)

		parameters = {pk: client.id};
		if (keys.length>1){
			data[keys[0]] = data[keys[0]] || {};
			data[keys[0]][keys[1]] = value;
			data = data[keys[0]];
			parameters.extra = keys[0];
		}
		if (keys.length==1){
			data[keys[0]] = value;
			data['typex'] = data['typex'].id;
		}


		Clients().update(parameters, {data: data}, function(data){
			if (keys.length>1){
				$scope.client[keys[0]] = $scope.client[keys[0]] || {};
				$scope.client[keys[0]][keys[1]] = value;
			}
			if (keys.length==1)
				$scope.client[keys[0]] = value;
			console.log('$scope.client  ', $scope.client)

			$scope.editor.activeItem = null;
			$scope.editor.errors = null;
		}, function(errors){
			// console.log('errors  ', errors['data'][keys[0]][keys[1]] || errors['data'][keys[0]])
			if (keys.length>1){
				$scope.editor.errors = errors['data'][keys[1]];
			}
			if (keys.length==1){
				$scope.editor.errors = errors['data'][keys[0]];
			}
		})
	};

	$scope.saveEdit = function(){
		$scope.updateClient($scope.editor.activeItem, $scope.editor.model);
	};

	$scope.isOverdue = function(status_time, status){
        if (!status_time || !status.possible_delay) return false;
        var time = Date.fromStr(status_time);
		time.setHours(0,0,0,0);
        var now = new Date();
        now.setHours(0,0,0,0);
		return (now>time);
    };

}