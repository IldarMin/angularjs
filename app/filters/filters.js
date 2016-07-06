// function price(){
// 	var i = 0;
//     return function(text){
//     	if (text == undefined) return;
//         text = text.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ");
//         return text;
//     };
// };


function price($locale, $filter){
	$locale.NUMBER_FORMATS.GROUP_SEP = " ";
	$locale.NUMBER_FORMATS.CURRENCY_SYM = "";
    return function(text){
    	if (text == undefined) return;
        return $filter('currency')(text, '', '');
    };
};


function DelaysFilter(){
    return function(array, filter){
		var byUsers = function(user, delay_user){
			return (user.id == 'all' || user.id == delay_user);
		};

		var byStatuses = function(statuses, delay_status){
			return (statuses.length == 0 || statuses.indexOf(delay_status) > -1);
		};

        if (array == undefined || filter == undefined || filter.statuses == undefined) return;
        var selected_statuses = [];
        filter.statuses.forEach(function(group){
        	selected_statuses = selected_statuses.concat(group.list.filter(function(status){return status.selected}).map(function(status){return status.id}));
        });
		var filtered = array.filter(function(delay){
			return byUsers(filter.user, delay.user) &&	
				byStatuses(selected_statuses, delay.status);
		})
		return filtered;
	}
};

// function StockFilter(){
// 	return function(array, filter){
// 		byBuilding = function(building, flats){
// 			if (building.id == 'all')
// 				return true;
// 			filtered = flats.filter(function(flat){return building.id==flat.building.id});
// 			return (filtered.length>0);
// 		}

// 		byRoom = function(room, plan){
// 			return (room.id == 'all' || plan.rooms_count == room.id);
// 		}

// 		byPlans = function(plans, plan){
// 			selected_plans = filter.plans.filter(function(plan){return plan.selected}).map(function(plan){return plan.name});
// 			if (selected_plans.length == 0)
// 				return true;
// 			return (selected_plans.indexOf(plan.name)>-1);
// 		}

// 		byArea = function(area, plan){
// 			return ((!!area.from && area.from <= plan.area || !area.from) &&
// 			 		(!!area.to && area.to >= plan.area || !area.to));
// 		}

// 		byPrice = function(price, flats){
// 			if (!price.from && !price.to)
// 				return true;
// 			filtered = flats.filter(function(flat){
// 				return ((!!price.from && price.from <= flat.super_price || !price.from) &&
// 			 			(!!price.to && price.to >= flat.super_price || !price.to))
// 				})
// 			return (filtered.length>0);
// 		}

// 		if (array == undefined) return;
// 		filtered = array.filter(function(plan){
// 			return byBuilding(filter.building, plan.flats) &&
// 				byArea(filter.area, plan) &&
// 				byPrice(filter.price, plan.flats) &&
// 				byRoom(filter.room, plan) &&
// 				byPlans(filter.plans, plan)
// 		});
// 		return filtered
// 	}
// };

function ClientsFilter(){
	return function(array, filter){
		byUsers = function(user, clients_user){
			return (user.id == 'all' || user.id == clients_user.user)
		}

		byClientFio = function(fio, client){
			if (fio == undefined || fio.length == 0)
				return true;
			var names = [];
			names = fio.split(' ');
			reg_str = names.map(function(name){return '(?=.*'+name+')'}).join('');
			var regExp = new RegExp(reg_str, 'i');
			return regExp.test(client.fio);
		}

		byClientPhone = function(phone, client){
			if (phone == undefined)
				return true;
			phone = phone.substring(0, phone.indexOf('_')) || phone;
			phone = phone.replace(/\(/, "\\(");
			phone = phone.replace(/\)/, "\\)");
			if (phone.length == 0) return true;
			var regExp = new RegExp('^\\'+phone, 'i');
			return regExp.test(client.phone);
		}

		if (array == undefined) return;
		filtered = array.filter(function(client){
			return byUsers(filter.user, client.last_contact) && byClientFio(filter.fio, client) && byClientPhone(filter.phone, client);
		})
		return filtered;
	}
};

function PaymentsFilter(DateFormat){
	return function(array, filter, clients){
		var isOverdue = function(time, fakt_date){
			if (!!fakt_date) return false;
			var time = Date.fromStr(time),
       			now = new Date();
        	time.setHours(0,0,0,0);
        	now.setHours(0,0,0,0);
			return (now>time);
		};

		var byDuration = function(duration, date){
			if (!date)
				return (!duration.from && !duration.to);
			var date = Date.fromStr(date);
			(!duration.from) ? false : duration.from.setHours(0,0,0,0);
			(!duration.to) ? false : duration.to.setHours(0,0,0,0);
			date.setHours(0,0,0,0);
			return ((!!duration.from && duration.from <= date || !duration.from) &&
			 		(!!duration.to && duration.to >= date || !duration.to))
		};

		var byBuilding = function(building, flat){
			if (building.id == 'all')
				return true;
			return building.id==flat.building.id
		};

		var byClient = function(info, payment, clients){
			if (info.length == 0)
				return true
			if (!payment.client) return false;
			client = clients[payment.client];
			var regExp = new RegExp('^'+info, 'i');
			return (regExp.test(client.fio))
		};

		var byPaymentType = function(f_payment, payment){
			if (f_payment.id == 'all')
				return true
			return (f_payment.id == payment.xtype);
		};

		var byOverdued = function(byOverdued, payment){
			return ((byOverdued && isOverdue(payment.date, payment.fakt_date)) || !byOverdued);
		};

		if (array == undefined) return;
		filtered = array.filter(function(payment){
			return byBuilding(filter.building, payment.flat) &&

			((byDuration(filter.plan.duration, payment.date) && filter.plan.detailed) ||
			(byDuration(filter.plan.fast_duration, payment.date) && !filter.plan.detailed)) &&

			((byDuration(filter.fakt.duration, payment.fakt_date) && filter.fakt.detailed) ||
			(byDuration(filter.fakt.fast_duration, payment.fakt_date) && !filter.fakt.detailed)) &&

			byClient(filter.client, payment, clients) &&
			byPaymentType(filter.payment, payment) &&
			byOverdued(filter.isOverdued, payment)
		})
		return filtered;
	}
};

