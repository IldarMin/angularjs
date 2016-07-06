function DashboardCtrl($scope, $state, DateFormat, Dash, DashReservations, DashReserves, DashSales, DashContacts, DashClients, DashIncomes, DashBrones){

	$scope.active = { val: null };

	$scope.dash_date = { from: null, to: null };

	$scope.dash_block = {};
	$scope.dash_block.times = [{id: 'today', name: 'Сегодня'},{id: 'yesterday', name: 'Вчера'},{id: 'week', name: 'Неделя'},
	{id: 'month', name: 'Месяц'},{id: 'quarter', name: 'Квартал'},{id: 'year', name: 'Год'}, {id: 'all', name: 'Итого'}];

	$scope.dash_block.entities = [
		{id: 'site_contacts', name: 'Сайт', parent: 'actions_contacts', type: [3, 4, 5]},
		{id: 'call_contacts', name: 'Звонки', parent: 'actions_contacts', type: [2]},
		{id: 'visit_contacts', name: 'Посещения', parent: 'actions_contacts', type: [1]},
		{id: 'reservations', name: 'Брони (Актуальные)',  parent: 'brones', type: []},
		{id: 'brones', name: 'Брони (Все)',  parent: 'actions_flats', type: [1]},
		{id: 'reserves', name: 'Резервы',  parent: 'reserves', type: []},
		{id: 'sales', name: 'Продано',  parent: 'sold', type: []}];

	var today = new Date();
	today.setHours(today.getHours() - today.getTimezoneOffset() / 60);
	$scope.dash_block.data = Dash.save({today: today});

	$scope.dash_block.active = '';
	$scope.dash_block.isActive = function(type){
 		if (!type || $scope.dash_block.active == type)
 			return true;
	};

	//микрокостылек для установления минимального шага по оси х - чтобы не показывал время, а только числа
	$scope.day_duration = false;

	var createPairsPoints = function(statistic){
		$scope.day_duration = false;
		var from_d = angular.copy($scope.dash_date.from),
			to_d = angular.copy($scope.dash_date.to),
			date = angular.copy($scope.dash_date.from),
			points = [],
			regExp = new RegExp(".\\d*$"),
			i = 0,
			count = 0,
			tz_offset = date.getTimezoneOffset() / 60;
		from_d.setHours(0,0,0,1);
		to_d.setHours(23,59,59,999);
		var duration = Math.round((to_d-from_d)/86400000);

		if (duration <= 1){
			$scope.day_duration = true;
			var hour = 0;
			while(hour<24){
				date.setHours(hour,0,0,0);
				var millis = date.getTime() - tz_offset,
					actual_hour = hour + tz_offset;
				count = statistic[actual_hour] || 0;
				var pair = [millis, count]
				points.push(pair);
				hour++;
			}
			return points;
		}

		while (date >= from_d && date <= to_d){
			str_date = DateFormat.fromDate(date);
			date.setHours(12,0,0,0);
			var millis = date.getTime() - tz_offset;
			time = str_date.replace(regExp, '') || '';
			count = statistic[str_date] || 0;
			var pair = [millis, count];
			points.push(pair);
			count = 0;
			date.setDate(date.getDate() + 1);
			i++;
		}
		return points;
	};

	var createIncomesPoints = function(statistic){
		var from_d = angular.copy($scope.dash_date.from),
			to_d = angular.copy($scope.dash_date.to),
			date = angular.copy($scope.dash_date.from),
			points_payments = [],
			points_plans = [],
			regExp = new RegExp(".\\d*$"),
			i = 0,
			count = 0;
		from_d.setHours(0,0,0,1);
		to_d.setHours(23,59,59,999);

		while (date >= from_d && date <= to_d){
			var str_date = DateFormat.fromDate(date);
			date.setHours(12,0,0,0);
			var millis = date.getTime() - date.getTimezoneOffset() / 60;
			time = str_date.replace(regExp, '') || '';

			statistic[str_date] = statistic[str_date] || {};
			count = statistic[str_date]['payments'] || 0;
			points_payments.push([millis, count]);
			count = statistic[str_date]['plans'] || 0;
			points_plans.push([millis, count]);
			date.setDate(date.getDate() + 1);
			i++;
		};
		return [points_payments, points_plans];
	};

	var getMonthDuration = function(){
		var today = new Date(),
			year = today.getUTCFullYear(),
			month = today.getMonth(),
			first_day = new Date(year, month, 1, 12),
			last_day = new Date(year, month+1, 0, 12);
		return {from: first_day, to: last_day};
	};

	var getDuration = function(){
		var today = new Date(),
			year = today.getUTCFullYear(),
			month = today.getMonth();

		return {
			today: function(){
				return {from: today, to: today};
			},
			yesterday: function(){
				var yesterday = angular.copy(today);
				yesterday.setDate(yesterday.getDate() - 1);
				return {from: yesterday, to: yesterday};
			},
			week: function(){
				var day = today.getDate(),
					day_week = today.getDay();
				day_week = (day_week != 0) ? day_week : 7;
				first_day = new Date(year, month, day + 1 - day_week, 12);
				last_day = new Date(year, month, day + 7 - day_week, 12);
				return {from: first_day, to: last_day};
			},
			month: function(){
				first_day = new Date(year, month, 1, 12),
				last_day = new Date(year, month+1, 0, 12);
				return {from: first_day, to: last_day};
			},
			quarter: function(){
				// var f_month, l_month = 0,
				// 	c_quarter = Math.floor(month / 3) + 1;
				// f_month = c_quarter*3 - 3;
				// l_month = c_quarter*3 - 1;

				// first_day = new Date(year, f_month, 1, 12),
				// last_day = new Date(year, l_month+1, 0, 12);
				// return {from: first_day, to: last_day};

				var l_month = month,
					f_month = month - 2;

				first_day = new Date(year, f_month, 1, 12),
				last_day = new Date(year, l_month+1, 0, 12);
				return {from: first_day, to: last_day};
			},
			year: function(){
				// first_day = new Date(year, 0, 1, 12),
				// last_day = new Date(year, 11, 31, 12);
				// return {from: first_day, to: last_day};

				var l_month = month,
					f_month = month + 1;
					f_year = year - 1;

				first_day = new Date(f_year, f_month, 1, 12),
				last_day = new Date(year, l_month+1, 0, 12);
				return {from: first_day, to: last_day};
			},

		}
	};


	var getDateDuration = function(type){
		var from_date = new Date(),
			to_date = new Date(),
			duration = {};
		from_date.setHours(12,0,0,0);
		to_date.setHours(12,0,0,0);
		if (type){
			var d = getDuration();
			duration = d[type]();
			from_date = angular.copy(duration.from);
			to_date = angular.copy(duration.to);
		}
		return {
			from: from_date,
			to: to_date
		}
	};

	$scope.change_date = function(type){
		$scope.active.val = type;
		$scope.dash_block.active = type || null;
		var date_duration = getDateDuration(type),
			from_date = date_duration.from,
			to_date = date_duration.to;

		if (type){
			$scope.dash_date.from = angular.copy(from_date);
			$scope.dash_date.to = angular.copy(to_date);
		} else {
			from_date = angular.copy($scope.dash_date.from);
			to_date = angular.copy($scope.dash_date.to);
		}

		from_date.setHours(0,0,0,1);
		to_date.setHours(23,59,59,999);
		from_date.setHours(from_date.getHours() - from_date.getTimezoneOffset() / 60);
		to_date.setHours(to_date.getHours() - to_date.getTimezoneOffset() / 60);
		var duration = {};
		duration.from = from_date;
		duration.to = to_date;
		$scope.sums = {};

		DashReservations.save(duration, function(data){
			$scope.sums.reservations = data.sum;
			$scope.dash_reservations = createPairsPoints(data)
		});
		DashBrones.save(duration, function(data){
			$scope.sums.brones = data.sum;
			$scope.dash_brones = createPairsPoints(data)
		});
		DashReserves.save(duration, function(data){
			$scope.sums.reserves = data.sum;
			$scope.dash_reserves = createPairsPoints(data)
		});
		DashSales.save(duration, function(data){
			$scope.sums.sales = data.sum;
			$scope.dash_sales = createPairsPoints(data)
		});
		DashContacts.save(duration, function(data){
			$scope.sums.contacts = data.sum;
			$scope.sums.site_contacts = data['site'].sum;
			$scope.sums.call_contacts = data['call'].sum;
			$scope.sums.visit_contacts = data['visit'].sum;
			$scope.dash_contacts = createPairsPoints(data);
			$scope.dash_contacts_site = createPairsPoints(data['site']);
			$scope.dash_contacts_call = createPairsPoints(data['call']);
			$scope.dash_contacts_visit = createPairsPoints(data['visit'])
		});
		DashClients.save(duration, function(data){
			$scope.sums.clients = data.sum;
			$scope.dash_clients = createPairsPoints(data)
		});
		DashIncomes.save($scope.dash_date, function(data){
			$scope.sums.payments = data.sum;
			$scope.dash_payments = createIncomesPoints(data)
		});
	};

	$scope.change_date('today');

	$scope.getSref = function(entity, time){
		var state = entity.parent,
			type = entity.type.join(','),
			from_date = 'null',
			to_date = 'null';
		if (time.id != 'all'){
			var date_duration = getDateDuration(time.id);
			from_date = date_duration.from;
			to_date = date_duration.to;
		};
		return $state.href(entity.parent, {"type": type, "date_from": from_date, "date_to": to_date});
	};

	$scope.getCustom = function(entity, dash_date){
		// console.log('getCustom')
		var state = entity.parent,
			type = entity.type.join(','),
			from_date = new Date(),
			to_date = new Date();
		from_date = dash_date.from;
		to_date = dash_date.to;
		from_date.setHours(12,0,0,0);
		to_date.setHours(12,0,0,0);
		return $state.href(entity.parent, {"type": type, "date_from": from_date, "date_to": to_date});
	};


}
