"use strict";
function StockV2Ctrl($scope, $filter, $sanitize, $window, $stateParams, $state, $location,
	 				Stock, UserRole, Excel, FlatsListing,
	 				stock, buildings, statuses, plans){
	console.log('---StockCtrl---')
	$scope.Math = Math;
	var stock_by_room = {},
		set_filter = {},
		groups = [],
		initial_filter = {};
	$scope.preload = true;
	$scope.filter = {};
    $scope.list = {};
    $scope.isDevelopers = UserRole.isDevelopers();
   	$scope.rooms_names = ['', 'Однокомнатные', 'Двухкомнатные', 'Трехкомнатные', 'Четырехкомнатные'];
   	$scope.filter.rooms = [{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];
    $scope.filter.area = {from: null, to: null};
    $scope.filter.price = {from: null, to: null};
   	$scope.filter.buildings = [];
    $scope.filter.plans = [];
    $scope.filter.states = [];
    $scope.filter.statuses = [];

	initFilter();

	function initFilter(){
        $scope.filter.detailed = true;
        if (UserRole.isDirectors() || UserRole.isDevelopers())
        	$scope.filter.detailed = false;
        statuses.$promise.then(function(data){
            $scope.filter.states = angular.copy(data['states']);
            $scope.filter.buildings = buildings;
    		$scope.filter.plans = plans;
           	groups = angular.copy(data['groups']);
            initial_filter = setFilter($stateParams);
            initStock();
        })
    };

    function initStock(){
    	stock.$promise.then(function(data){
			data.forEach(function(plan){
				if (!plan || !plan.flats) return;
				var rooms_count = plan.rooms_count;
				stock_by_room[rooms_count] = stock_by_room[rooms_count] || [];
				for (var price in plan.flats){
					var plan_price = flatsParse(plan.flats[price]);
					// plan_price.area = plan.area;
					plan_price.name = plan.name;
					plan_price.rooms_count = plan.rooms_count;
					plan_price.plan_img = plan.plan_img;
					plan_price.flats = plan.flats[price];
					stock_by_room[rooms_count].push(plan_price);
				}
			})
			filterEverything(initial_filter);
			$scope.preload = false;
	    })
	}

	var flatsParse = function(flats, plan_area){
		var sections = {},
			info = {},
			buildings = {},
			i_buildings = {},
			i_sections = {},
			i_floors = {};

		info.count = flats.length;

		info.installment_price = {price: null, one: null, id: null};
		info.super_price = {price: null, one: null, id: null};
		info.price = {price: null, one: null, id: null};

		// info.installment_price = null;
		// info.super_price = null;
		// info.price = null;

		// info.installment_price_id = null;
		// info.super_price_id = null;
		// info.price_id = null;

		// info.installment_price_one = null;
		// info.super_price_one = null;
		// info.price_one = null;

		info.max_area = null;
		info.min_area = null;
		info.sum = {price: 0 , super_price: 0, installment_price: 0, area: 0};

		var getHierarchy = function(flat){
			var b = flat.building.id,
				s = flat.section.number,
				f = flat.floor.number;

			buildings[b] = buildings[b] || {sections: {}, building: flat.building};
			buildings[b].sections[s] = buildings[b].sections[s] || {floors: {}, section: flat.section};
			buildings[b].sections[s].floors[f] = buildings[b].sections[s].floors[f] || {flats: [], floor: flat.floor};
			buildings[b].sections[s].floors[f].flats.push({'id': flat.id, 'number': flat.number});
		};

		var getSection = function(flat){
			sections[flat.section.id] = sections[flat.section.id] || {};
			sections[flat.section.id].info =
				sections[flat.section.id].info || {'section': flat.section.number, 'building': flat.building.number};
			sections[flat.section.id].list = sections[flat.section.id].list || [];
			sections[flat.section.id].list.push(flat);
		};

		var setMinByPrice = function(obj, price, area, id){
			obj.price = obj.price || price;
			obj.one = obj.one || price/area;
			obj.id = obj.id || id;

			if (obj.price > price){
				obj.price = price;
				obj.one = price/area;
				obj.id = id;
			};
		};

		var getInfo = function(flat){
			if (flat.building == null)
				console.log('error flat    ', flat)
			info.sum.price += flat.price;
			info.sum.super_price += (flat.super_price > 0 ) ? flat.super_price : flat.price;
			info.sum.installment_price += flat.installment_price;
			info.sum.area += flat.area;

			i_buildings[flat.building.number] = flat.building;
			i_sections[flat.section.number] = flat.section;
			i_sections[flat.section.number]['building'] = flat.building.id;
			i_floors[flat.floor.number] = '';


			setMinByPrice(info.installment_price, flat.installment_price, flat.area, flat.id)
			setMinByPrice(info.super_price, flat.super_price, flat.area, flat.id)
			setMinByPrice(info.price, flat.price, flat.area, flat.id)

			// info.installment_price = info.installment_price || flat.installment_price;
			// info.installment_price_one = info.installment_price_one || flat.installment_price/flat.area;
			// info.installment_price_id = info.installment_price_id || flat.id;

			// if (info.installment_price > flat.installment_price){
			// 	info.installment_price = flat.installment_price;
			// 	info.installment_price_one = flat.installment_price/flat.area;
			// 	info.installment_price_id = flat.id;
			// };

			// info.super_price = info.super_price || flat.super_price;
			// info.super_price_one = info.super_price_one || flat.super_price/flat.area;
			// if (info.super_price > flat.super_price){
			// 	info.super_price = flat.super_price;
			// 	info.super_price_one = flat.super_price/flat.area;
			// };

			// info.price = info.price || flat.price;
			// info.price_one = info.price_one || flat.price/flat.area;
			// if (info.price > flat.price){
			// 	info.price = flat.price;
			// 	info.price_one = flat.price/flat.area;
			// };

			info.max_area = info.max_area || flat.area;
			info.max_area = (flat.area > info.max_area) ? flat.area : info.max_area;

			info.min_area = info.min_area || flat.area;
			info.min_area = (flat.area < info.min_area) ? flat.area : info.min_area;

			// info.super_price = info.super_price || flat.super_price;
			// info.installment_price = info.installment_price || flat.installment_price;
			// info.price = info.price || flat.price;
			// info.max_area = info.price || flat.price;
			// info.min_area = info.price || flat.price;
		};

		var shortStrFloors = function(floors){
			var new_str = floors[0] || '';
			for(var i=1; i<floors.length; i++){
				if (floors[i-1] == floors[i]-1 && floors[i+1] == +floors[i]+1){
					if (new_str[new_str.length-1] != '-')
						new_str += '-';
				}
				else {
					if (new_str[new_str.length-1] != '-')
						new_str += ', '
					new_str += floors[i];
				}
			}
			return new_str;
		};

		var getFlatsHtml = function(l_sections){
			var html = '';
			if (l_sections == undefined) return;
			for (var key in l_sections){
				html += '<div class="popover-section-block">БС '+l_sections[key].info.section+' дом '+l_sections[key].info.building+'<br>';
				var floors = {}, p;
				l_sections[key].list.forEach(function(flat){
					p = (floors[flat.floor.id]) ? ', ' : '';
					floors[flat.floor.id] = floors[flat.floor.id] || flat.floor.number+': ';
					floors[flat.floor.id] += p+'<a href="#flats/'+flat.id+'">'+flat.number+'</a>';
				})
				for (var key_f in floors){
					html += floors[key_f] + '<br>';
				}
				html +='</div>';
			}
			return html;
		};

		var getSectionsHtml = function(l_sections){
			var hrefs = [];
			for (var number in l_sections){
				var str = "<a href='#/buildings/"+l_sections[number].building+"/sections/"+l_sections[number].id+"'>"+number+"</a>";
				hrefs.push(str);
			};
			return hrefs.join(', ');
		};

		var getBuildingsHtml = function(l_buildings){
			var hrefs = [];
			for (var number in l_buildings){
				var str = "<a href='#/buildings/"+l_buildings[number].id+"/sections/'>"+number+"</a>";
				hrefs.push(str);
			};
			return hrefs.join(', ');
		};

		var createHref = function(obj){
			return "<a href='#/flats/"+obj.id+"'>"+$filter('price')(Math.round(obj.price))+"</a>";
		};

		flats.forEach(function(flat){
			getSection(flat);
			getInfo(flat);
		})
		info.buildings = Object.keys(i_buildings).join(', ');
		// info.buildings = i_buildings;
		info.sections = i_sections;
		info.floors = shortStrFloors(Object.keys(i_floors));

		// info.f_super_price = (info.super_price.price>0) ? $filter('price')(Math.round(info.super_price.price)) : '-';
		// info.f_installment_price = $filter('price')(Math.round(info.installment_price.price));
		// info.f_price = $filter('price')(Math.round(info.price.price));

		info.f_super_price = (info.super_price.price>0) ? createHref(info.super_price) : '-';
		info.f_installment_price = createHref(info.installment_price);
		info.f_price = createHref(info.price);

		info.a_super_price = (info.super_price.one>0) ? $filter('price')(Math.round(info.super_price.one)) : '-';
		info.a_price = $filter('price')(Math.round(info.price.one));
		info.a_installment_price = $filter('price')(Math.round(info.installment_price.one));

		info.f_area = [info.min_area, info.max_area].join(' - ');

		return {
			flats_list: sections,
			info: info,
			flats_html: getFlatsHtml(sections),
			section_html: getSectionsHtml(info.sections),
			building_html: getBuildingsHtml(i_buildings)
		}
	};

	var statusesFilter = function(states){
    	var selected_states = states.filter(function(state){return state.selected}),
			uniq = {},
			filter_statuses = [];

		//формируем список id статусов(пересечение + разница)
		selected_states.forEach(function(state){
			state.include.forEach(function(id){
                uniq[id] = true;
            })
		});

		//формируем список статусов по группам
		groups.forEach(function(group){
			var list = [];
			group.statuses.forEach(function(status){
				if (uniq[status.id] || selected_states.length == 0){
					status.selected = false;
					list.push(status);
				}
			})
			if (list.length>0){
				//ставлю по умолчанию группы статусов, пока косячно
				var group_in = angular.copy(group);
				delete group_in['statuses'];
				group_in.selected = false;
				filter_statuses.push({parent: group_in, list: list});
			}
		});
		$scope.filter.statuses = filter_statuses;
    };

	$scope.changeState = function(states){
    	statusesFilter(states)
    };

    $scope.$watch(function(){return $scope.filter.rooms}, function(newV, oldV){
    	console.log('selected_rooms ')
        if ($scope.filter.rooms == undefined) return;
		var selected_rooms = newV.filter(function(room){return room.selected}).map(function(room){return room.id});
		if (selected_rooms.length == 0) {
			$scope.filter.plans = plans;
			return;
		}
		$scope.filter.plans = plans.filter(function(plan){
            if (selected_rooms.indexOf(plan.rooms_count)==-1)
            	plan.selected = false;
            return (selected_rooms.indexOf(plan.rooms_count)>-1);
        })
    }, true)

    var getByFilter = function(array, filter){
    	var byMultiSelect = function(selected, item, field){
    		var field = field || 'id';
    		return (selected.length == 0 || selected.indexOf(item[field])>-1);
    	};

    	var byDuration = function(filter, item){
    		return ((!!filter.from && filter.from <= item || !filter.from) &&
			 		(!!filter.to && filter.to >= item || !filter.to));
    	};

    	// var byArea = function(filter, min_area, max_area){
    	// 	return ((filter.from && filter.from <= max_area || !filter.from) &&
			 	// 	(filter.to && filter.to >= min_area || !filter.to));
    	// };

		var inPlan = function(filter, plan){
			return (byMultiSelect(filter.rooms, plan, 'rooms_count') && byMultiSelect(filter.plans, plan, 'name'));
		};

		var inFlats = function(filter, flats){
			var filtered_flats = flats.filter(function(flat){
					return byMultiSelect(filter.buildings, flat['building']) &&
					byMultiSelect(filter.states, flat['state']) &&
					byMultiSelect(filter.statuses, flat['status']) &&
					byDuration(filter.area, flat['area']) &&
					byDuration(filter.price, flat['price']);
				});
			return filtered_flats;
		};

		var setRoomsInfo = function(sum_info, plan){
			sum_info.area += plan.info.sum.area;
			sum_info.count += plan.info.count;
			sum_info.sum_price += plan.info.sum.price;
			sum_info.sum_super_price += plan.info.sum.super_price;
			sum_info.sum_installment_price += plan.info.sum.installment_price;
			return sum_info;
		};

    	if (array == undefined) return;
    	var filter = filter,
    		filtered = [],
    		sum_info = {area: 0 , sum_price: 0, sum_super_price: 0, count: 0, sum_installment_price: 0},
    		filter_without_flats = (!filter.area.from && !filter.area.to && !filter.price.from && !filter.price.to &&
    			filter.buildings.length == 0 && filter.states.length == 0 && filter.statuses.length == 0);

    	array.forEach(function(plan){
			if (inPlan(filter, plan)){
				if (plan.flats.length == 0 && filter_without_flats){
					sum_info = setRoomsInfo(sum_info, plan);
					filtered.push(plan);
				} else {
					var flats = inFlats(filter, plan.flats);
					if (flats.length > 0){
						var new_info = flatsParse(flats);
						plan.info = new_info.info;
						plan.flats_list = new_info.flats_list;
						plan.flats_html = new_info.flats_html;
						plan.section_html = new_info.section_html;
						plan.building_html = new_info.building_html;
						sum_info = setRoomsInfo(sum_info, plan);
						filtered.push(plan);
					}
				}
			}
    	})
    	return {'filtered': filtered, 'sum_info': sum_info};
    };

    var setAllRoomsInfo = function(sum, info){
	    sum.area += info.area;
		sum.count += info.count;
		sum.sum_price += info.sum_price;
		sum.sum_super_price += info.sum_super_price;
		sum.sum_installment_price += info.sum_installment_price;
		return sum;
    };

    function filterEverything(filter){
    	set_filter = angular.copy(filter);
    	var filtered_stock = {},
    		filtered_info = {},
    		filtered_all = {area: 0 , sum_price: 0, sum_super_price: 0, count: 0, sum_installment_price: 0};
    	for (var room in stock_by_room){
    		var obj = getByFilter(stock_by_room[room], filter);
    		filtered_stock[room] = obj.filtered;
    		filtered_info[room] = obj.sum_info;
    		filtered_all = setAllRoomsInfo(filtered_all, obj.sum_info);
    	}
		$scope.stock = filtered_stock;
		$scope.info = filtered_info;
		$scope.all = filtered_all;
    };

    var setParams = function(filter){
    	var getSelected = function(array, field, isGroups){
    		if (isGroups){
    			var selected = [];
    			array.forEach(function(group){ selected = selected.concat(group.list.filter(function(obj){return obj.selected}).map(function(obj){return obj.id})); })
				return selected;
    		}
    		return array.filter(function(obj){return obj.selected}).map(function(obj){return obj[field]});
    	};

    	var params = {};

    	['states', 'statuses', 'buildings', 'rooms', 'plans'].forEach(function(field){
    		var obj_field = (field == 'plans') ? 'name' : 'id';
			params[field] = getSelected(filter[field], obj_field, field == 'statuses');
		});

		var clear_filter = angular.copy(params);
		clear_filter.area = angular.copy(filter.area);
		clear_filter.price = angular.copy(filter.price);

		params.area_from = filter.area.from;
		params.area_to = filter.area.to;
		params.price_from = filter.price.from;
		params.price_to = filter.price.to;
		['states', 'statuses', 'buildings', 'rooms', 'plans'].forEach(function(field){
			params[field] = params[field].join(',');
		});
		$state.transitionTo('stock_v2', params, { location: true, inherit: true, relative: $state.$current, notify: false});
		return clear_filter;
    };

    function setFilter(params){
    	var setSelected = function(array, selected, field, isGroups){
    		if (isGroups){
    			array.forEach(function(group){
    				var count_selected = 0;
    				group.list.map(function(obj){
    					obj.selected = (selected.indexOf(obj[field])>-1);
    					if (obj.selected) count_selected++;
		    			return obj;
		    		});
		    		group.parent.selected = (group.list.length == count_selected);
    			})
				return array;
    		};
    		return array.map(function(obj){
    			obj.selected = (selected.indexOf(obj[field])>-1);
    			return obj;
    		});
    	};

    	var clear_filter = {};
		clear_filter.area = {'from': params.area_from*1 || params.area_from, 'to': params.area_to*1 || params.area_to};
		clear_filter.price = {'from': params.price_from, 'to': params.price_to};

		$scope.filter.area = angular.copy(clear_filter.area);
		$scope.filter.price = angular.copy(clear_filter.price);

		['states', 'statuses', 'buildings', 'rooms', 'plans'].forEach(function(field){
			clear_filter[field] = (params[field]) ? params[field].split(',') : [];
			//привожу строки к числам (по другому с indexof не находит совпадения)
			clear_filter[field] = clear_filter[field].map(function(obj){ obj = obj.trim();return obj*1 || obj});
			var obj_field = (field == 'plans') ? 'name' : 'id';
			$scope.filter[field] = setSelected($scope.filter[field], clear_filter[field], obj_field, field == 'statuses');
			if (field == 'states')
				statusesFilter($scope.filter[field]);
		});
		return clear_filter;
    };

    $scope.getByButton = function(){
    	var filter = setParams($scope.filter);
    	// console.log('getByButton  ', filter)
    	filterEverything(filter);
    };

   	function getByUrl(){
    	var filter = setFilter($stateParams);
    	filterEverything(filter);
    };

	var getFilterOptions = function(filter){
		var req = {};
		['area', 'price'].forEach(function(field){
			if (filter[field] && filter[field].from)
				req[field+'_from'] = filter[field].from;
			if (filter[field] && filter[field].to)
				req[field+'_to'] = filter[field].to;
		});
		['states', 'buildings', 'rooms', 'plans'].forEach(function(field){
			var selected = filter[field].filter(function(obj){return obj.selected}).map(function(obj){return obj.id});
			if (selected.length>0) req[field] = selected;
		})
		var selected = [];
		filter.statuses.forEach(function(group){
			selected = selected.concat(group.list.filter(function(obj){return obj.selected}).map(function(obj){return obj.id}));
		})
		if (selected.length>0) req['statuses'] = selected;
		return req;
	};

	$scope.exportExcell = function(){
		var params = [],
			url_params = $state.params;
		for (var key in url_params){
			if (url_params[key] != undefined){
				var param = key + '=';
				param += (Array.isArray(url_params[key]) ? url_params[key].join(',') : url_params[key]);
				params.push(param);
			}
		};
		params = (params.length > 0 ) ? '?' + params.join('&') : '';
		$window.location.replace("api/excel/stock/"+params);
	};

}
