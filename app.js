var app = angular.module('system', [
	'ngResource',
 	'ui.router',
 	'ngCookies',
 	'dndLists',
 	'ui.mask',
 	'angular.filter',
 	'ngSanitize',
 	'angularUtils.directives.dirPagination'
 	])

angular.element(document).ready(function() {
  $.get('api/users/settings', function(data) {
    permissionList = data['permissions'];
    userGroup = data['group'];
    angular.bootstrap(document, ['system']);
  });
});

app.constant('settings', {})

app.factory('Projects', Projects)
app.factory('Cities', Cities)
app.factory('Plans', Plans)
app.factory('PlansDetailed', PlansDetailed)
app.factory('Forms', Forms)
app.factory('TypFloors', TypFloors)
app.factory('ModalServ', ModalServ)
app.factory('Buildings', Buildings)
app.factory('Statuses', Statuses)
app.factory('LeftMenu', LeftMenu)
app.factory('Sections', Sections)
app.factory('Sales', Sales)
app.factory('Flats', Flats)
app.factory('Contacts', Contacts)
app.factory('Clients', Clients)
app.factory('PaginatedClients', PaginatedClients)
app.factory('Comments', Comments)
app.factory('Deal', Deal)
app.factory('Users', Users)
app.factory('FlatSales', FlatSales)
app.factory('Stock', Stock)
app.factory('Actions', Actions)
app.factory('PriceManage', PriceManage)
app.factory('Search', Search)
app.factory('FlatPayments', FlatPayments)
app.factory('Payments', Payments)
app.factory('Jarvis', Jarvis)
app.factory('ActionsContacts', ActionsContacts)
app.factory('ActionsFlats', ActionsFlats)
app.factory('FlatsListing', FlatsListing)
app.factory('FlatsListingV2', FlatsListingV2)

app.factory('HelpFunction', HelpFunction)
app.factory('UserGroups', UserGroups)
app.factory('UpdateFactory', UpdateFactory)
app.factory('UserPermissions', UserPermissions)
app.factory('UserNotifications', UserNotifications)
app.factory('NewGroup', NewGroup)
app.factory('SystemUsers', SystemUsers)
app.factory('NewUser', NewUser)
app.factory('Dash', Dash)
app.factory('DashReservations', DashReservations)
app.factory('DashReserves', DashReserves)
app.factory('DashBrones', DashBrones)
app.factory('DashSales', DashSales)
app.factory('DashContacts', DashContacts)
app.factory('DashClients', DashClients)
app.factory('DashIncomes', DashIncomes)
app.factory('Delay', Delay)
app.factory('Reserves', Reserves)
app.factory('Brones', Brones)
app.factory('Sold', Sold)
app.factory('Excel', Excel)

app.factory('DateFormat', DateFormat)
app.factory('PlansFilters', PlansFilters)
app.factory('UserRole', UserRole)
// app.factory('BuildFirstSection', BuildFirstSection)

app.filter('price', price)
app.filter('ClientsFilter', ClientsFilter)
app.filter('SumOf', SumOf)
app.filter('SumOfPayments', SumOfPayments)
app.filter('roomsArea', roomsArea)
app.filter('PaymentsFilter', PaymentsFilter)
app.filter('DelaysFilter', DelaysFilter)
app.filter('ReservesFilter', ReservesFilter)
app.filter('BronesFilter', BronesFilter)

