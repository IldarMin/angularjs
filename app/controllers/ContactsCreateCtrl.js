function ContactsCreateCtrl($scope, $location, $cookies, Forms, Contacts, ModalServ, Clients, Buildings){
	console.log('---FlatCtrl--')

	var prev_page = $cookies.get('prev_page');
	if (prev_page == undefined)
		prev_page = '/clients';

	$scope.form = Forms.get({entity: 'contact'}, function(fields){
		setFieldType(fields, 'sales', 'Checkbox');
		setFieldType(fields, 'preferences', 'Checkbox');
		setFieldType(fields, 'comment', 'Textarea');
		fields.push({"choices": [], "name": "notification_time", "type": "DateTime"});
		fields.push({"choices": [], "name": "notification_comment", "type": "Textarea"});
		fields.push({"choices": [], "name": "flat", "type": "Integer"});
		var building_obj = {"name": "building", "type": "Select"};
		Buildings.query(function(data){
			data.unshift({name: 'Выбрать дом', id: null});
			building_obj['choices'] = data;
			fields.push(building_obj);
			$scope.contact = {'time_date': null, 'time_time': null};
			$scope.notification = {'time_date': null, 'time_time': null};
			$scope.Mod = new ModalServ.init(fields, new Contacts(), createCallback, errorCallback);//+еще колбек на результаты update и create 
			$scope.Mod.add();
			var now = new Date();
			$scope.contact.time_date= now;
			$scope.contact.time_time = (now.getHours()<10 ? '0' : '')+ now.getHours()+(now.getMinutes()<10 ? '0' : '')+now.getMinutes();
		});
	})

	setFieldType = function(fields, name, type){
		angular.forEach(fields, function(field){
			if (field.name == name) field.type = type;
			return;
		})
	}

	createCallback = function(obj){
		if (obj['flat_id']){
			$location.path('/flats/'+obj['flat_id']);
			return;
		}
		$location.path(prev_page);
	}

	errorCallback = function(obj){
		console.log('$scope.Mod  ', $scope.Mod);
		console.log('errorCallback  ', obj.data.error);
		if (obj.data.error == 'no such flat')
			$scope.Mod.data['flat']['errors'] = ['Такой квартиры не существует'];
		if (obj.data.error == 'flat booked')
			$scope.Mod.data['flat']['errors'] = ['Невозможно забронировать данную квартиру'];
	}

	$scope.cancel = function(){
		console.log('prev_page ', prev_page)
		$location.path(prev_page);
	}

	dateTimeToForm = function(time_time, time_date, toMod){
		
		var hours = + time_time.substr(0, 2),
			minutes = + time_time.substr(2);
		var year = time_date.getFullYear(),
			month = time_date.getMonth(),
			day = time_date.getDate();

		if (hours>23 || minutes>59){
			time_time = null;
			return;
		}
		toMod.value = toMod.value || new Date();
		
		toMod.value.setYear(year);
		toMod.value.setMonth(month);
		toMod.value.setDate(day);

		toMod.value.setHours(hours);
		toMod.value.setMinutes(minutes);
		toMod.value.setSeconds(0);
	}

	$scope.$watchGroup(['contact.time_time', 'contact.time_date'], function(){
		if (!$scope.contact || !$scope.contact.time_time || !$scope.contact.time_date) return;
		dateTimeToForm($scope.contact.time_time, $scope.contact.time_date, $scope.Mod.data['time']);
	})

	$scope.$watchGroup(['notification.time_time', 'notification.time_date'], function(){
		if (!$scope.notification || !$scope.notification.time_time || !$scope.notification.time_date) return;
		dateTimeToForm($scope.notification.time_time, $scope.notification.time_date, $scope.Mod.data['notification_time']);
	})


	$scope.clientsList = Clients().query();
	$scope.fio = '';
	$scope.result = null;

	$scope.$watch(function(){return $scope.result}, function(val){
		console.log('$scope.result  ',$scope.result)
		if (val == null){
			if ($scope.Mod && 'client' in $scope.Mod.data)
				delete $scope.Mod.data['client']
			return;
		} else {
			$scope.Mod.data['client'] = {};
			$scope.Mod.data['client'].value = val.id;
		}
	})

}