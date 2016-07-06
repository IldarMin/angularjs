function Projects($resource){
	return $resource('/api/projects/:pk/', { pk: '@pk' }, {
		update: {
	    	method: 'PUT'
	    }
	});
};

function LeftMenu($resource){
	return $resource('/api/leftmenu/:pk/', { pk: '@pk' }, {
		query: {
			method: 'GET',
	    	isArray: true,
			cache: true
		}
	})
};

function TypFloors($resource){
	return $resource('/api/typfloors/:pk/', { pk: '@pk' }, {
		update: {
	    	method: 'PUT',
	    	transformRequest: function(data) {
	    		typfloor = data;
	    		typfloor.data.name = typfloor.data.a_name
	    		return angular.toJson(typfloor)
	    	}
	    },
	    query: {
	    	isArray: true,
			method: 'GET',
			transformResponse: function(data) {
				typfloors = angular.fromJson(data);
				typfloors.forEach(function(floor){
					floor.a_name = floor.name;
					floor.data = (typeof(floor.data) == 'object') ? floor.data : [];
					// console.log('floor.data  ', floor.data)
					str_plans = floor.data.map(function(plan){return plan.plan_id}).join(', ');
					floor.name = floor.name + ' (' + str_plans + ')'
				})
				// console.log('typfloors ',typfloors)
				return typfloors;
			}
		}
	});
};

function Cities($resource){
	return $resource('/api/cities/:pk/', { pk: '@pk' });
};

function Plans($resource){
	return $resource('/api/plans/:pk/', { pk: '@pk' }, {
		update: {
	    	method: 'POST',
	    	transformRequest: function(data) {
	            var fd = new FormData();
	            angular.forEach(data.data, function(value, key) {
	                fd.append(key, value);
	            });
	            return fd;
	        },
            headers: {'Content-Type': undefined, enctype: 'multipart/form-data'}
	    },
		save: {
            method: 'POST',
            transformRequest: function(data) {
	            var fd = new FormData();
	            angular.forEach(data.data, function(value, key) {
	                fd.append(key, value);
	            });
	            return fd;
	        },
            headers: {'Content-Type': undefined, enctype: 'multipart/form-data'}
        },
        query: {
			method: 'GET',
	    	isArray: true,
			cache: true
		}
	});
};

function PlansDetailed($resource){
	return $resource('/api/plans/detailed/', {}, {
		query: {
			method: 'GET',
	    	isArray: true,
			cache: true
		}
	})
}

function Statuses($resource, tempStorage){
	return $resource('/api/statuses/:pk/', { pk: '@pk' }, {
		update: {
	    	method: 'PUT'
	    },
	    query: {
	    	method:'GET',
	    	isArray: false,
	    	cache: true
	    }
	});
}

function Forms($resource){
	return $resource('/api/forms/:entity/', { entity: '@entity' }, {
		get: {
			method: 'GET',
			isArray: true,
			cache: true
		}
	});
}

function Buildings($resource){
	return $resource('/api/buildings/:pk/', { pk: '@pk' }, {
		update: {
	    	method: 'PUT'
	    },
	    get: {
			method: 'GET',
			isArray: false,
			transformResponse: function(data) {
				build = angular.fromJson(data);
				// console.log('build  ', build)
				build.name = build.adres+', д.'+build.number;
				return build;
			}
		},
		query: {
			method: 'GET',
			isArray: true,
			transformResponse: function(data) {
				builds = angular.fromJson(data);
				// console.log('builds  ', builds)
				builds.forEach(function(build){
					build.name = build.adres+', д.'+build.number;
				})
				return builds;
			},
			cache: true
		},
	});
}

function Sections($resource){
	return $resource('/api/buildings/:b_pk/sections/:s_pk/', { b_pk: '@b_pk', s_pk: '@s_pk' }, {
		update: {
	    	method: 'PUT'
	    },
	    query: {
			method: 'GET',
			isArray: true,
			transformResponse: function(data) {
				sections = angular.fromJson(data);
				sections.forEach(function(section){
					section.name = 'БС ' + section.number + ' ( Подъезд '+section.entrance+')';
				})
				return sections;
			},
			cache: true
		},
		get: {
			method: 'GET',
			isArray: false,
			transformResponse: function(data) {
				section = angular.fromJson(data);
				section.name = section.number+' ('+section.entrance+')';
				return section;
			}

		}
	});
}