app.directive('inlineEditorPencil', inlineEditorPencil)
app.directive('dropdownMenu', dropdownMenu)
app.directive('multipleSelect', multipleSelect)
// app.directive('format', format)
app.directive('inputConnection', inputConnection)
app.directive('inputSearchFio', inputSearchFio)
app.directive('inputSearchFioTemp', inputSearchFioTemp)
app.directive('inputSearch', inputSearch)
app.directive('leftMenuDir', leftMenuDir)
app.directive('toggleElem', toggleElem)
app.directive('activeElem', activeElem)
app.directive('tagsInput', tagsInput)
app.directive('multipleInput', multipleInput)
app.directive('oneSelect', oneSelect)
app.directive('oneSelectStatus', oneSelectStatus)
app.directive('fileInput', fileInput)
app.directive('checkboxSet', checkboxSet)
app.directive('formErrors', formErrors)
app.directive('formInput', formInput)
app.directive('jqdatepicker', jqdatepicker)
app.directive('jqdatepickerCallback', jqdatepickerCallback)
app.directive('bootpopoverimg', bootpopoverimg)
app.directive('bootpopovernew', bootpopovernew)
app.directive('jqcalendar', jqcalendar)
app.directive('niceScroll', niceScroll)
app.directive('chartLines', chartLines)
app.directive('oneSelectGroup', oneSelectGroup)
app.directive('multipleSelectGroup', multipleSelectGroup)
app.directive('hasPermission', hasPermission)
app.directive('sortItem', sortItem)
app.directive('inlineEditor', inlineEditor)
app.directive('jqFlotChart', jqFlotChart)
app.directive('fastDate', fastDate)
app.directive('ignoreMouseWheel', ignoreMouseWheel)
app.directive('autonumber', autonumber)

app.controller('ProjectsCtrl', ProjectsCtrl)
app.controller('PlansCtrl', PlansCtrl)
app.controller('ViewCtrl', ViewCtrl)
app.controller('ViewCreateCtrl', ViewCreateCtrl)
app.controller('TypFloorsCtrl', TypFloorsCtrl)
app.controller('FlatCtrl', FlatCtrl)
app.controller('PlanCreateCtrl', PlanCreateCtrl)
app.controller('SalesCtrl', SalesCtrl)
app.controller('SalesEditCtrl', SalesEditCtrl)
app.controller('SalesCreateCtrl', SalesCreateCtrl)
app.controller('ContactsCreateCtrl', ContactsCreateCtrl)
app.controller('ClientsCtrl', ClientsCtrl)
app.controller('PaginatedClientsCtrl', PaginatedClientsCtrl)
app.controller('StockCtrl', StockCtrl)
app.controller('StockV2Ctrl', StockV2Ctrl)
app.controller('BuildingsCtrl', BuildingsCtrl)
app.controller('PriceManageCtrl', PriceManageCtrl)
app.controller('PriceManageCostCtrl', PriceManageCostCtrl)
app.controller('TotalCtrl', TotalCtrl)
app.controller('PriceManageStatusCtrl', PriceManageStatusCtrl)
app.controller('PaymentsCtrl', PaymentsCtrl)
app.controller('ClientCtrl', ClientCtrl)
app.controller('topnavCtrl', topnavCtrl)
app.controller('TeamCtrl', TeamCtrl)
app.controller('TeamUserCtrl', TeamUserCtrl)
app.controller('DashboardCtrl', DashboardCtrl)

app.controller('ActionsCtrl', ActionsCtrl)
app.controller('ActionsContactsCtrl', ActionsContactsCtrl)
app.controller('ActionsFlatsCtrl', ActionsFlatsCtrl)
app.controller('DelayFlatsCtrl', DelayFlatsCtrl)
app.controller('ReservesCtrl', ReservesCtrl)
app.controller('BronesCtrl', BronesCtrl)
app.controller('SoldCtrl', SoldCtrl)


