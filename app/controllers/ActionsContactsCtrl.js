function ActionsContactsCtrl($scope, $stateParams, users, clients, ActionsContacts, Forms, Contacts) {
	console.log('stateParams ', $stateParams);
	$scope.filter = {}
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.user = {id: 'all', name: 'Все'};
	$scope.filter.client = {};
	$scope.filter.duration = {from: null, to: null};
	$scope.filter.fast_duration = {from: null, to: null};
	$scope.filter.detailed = false;
	$scope.fio = '';
	$scope.phone = '';
	$scope.list = {};
	$scope.edit = {};
	$scope.preload = {'actions': true, 'users': true, 'clients': true};

	initialPaginator = function(data){
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
		$scope.filter.clients = data;
		$scope.preload.clients = false;
	});

	$scope.updateContact = function(contact, field){
		return function(new_val, done_function){
			var data = {};
			data[field] = new_val;
			Contacts.update({pk: contact.id, data: data}, function(){
				done_function();
			});
		}
	}

	Forms.get({entity: 'contact'}, function(fields){
		var sources = fields.filter(function(field){ return field.name == 'source' })[0].choices,
			result = fields.filter(function(field){ return field.name == 'result' })[0].choices,
			typexs = fields.filter(function(field){ return field.name == 'typex' })[0].choices;

		$scope.edit.sources = angular.copy(sources);
		$scope.edit.results = angular.copy(result);
		$scope.edit.typexs = angular.copy(typexs);

		$scope.list.sources = sources;
		$scope.list.typexs = typexs;
		$scope.list.typexs.unshift({id: 'all', name: 'Все'});
		$scope.filter.typex = typexs.filter(function(typex){return typex.id == 1})[0];

		//для таблицы
		$scope.sources = sources.toDictionary();
		$scope.result = result.toDictionary();
		$scope.typex = typexs.toDictionary();

		if ($stateParams){
			if ($stateParams.date_from && $stateParams.date_from != 'null')
				$scope.filter.duration.from = Date.fromStr($stateParams.date_from);
			if ($stateParams.date_to && $stateParams.date_to != 'null')
				$scope.filter.duration.to = Date.fromStr($stateParams.date_to);
			if ($stateParams.date_from || $stateParams.date_to || ($stateParams.date_from == 'null' && $stateParams.date_from == 'null') )
				$scope.filter.detailed = true;
			var selected = $stateParams.type || [];
			$scope.list.sources.map(function(source){return source.selected = (selected.indexOf(source.id)>-1)});
		}

		var data = {};
		data.filter = getFilter();
		ActionsContacts.save(data, function(data){
			initialPaginator(data);
		})
	});

	getDuration = function(obj, duration){
		if (!!duration.from)
			obj.from = duration.from;
		if (!!duration.to)
			obj.to = duration.to;
		return obj;
	};

	getFilter = function(){
		var obj = {};
		obj = ($scope.filter.detailed) ? getDuration(obj, $scope.filter.duration) : getDuration(obj, $scope.filter.fast_duration);
		if ($scope.filter.user.id != 'all')
			obj.user = $scope.filter.user.id;
		if ($scope.list.sources.some(function(source){return source.selected}))
			obj.sources = $scope.list.sources.filter(function(source){return source.selected}).map(function(source){return source.id});
		if ($scope.filter.client)
			obj.client = $scope.filter.client.id;
		if ($scope.filter.typex)
			obj.typex = $scope.filter.typex.id;
		return obj;
	};

	$scope.filterActions = function(){
		$scope.preload = true;
		var data = {};
		data.filter = getFilter();
		ActionsContacts.save(data, function(data){
			initialPaginator(data);
		});
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
			ActionsContacts.save(data, function(data){
				console.log('ActionsContacts  ', data);
				$scope.actions = data.objects;
				self.setActive(current);
				$scope.preload_page = false;
			})
		}
	};



}
