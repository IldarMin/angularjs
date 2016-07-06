"use strict";
function TotalCtrl($scope, total, statuses, UserRole){
	console.log('----TotalCtrl-----')
	$scope.preload = true;
	$scope.Math = Math;

	$scope.tabs = {};
	$scope.tabs.active = '';

	$scope.tabs.setActive = function(tab){
		$scope.tabs.active = tab;
		$scope.state_id = tab;
	};

	$scope.tabs.isActive = function(tab){
		return ($scope.tabs.active == tab) ? 'active' : '';
	};

	$scope.getFlats = function(sections){
		var html = '';
		if (sections == undefined) return;
		for (var key in sections){
			html += '<div>БС '+sections[key].info.section+' дом '+sections[key].info.building+'<br>';
			var point = false;
			sections[key].list.forEach(function(flat){
				if (point)
					html +=', ';
				html += '<a href="#flats/'+flat.id+'">'+flat.number+'</a>';
				point = true;
			})
			html +='</div>';
		}
		return html;
	};

	$scope.rooms = [{name: '1-комн', id: 1},{name: '2-комн', id: 2},{name: '3-комн', id: 3},{name: '4-комн', id: 4}];

	statuses.$promise.then(function(data){
		$scope.states = data['states'];
		$scope.statuses = data['statuses'];
		//директора 4 || //застройщики 5
		if (UserRole.isDirectors() || UserRole.isDevelopers())
			$scope.states = $scope.states.filter(function(state){return state.id == 1});
		var state_all = {id: 'all', name: 'Все'};
		state_all.include = $scope.statuses.map(function(s){return s.id});
		state_all.order = -1; 
		if (!UserRole.isDevelopers())
			$scope.states.unshift(state_all);
		$scope.tabs.setActive($scope.states[0].id);

		$scope.dict_statuses = data['statuses'].toDictionary(),
		$scope.dict_groups = data['groups'].toDictionary();
		$scope.include_statuses = {};
		$scope.include_groups = {};
		$scope.states.forEach(function(state){
			$scope.include_statuses[state.id] = [];
			$scope.include_groups[state.id] = [];
			var uniq = {};

			state.include.forEach(function(incl){
				var status = $scope.dict_statuses[incl],
					group = $scope.dict_groups[status.group];

				$scope.include_statuses[state.id].push(status);
				$scope.include_statuses[state.id].push({id: incl+0.5, name: status.name+'(!)', special: true, order: status.order+0.5});

				if (!uniq[group.id]){
					$scope.include_groups[state.id].push(group);
					$scope.include_groups[state.id].push({id: group.id+0.5, name: group.name+'(!)', special: true, order: group.order+0.5});
					uniq[group.id] = true;
				}
			})
		})
		if (UserRole.isDirectors() || UserRole.isDevelopers())
			$scope.include_statuses = $scope.include_groups;
		console.log($scope.include_groups)
		total.$promise.then(function(data){
			createTotal(data);
		});
	});

	function createTotal(plans){
		var state  = {},
			status = {},
			common = { 'one': {}, 'column': {}, 'row': {}, 'general': {} },
			rooms, group_id;

		plans.forEach(function(plan){
			rooms = plan.rooms_count;
			plan.flats.forEach(function(flat){
				state = flat.state;
				status = flat.status;
				if (flat.status.id == undefined) return;
				if (UserRole.isDirectors() || UserRole.isDevelopers()){
					group_id = $scope.dict_statuses[flat.status.id].group;
					status = $scope.dict_groups[group_id];
				}
				if (!!flat.status_time && isOverdue(flat.status_time, flat.status))
					status = {id: status.id+0.5, name: status.name+'(!)', order: status.order+0.5};

				setByState(common, state.id, status.id, flat, plan, rooms);
				setByState(common, 'all', status.id, flat, plan, rooms);

			})
		})
		$scope.common = common['one'];
		$scope.common_st = common['column'];
		$scope.common_r = common['row'];
		$scope.common_g = common['general'];

		$scope.preload = false;
	};

	function setByState(common, state, status, flat, plan, rooms){
		var one = common['one'],
			column = common['column'],
			row = common['row'],
			general = common['general'];
		one[state] = one[state] || {};
		one[state][status] = one[state][status] || {};
		one[state][status][rooms] = setInfo(one[state][status][rooms], flat, plan);

		column[state] = column[state] || {};
		column[state][status] = setInfo(column[state][status], flat, plan);

		row[state] = row[state] || {};
		row[state][rooms] = setInfo(row[state][rooms], flat, plan);

		general[state] = setInfo(general[state], flat, plan);
	};

	function setInfo(obj, flat, plan){
		obj = obj || {flats:{}, count: 0, area: 0, price: 0};
		obj.flats[flat.section.id] =  obj.flats[flat.section.id] || 
		{info: {'section': flat.section.number, 'building': flat.building.number}, list: []};
		obj.flats[flat.section.id].list.push(flat);
		obj.price += flat.price;
		obj.count++;
		obj.area += flat.area;
		return obj;
	};

	function isOverdue(status_time, status){
		if (!status_time || !status.possible_delay) return false;
		var time = Date.fromStr(status_time),
			now = new Date();
		time.setHours(0,0,0,0);
		now.setHours(0,0,0,0);
		return (now>time);
	};

}