app.factory('clientStorage', function($cookies){
	var storage = {},
		self = this,
		last_update = null,
		ls = localStorage;
	self.data = {};

	storage.get = function(entity){
		return JSON.parse(ls.getItem(entity)) || [];
	};

	storage.local_search = function(data){
		var ids = data.map(function(obj){return obj.id});
		return {
			match: function(id){
				var idx = ids.indexOf(id);
				if (idx>-1)
					this.idx = idx;
				return (idx>-1);
			},
			idx: null
		}
	}

	storage.set = function(entity, data){
		var local_data = this.get(entity);
		var local_search = this.local_search(local_data);
		data.forEach(function(obj){
			if (local_search.match(obj.id)){
				local_data[local_search.idx] = obj;
			}
			else {
				local_data.push(obj);
			}
		})
		ls.setItem(entity, JSON.stringify(local_data));
		var time = new Date();
		ls.setItem(entity+'-last-update',  JSON.stringify(time));
		return local_data;
	};

	storage.check = function(entity){
		return !!JSON.parse(ls.getItem(entity))
	};

	storage.checkLastUpdate = function(entity){
		var project = ls.getItem(entity+'-project');
		if (project != $cookies.get('project')){
			ls.setItem(entity+'-last-update', null);
			ls.setItem(entity, null);
			ls.setItem(entity+'-project', $cookies.get('project'));
		}
		try {
			var last_update =  JSON.parse(ls.getItem(entity+'-last-update'));
		} catch (err) {
			var last_update =  ls.getItem(entity+'-last-update');
		}
		console.log('last_update  ', last_update)
		if (!!last_update && last_update != 'null')
			this.last_update = last_update;
		return (!!last_update && last_update != 'null');
	};

	storage.removeItem = function(entity){
		console.log('removeItem')
		ls.setItem(entity+'-last-update', null);
		ls.setItem(entity, null);
		ls.setItem(entity+'-project', $cookies.get('project'));
		ls.setItem('bar', null);
	};
	return storage;
})

app.factory('tempStorage', function(){
	var storage = {},
		self = this;
	self.data = {};

	storage.set = function(item, data){
		self.data[item] = data;
	};

	storage.get = function(item){
		return self.data[item];
	};

	storage.check = function(item){
		return !!self.data[item];
	};

	return storage;
})