function Sales($resource){
	return $resource('/api/sales/:pk/', {pk: '@pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
}

function Contacts($resource){
	return $resource('/api/contacts/:pk/', {pk: '@pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
}

function Clients($resource, clientStorage){
	return function(){
		var defaultparams = {pk: '@pk', extra: '@extra'};
		var header = {};
		if (clientStorage.checkLastUpdate('clients')){
        	header = { 'Clients-last-update': clientStorage.last_update }
        }
		return $resource('/api/clients/:pk/:extra/', defaultparams, {
			update: {
		    	method: 'PUT'
		    },
		    query: {
				method: 'GET',
				isArray: true,
				headers: header,
				transformResponse: function(data) {
					j_data = angular.fromJson(data);
					clients = clientStorage.set('clients', j_data.clients);
					clients.forEach(function(client){
						client.name = client.fio;
					})
					return clients;
				}
			}
		})
	}
};

function PaginatedClients($resource){
	return $resource('/api/clients/pages/:page', {page: '@page'})
};

function Flats($resource){
	return $resource('/api/flats/:pk/:change_image', {pk: '@pk', change_image: null}, {
		update: {
	    	method: 'PUT'
	    },
	    saveFile: {
	    	method: 'POST',
	    	transformRequest: function(data) {
	            var fd = new FormData();
	            angular.forEach(data.data, function(value, key) {
	                fd.append(key, value);
	            });
	            return fd;
	        },
            headers: {'Content-Type': undefined, enctype: 'multipart/form-data'}
	    }
	})
};

function Comments($resource){
	return $resource('/api/flats/:f_pk/comments/:c_pk', {f_pk: '@f_pk', c_pk: '@c_pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
};

function Deal($resource){
	return $resource('/api/flats/:f_pk/deal/:d_pk', {f_pk: '@f_pk', d_pk: '@d_pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
};

function FlatPayments($resource){
	return $resource('/api/flats/:f_pk/payments/:p_pk', {f_pk: '@f_pk', p_pk: '@p_pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
};

function Payments($resource){
	return $resource('/api/payments/')
};

function FlatSales($resource){
	return $resource('/api/flats/:f_pk/sales/:s_pk', {f_pk: '@f_pk', s_pk: '@s_pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
};

function Users($resource){
	return $resource('/api/users/active', {}, {
	    query: {
			method: 'GET',
			isArray: true,
			cache: true,
			transformResponse: function(data) {
				var j_data = angular.fromJson(data),
					users = [];
				j_data.forEach(function(user){
					if (!!user.first_name || !!user.last_name){
						user.name = [user.first_name, user.last_name].join(' ');
						user.name = user.name.trim();
						users.push(user);
					}
				})
				users = users.sort(function(a, b){
					var an = a.name.toLowerCase(),
						bn = b.name.toLowerCase();
					if (an > bn) return 1;
					if (an < bn) return -1;
					return 0;
				});
				return users;
			}
		},
	})
};

function UserNotifications($resource){
	return $resource('/api/users/notifies', {}, {
		update: {
			method: 'PUT'
		}
	})
};

function Stock($resource){
	return $resource('/api/stock/', {}, {
		query: {
			method: 'GET',
			isArray: true
		}
	})
};

function FlatsListing($resource){
	return $resource('/api/flats_listing/', {}, {
		query: {
			method: 'GET',
			isArray: true
		}
	})
};

function FlatsListingV2($resource){
	return $resource('/api/flats_listing_new/', {}, {
		query: {
			method: 'GET',
			isArray: true
		}
	})
};

function ActionsContacts($resource){
	return $resource('/api/users/actions/contacts', {}, {
		query: {
			method: 'GET',
			isArray: false
		}
	})
};

function ActionsFlats($resource){
	return $resource('/api/users/actions/flats', {}, {
		query: {
			method: 'GET',
			isArray: false
		}
	})
};

function Actions($resource){
	return $resource('/api/users/actions/')
};

function PriceManage($resource){
	return $resource('/api/flats/perform/', {}, {
		update: {
	    	method: 'PUT'
	    }
	})
};

function Search($resource){
	return $resource('/api/flats/search/', {}, {
		save: {
	    	method: 'POST',
	    	isArray: true
	    },
	})
};

function Jarvis($resource){
	return $resource('/api/jarvis/request/', {}, {})
};

function UserGroups($resource){
	return $resource('/api/user_groups/')
};

function NewGroup($resource){
	return $resource('/api/user_groups/', {}, {
		save: {
	    	method: 'POST'
	    }
	})
};

function SystemUsers($resource){
	return $resource('/api/system_users/:pk', {pk: '@pk'}, {
		update: {
	    	method: 'PUT'
	    },
		save: {
	    	method: 'POST'
	    },
	    query: {
			method: 'GET',
			isArray: true,
		},
		get: {
			method: 'GET',
		},
	})
};

function NewUser($resource){
	return $resource('/api/new_user/', {}, {
		save: {
	    	method: 'POST'
	    }
	})
}

function UserPermissions($resource){
	return $resource('/api/user_permissions/')
}

function DashReservations($resource){
	return $resource('api/dashboard/reservations', {})
}

function DashBrones($resource){
	return $resource('api/dashboard/brones', {})
}

function DashReserves($resource){
	return $resource('api/dashboard/reserves', {})
}

function DashSales($resource){
	return $resource('api/dashboard/sales', {})
}

function DashContacts($resource){
	return $resource('api/dashboard/contacts', {})
}

function DashClients($resource){
	return $resource('api/dashboard/clients', {})
}

function DashIncomes($resource){
	return $resource('api/dashboard/incomes', {})
}

function Dash($resource){
	return $resource('api/dashboard/')
}

function Delay($resource){
	return $resource('api/delays/', {})
}

function Reserves($resource){
	return $resource('/api/reserves/:pk/', {pk: '@pk'}, {
		update: {
	    	method: 'PUT'
	    }
	})
}

function Brones($resource){
	return $resource('/api/brones/', {})
}

function Sold($resource){
	return $resource('/api/sold/', {})
}

function Excel($resource){
	return $resource('/api/excel/:entity/', {entity: '@entity'})
}