function ReservesFilter(){
	return function(array, filter, clients){
		var byUser = function(f_user, user){
			if (f_user.id == 'all')
				return true
			return (f_user.id == user);
		};

		var byBuildings = function(buildings, building){
			buildings = buildings.filter(function(building){return building.selected}).map(function(building){return building.id});
			return (buildings.length == 0 || buildings.indexOf(building)>-1);
		};

		var byDuration = function(duration, date){
			if (!date)
				return (!duration.from && !duration.to);
			var date = Date.fromStr(date);
			(!duration.from) ? false : duration.from.setHours(0,0,0,0);
			(!duration.to) ? false : duration.to.setHours(0,0,0,0);
			date.setHours(0,0,0,0);
			return (((!!duration.from && duration.from <= date) || !duration.from) &&
			 		((!!duration.to && duration.to >= date) || !duration.to));
		};

		var byClient = function(fio, client){
			if (!fio || fio.length == 0) return true;
			var regExp = new RegExp('^'+fio, 'i');
			return (regExp.test(client.fio));
		};

		var byStatusTypes = function(status_types, status_type){
			status_types = status_types.filter(function(status_type){return status_type.selected}).map(function(status_type){return status_type.id});
			return (status_types.length == 0 || status_types.indexOf(status_type)>-1)
		};

		if (array == undefined || clients == undefined) return;
		var duration = (filter.detailed) ? filter.duration : filter.fast_duration;
		filtered = array.filter(function(reserve){		
			return byUser(filter.user, reserve.user) &&
			byBuildings(filter.buildings, reserve.flat.building.id) &&
			((byDuration(filter.duration, reserve.date) && filter.detailed) ||
			(byDuration(filter.fast_duration, reserve.date) && !filter.detailed)) &&
			byClient(filter.client, clients[reserve.client]) &&
			byStatusTypes(filter.status_types, reserve.flat.contract_type);
		})
		return filtered;
		// return array;
	}
};

function BronesFilter(){
	return function(array, filter){
		var byUser = function(f_user, user){
			if (!f_user || f_user.id == 'all')
				return true;
			return (f_user.id == user)
		};

		// byBuildings = function(buildings, building){
		// 	buildings = buildings.filter(function(building){return building.selected}).map(function(building){return building.id});
		// 	return (buildings.length == 0 || buildings.indexOf(building)>-1);
		// };

		var byDuration = function(duration, date){
			if (!date)
				return (!duration.from && !duration.to);
			var date = Date.fromStr(date);
			(!duration.from) ? false : duration.from.setHours(0,0,0,0);
			(!duration.to) ? false : duration.to.setHours(0,0,0,0);
			date.setHours(0,0,0,0);
			return (((!!duration.from && duration.from <= date) || !duration.from) &&
			 		((!!duration.to && duration.to >= date) || !duration.to));
		};

		// byClient = function(fio, client){
		// 	if (!fio || fio.length == 0) return true;
		// 	if (!fio) return false;
		// 	var regExp = new RegExp('^'+fio, 'i');
		// 	return (regExp.test(client.fio));

		// };

		if (array == undefined) return;
		var duration = (filter.detailed) ? filter.duration : filter.fast_duration;
		filtered = array.filter(function(brone){		
			return byUser(filter.user, brone.user) &&
			((byDuration(filter.duration, brone.status_update_time) && filter.detailed) ||
			(byDuration(filter.fast_duration, brone.status_update_time) && !filter.detailed))
		})
		return filtered;
	}
};

function SumOf(){
	return function(array, field){
		if (array == undefined) return;
		var sum = 0;
		array.forEach(function(obj){ sum += obj[field] });
		return Math.round(sum);
	}
};

function SumOfPayments(){
	return function(array, field, fakt_date){
		if (array == undefined)
			return;
		var sum = 0;
		if (!!fakt_date){
			array.forEach(function(obj){
				if (!!obj[fakt_date])
					sum += obj[field];
			})
			return Math.round(sum);
		}
		array.forEach(function(obj){
			sum += obj[field];
		})
		return Math.round(sum);
	}
};

function roomsArea(){
	return function(array){
		var compareNumeric = function(a, b){
			return a-b;
		}
		try {
			array = array.filter(function(el){return !!el && el.length > 0});
			if (array.length == 0) return ' - ';
			if (array.sort(compareNumeric))
				return array.join('/');
		}
		catch (error){
			return ' - ';
		}
	}
};