app.config(['$httpProvider', '$resourceProvider', '$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', 'uiMask.ConfigProvider', '$provide', 'settings',
	function($httpProvider, $resourceProvider, $stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $uiMaskConfigProvider, $provide, settings){
	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
	$resourceProvider.defaults.stripTrailingSlashes = false;
  	$uiMaskConfigProvider.clearOnBlur(false);
	$urlMatcherFactoryProvider.strictMode(false);
	$urlRouterProvider.otherwise("/");
	$stateProvider
		.state('main',{
			url:'/',
			templateUrl: "/assets/app_main/views/dashboard.html",
			controller: 'DashboardCtrl',
		})
		.state('plan_new',{
			url: "/plans/add/",
			templateUrl: "/assets/app_main/views/plan_new.html",
			controller: "PlanCreateCtrl"
		})
	    .state('projects', {
			url: "/projects",
			templateUrl: "/assets/app_main/views/projects.html",
			controller: 'ProjectsCtrl',
			controllerAs: 'proj',
			resolve: {
				projects_list: function(Projects) {
					return Projects.query();
				}
			}
	    })
	   	.state('payments', {
			url: "/income",
			templateUrl: "/assets/app_main/views/payments.html",
			controller: 'PaymentsCtrl',
			resolve: {
				payments: function(Payments) {
					return Payments.query();
				},
				clients: function(Clients){
					return Clients().query();
				},
				buildings: function(Buildings){
					return Buildings.query();
				},
				users: function(Users){
					return Users.query();
				}
			}
	    })
	   	.state('build_view', {
	    	url: '/buildings/:b_pk/sections/:s_pk',
	    	templateUrl: "/assets/app_main/views/build_view.html",
			controller: 'ViewCtrl',
			resolve: {
				building_pk: function($stateParams){
 					return $stateParams.b_pk;
				},
				section_pk: function($stateParams){
 					return $stateParams.s_pk;
				},
				building: function($stateParams, Buildings){
					b_pk = $stateParams.b_pk;
					return Buildings.get({pk: b_pk});
				},
				sections: function(Sections, $stateParams){
					b_pk = $stateParams.b_pk;
					return Sections.query({b_pk: b_pk})
				},
				statuses: function(Statuses){
					return Statuses.query()
				},
				plans: function(Plans){
					return Plans.query()
				},
				typfloors: function(TypFloors){
					return TypFloors.query();
				},
				permissions: function(settings){
					console.log('settings  ', settings.permissions)
					return settings.permissions;
				}
			}
	    })
	    .state('build_new', {
	    	url: '/buildings/add/',
	    	templateUrl: "/assets/app_main/views/build_new.html",
			controller: 'ViewCreateCtrl'
	    })
	   	.state('plans', {
	    	url: '/plans',
	    	templateUrl: "/assets/app_main/views/plans.html",
			controller: 'PlansCtrl',
			controllerAs: 'Plan',
			resolve: {
				plans_list: function(Plans) {
					return Plans.query();
				}
			}
	    })
	    .state('typfloors', {
	    	url: '/typfloors',
	    	templateUrl: '/assets/app_main/views/typfloors.html',
	    	controller: 'TypFloorsCtrl',
	    	controllerAs: 'typfl',
			resolve: {
				typfloors_list: function(TypFloors) {
					return TypFloors.query();
				}
			}
	    })
	    .state('buildings', {
			url: "/buildings",
			templateUrl: "/assets/app_main/views/buildings.html",
			controller: 'BuildingsCtrl',
			resolve: {
				buildings: function(Buildings) {
					return Buildings.query();
				}
			}
	    })
	    .state('flat', {
	    	url: '/flats/:flat_pk',
	    	templateUrl: '/assets/app_main/views/flat_card.html',
	    	controller: 'FlatCtrl',
	    	resolve: {
	    		flat_pk: function($stateParams){
	    			return $stateParams.flat_pk;
	    		},
	    		flat: function(Flats, $stateParams){
	    			return Flats.get({pk: $stateParams.flat_pk});
	    		},
	    		statuses: function(Statuses){
					return Statuses.query();
				},
				flat_sales: function(FlatSales, $stateParams){
					return FlatSales.query({f_pk: $stateParams.flat_pk});
				},
				comments: function(Comments, $stateParams){
					return Comments.query({f_pk: $stateParams.flat_pk});
				},
				deal: function(Deal, $stateParams){
					return Deal.query({f_pk: $stateParams.flat_pk});
				},
				payments: function(FlatPayments, $stateParams){
					return FlatPayments.query({f_pk: $stateParams.flat_pk});
				},
				users: function(Users){
					return Users.query();
				},
				clients: function(Clients){
					return Clients().query();
				}
	    	}
	    })
	    .state('contact_new', {
	    	url: '/contacts/add/',
	    	templateUrl: '/assets/app_main/views/contact_new.html',
	    	controller: 'ContactsCreateCtrl'
	    })
	    .state('clients', {
	    	url: '/clients',
	    	templateUrl: '/assets/app_main/views/clients.html',
	    	controller: 'ClientsCtrl',
	    	resolve: {
	    		clients: function(Clients){
	    			return Clients().query();
	    		},
	    		users: function(Users){
	    			return Users.query();
	    		}
	    	}
	    })
	    .state('client_card', {
	    	url: '/clients/:client_pk',
	    	templateUrl: '/assets/app_main/views/client_card.html',
	    	controller: 'ClientCtrl',
	    	resolve: {
	    		client: function(Clients, $stateParams){
	    			return Clients().get({pk: $stateParams.client_pk});
	    		},
	    		client_form: function(Forms){
	    			return Forms.get({entity: 'client'});
	    		},
	    		contact_form: function(Forms){
	    			return Forms.get({entity: 'contact'});
	    		},
	    		passports_form: function(Forms){
	    			return Forms.get({entity: 'passports'});
	    		},
	    		requisites_form: function(Forms){
	    			return Forms.get({entity: 'requisites'});
	    		},
	    		users: function(Users){
	    			return Users.query();
	    		}
	    	}
	    })
	   	.state('sales', {
	    	url: '/sales',
	    	templateUrl: '/assets/app_main/views/sales.html',
	    	controller: 'SalesCtrl',
	    	resolve: {
				sales: function(Sales){
					return Sales.query();
				}
	    	}
	    })
	    .state('sales_add', {
	    	url: '/sales/edit/',
	    	templateUrl: '/assets/app_main/views/sales_edit.html',
	    	controller: 'SalesCreateCtrl',
	    	resolve: {
				buildings: function(Buildings){
					return Buildings.query();
				},
				sales: function(Sales){
					return Sales.query();
				},
				plans_detailed: function(PlansDetailed){
					return PlansDetailed.query();
				}
	    	}
	    })
	    .state('sales_edit', {
	    	url: '/sales/edit/:sale_pk',
	    	templateUrl: '/assets/app_main/views/sales_edit.html',
	    	controller: 'SalesEditCtrl',
	    	resolve: {
				sale: function(Sales, $stateParams){
					console.log('$stateParams  ', $stateParams.sale_pk)
					if (!$stateParams.sale_pk) return {};
					return Sales.get({pk: $stateParams.sale_pk});
				},
				buildings: function(Buildings){
					return Buildings.query();
				},
				sales: function(Sales){
					return Sales.query();
				},
				plans_detailed: function(PlansDetailed){
					return PlansDetailed.query();
				}
	    	}
	    })
	    .state('total', {
	    	url: '/total',
	    	templateUrl: '/assets/app_main/views/total_new.html',
	    	controller: 'TotalCtrl',
	    	resolve: {
	    		total: function(Stock){
	    			return Stock.query();
	    		},
	    		statuses: function(Statuses){
					return Statuses.query();
				}
	    	}
	    })
	    .state('stock', {
	    	url: '/stock?area_from&area_to&price_from&price_to&states&statuses&buildings&rooms&plans',
	    	templateUrl: '/assets/app_main/views/stock.html',
	    	controller: 'StockCtrl',
	    	resolve: {
	    		stock: function(FlatsListing){
	    			return FlatsListing.query();
	    		},
	    		buildings: function(Buildings){
					return Buildings.query();
				},
				statuses: function(Statuses){
					return Statuses.query()
				},
				plans: function(Plans){
					return Plans.query()
				}
	    	}
	    })
	   	.state('stock_v2', {
	    	url: '/stock_v2?area_from&area_to&price_from&price_to&states&statuses&buildings&rooms&plans',
	    	templateUrl: '/assets/app_main/views/stock_v2.html',
	    	controller: 'StockV2Ctrl',
	    	resolve: {
	    		stock: function(FlatsListingV2){
	    			return FlatsListingV2.query();
	    		},
	    		buildings: function(Buildings){
					return Buildings.query();
				},
				statuses: function(Statuses){
					return Statuses.query()
				},
				plans: function(Plans){
					return Plans.query()
				}
	    	}
	    })
	    .state('actions_contacts', {
	    	url: '/actions/contacts?date_from&date_to&type',
	    	templateUrl: '/assets/app_main/views/actions_contacts.html',
	    	controller: 'ActionsContactsCtrl',
	    	resolve: {
				users: function(Users){
					return Users.query();
				},
				clients: function(Clients){
					return Clients().query();
				}
			}
	    })
	    .state('actions_flats', {
	    	url: '/actions/flats?date_from&date_to&type',
	    	templateUrl: '/assets/app_main/views/actions_flats.html',
	    	controller: 'ActionsFlatsCtrl',
	    	resolve: {
				users: function(Users){
					return Users.query();
				},
				statuses: function(Statuses){
					return Statuses.query();
				},
				clients: function(Clients){
					return Clients().query();
				}
	    	}
	    })
	   	.state('price_manage',{
	    	url: '/price_manage',
	    	templateUrl: '/assets/app_main/views/price_manage.html',
	    	controller: 'PriceManageCtrl',
	    })
	    .state('price_manage.cost',{
	    	url: '/cost',
	    	templateUrl: '/assets/app_main/views/price_manage_cost.html',
	    	controller: 'PriceManageCostCtrl',
	    	resolve: {
				buildings: function(Buildings){
					return Buildings.query();
				},
				plans_detailed: function(PlansDetailed){
					return PlansDetailed.query();
				}
	    	}
	    })
	   	.state('price_manage.status',{
	    	url: '/status',
	    	templateUrl: '/assets/app_main/views/price_manage_status.html',
	    	controller: 'PriceManageStatusCtrl',
	    	resolve: {
				buildings: function(Buildings){
					return Buildings.query();
				},
				statuses: function(Statuses){
					return Statuses.query();
				},
				plans_detailed: function(PlansDetailed){
					return PlansDetailed.query();
				}
	    	}
	    })
	    .state('price_manage.rise',{
	    	url: '/rise',
	    	templateUrl: '/assets/app_main/views/rise.html',
	    	controller: 'PriceManageCtrl'
	    })
	    .state('team', {
	    	url: '/team',
	    	templateUrl: 'assets/app_main/views/team.html',
	    	controller: 'TeamCtrl',
	    	resolve: {
	    		user_groups: function(UserGroups){
	    			return UserGroups.query();
	    		},
	    		users: function(SystemUsers){
	    			return SystemUsers.query();
	    		},
	    		user_permissions: function(UserPermissions){
	    			return UserPermissions.query();
	    		}
	    	}
	    })
	   	.state('team_user', {
	    	url: '/team/:id',
	    	templateUrl: 'assets/app_main/views/team_user.html',
	    	controller: 'TeamUserCtrl',
	    	resolve: {
	    		user: function(SystemUsers, $stateParams){
	    			return SystemUsers.get({pk: $stateParams.id});
	    		},
	    		user_groups: function(UserGroups){
	    			return UserGroups.query();
	    		},
	    	}
	    })
	    .state('delays', {
	    	url: '/delays',
	    	templateUrl: 'assets/app_main/views/delayflats.html',
			controller: 'DelayFlatsCtrl'
	    })
	    .state('reserves', {
	    	url: '/reserves?date_from&date_to&type',
	    	templateUrl: 'assets/app_main/views/reserves.html',
			controller: 'ReservesCtrl',
			resolve: {
				reserves: function(Reserves){
					return Reserves.query();
				},
				clients: function(Clients){
					return Clients().query();
				},
				users: function(Users){
					return Users.query();
				},
				statuses: function(Statuses){
					return Statuses.query();
				},
				buildings: function(Buildings){
					return Buildings.query();
				}
			}
	    })
	    .state('brones', {
	    	url: '/brones?date_from&date_to&type',
	    	templateUrl: 'assets/app_main/views/brones.html',
			controller: 'BronesCtrl',
			resolve: {
				brones: function(Brones){
					return Brones.query();
				},
				clients: function(Clients){
					return Clients().query();
				},
				users: function(Users){
					return Users.query();
				}
			}
	    })
	    .state('sold', {
	    	url: '/sold?date_from&date_to&type',
	    	templateUrl: 'assets/app_main/views/sold.html',
			controller: 'SoldCtrl',
			resolve: {
				sold: function(Sold){
					return Sold.query();
				},
				clients: function(Clients){
					return Clients().query();
				},
				users: function(Users){
					return Users.query();
				}
			}
	    })
	    .state('test', {
	    	url: '/test',
	    	templateUrl: 'assets/app_main/views/test.html'
	    })

	$provide.decorator('$q', function ($delegate) {
		var defer = $delegate.defer;
	    $delegate.defer = function() {
			var deferred = defer();
			deferred.promise.then(null, function(response) {
	        	var redirect_to = window.location.origin + '/login?next=/';
	      		if (response.status == 406)
	      			window.location.replace(redirect_to);
	        });
	      	return deferred;
	    };
		return $delegate;
	});

}])

function test(limit, data){
	var test = [];
	test = data;
	var limit = limit,
		i=0;
	data.forEach(function(client){
		if (i>=limit)
			return;
		test.push(client);
		i++;
	})
	// localStorage.setItem("bar", '')
	// console.log(localStorage.setItem("bar", JSON.stringify(test)));
	// console.log(localStorage.getItem("bar").length);
	// console.log(JSON.parse(localStorage.getItem("bar")));
	console.log('NEW LIMIT ', limit);
};


app.run(['$cookies', 'settings', '$window', '$rootScope', 'Clients', 'clientStorage',
	function($cookies, settings, $window, $rootScope, Clients, clientStorage) {
	settings.base_href = $window.location.origin;
	$rootScope.$on('$stateChangeSuccess', function() {
	   document.body.scrollTop = document.documentElement.scrollTop = 0;
	});
	settings.permissions = permissionList;
	settings.group = userGroup;
	clientStorage.removeItem('clients');
}]);

