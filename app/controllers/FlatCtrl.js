function FlatCtrl(ModalServ, $scope, Flats, Statuses, Comments, Deal, FlatSales, FlatPayments, Contacts, Clients, UserRole,
	settings, flat_pk, flat, statuses, flat_sales, comments, deal, payments, users, clients){
	console.log('FlatCtrl  ', flat)
	var ready = {};
	$scope.Math = window.Math;
	$scope.phone = '';
	$scope.fio = '';
	$scope.flat = flat;
	$scope.preloader = {'statuses': true, 'history': true};
	flat.$promise.then(function(data){
		if (data.client){
			$scope.client_pk = data.client.id;
			$scope.result = data.client;
			$scope.phone = data.client.phone;
			$scope.fio = data.client.fio;
			$scope.isAblePayment = true;
			$scope.panel.setActive('comments');
		};
	});

	$scope.imageEdit = {};
	$scope.imageEdit.model = null;
	$scope.imageEdit.old_val = null;
	$scope.imageEdit.conmodel = null;
	$scope.imageEdit.type = null;
	$scope.imageEdit.error = false;
	$scope.imageEdit.load = false;
	$scope.imageEdit.error_text = '';

	$scope.imageEdit.change = function(type, val1, val2){
		$scope.imageEdit.model = val1 || val2;
		$scope.imageEdit.old_val = $scope.imageEdit.model;
		$scope.imageEdit.conmodel = $scope.flat.id + '_' + type;
		$scope.imageEdit.type = type;
		$scope.imageEdit.error_text = '';
		$scope.imageEdit.error = false;
		$scope.imageEdit.load = false;
		$('#changeFlatImg').modal('show');
	};

	$scope.imageEdit.isSame = function(){
		return ($scope.imageEdit.old_val == $scope.imageEdit.model);
	};

	$scope.imageEdit.save = function(){
		if ($scope.imageEdit.model == $scope.imageEdit.old_val) return;
		var data = {},
			field = $scope.imageEdit.type+'_img';
		data[field] = $scope.imageEdit.model;
		$scope.imageEdit.load = true;
		$scope.imageEdit.error_text = '';
		$scope.imageEdit.error = false;
		Flats.saveFile({'pk': flat_pk, 'change_image': 'change_image'}, {data: data}, function(f_data){
			console.log('saveFile f_data  ', f_data);
			$scope.flat[field] = f_data['status'];
			$scope.imageEdit.cancel();
		}, function(error){
			console.log('saveFile error  ', error);
			$scope.imageEdit.error = true;
			$scope.imageEdit.error_text = error.data[field][0] || 'Ошибка при сохранении';
			$scope.imageEdit.load = false;
		})
	};

	$scope.imageEdit.cancel = function(type, val){
		$('#changeFlatImg').modal('hide');
		$scope.imageEdit.model = null;
		$scope.imageEdit.conmodel = null;
		$scope.imageEdit.type = null;
		$scope.imageEdit.error = false;
		$scope.imageEdit.load = false;
		$scope.imageEdit.error_text = '';
	};

	$scope.costEditTable = {};
	$scope.costEditTable.model = '';
	$scope.costEditTable.old_val = '';
	$scope.costEditTable.editnow = null;
	$scope.costEditTable.error = false;
	$scope.costEditTable.load = false;


	$scope.costEditTable.edit = function(value, type){
		$scope.costEditTable.model = value;
		$scope.costEditTable.old_val = value;
		$scope.costEditTable.editnow = type;
	};

	$scope.costEditTable.isSame = function(){
		return ($scope.costEditTable.model == $scope.costEditTable.old_val);
	};

	$scope.costEditTable.saveEdit = function(type){
		if ($scope.costEditTable.isSame()) return;
		var data,
			val = $scope.costEditTable.model;
		if ($scope.costEditTable.editnow == 'price')
			val = Math.round(val*$scope.flat.area);
		if (type == 'area'){
			var toNumberRegex = new RegExp('[^0-9\.]', 'g');
			val = parseFloat(val.replace(',', '.').replace(toNumberRegex, ''));
			data = {'area': val};
		}
		else {
			data = {'price': val};
		}
		$scope.costEditTable.load = true;
		Flats.update({pk: flat_pk}, data, function(data){
			console.log('Flats.update  ', data)
			$scope.flat = data;
			$scope.costEditTable.cancelEdit();
			updateHistory();
		}, function(error){
			$scope.costEditTable.error = true;
			$scope.costEditTable.load = false;
		})
	};

	$scope.costEditTable.cancelEdit = function(){
		$scope.costEditTable.model = '';
		$scope.costEditTable.old_val = '';
		$scope.costEditTable.editnow = null;
		$scope.costEditTable.error = false;
		$scope.costEditTable.load = false;
	};

	$scope.isFreeze = function(){
		if ($scope.flat.status == undefined || $scope.flat.state == undefined) return;
		return ($scope.flat.status.freeze || $scope.flat.state.freeze);
	};

	$scope.hasntSpecial = function(){
		return ($scope.isFreeze() && !UserRole.isLeaders());
	};

	$scope.isntLeaders = function(){
		return (!UserRole.isLeaders());
	};

	$scope.modal = {}
	$scope.modal.condition = '';
	$scope.modal.role = '';
	$scope.modal.client = null;
	$scope.modal.person = '';

	$scope.limit = 5;
	$scope.base_href = settings.base_href;
	$scope.salesPermission = {};
	$scope.clientsList = [];
	$scope.clientsListForDeal = [];

	$scope.stateBlock = {}
	$scope.stateBlock.isEdit = false;

	initSales = function(sales){
		$scope.sales = []
		angular.forEach(sales, function(sale){
			sale.checked = sale.active;
			$scope.sales.push(sale)
			$scope.changeSalesPermission(sale)
		})
	}

	flat_sales.$promise.then(function(data){
		initSales(data);
	})

	users.$promise.then(function(data){
		$scope.users = data.toDictionary();
		ready.users = true;
	});

	clients.$promise.then(function(data){
		$scope.clientsList = data;
		$scope.clientsListForDeal = data;
		$scope.clients = data.toDictionary();
		ready.clients = true;
	});

	$scope.$watch(function(){return ready}, function(){
		if (ready.clients && ready.users) {
			$scope.comments = comments;
			$scope.deal = deal;
			console.log('=========ready   now ==========', ready)
			updateHistory();
		}
	}, true)

	//можно добавить ready.status и все связанное с квартирой проворачивать там
	statuses.$promise.then(function(s_data){
		$scope.states = s_data['states'];
		$scope.statuses = s_data['statuses'];
		$scope.status_types = s_data['status_types'].map(function(status_type){
			status_type.id = status_type.typex;
			return status_type;
		});
		$scope.status_types_all = {};
		$scope.status_types_all[1] = $scope.status_types.filter(function(type){ return (type.name.indexOf('ДДУ')>-1)});
		$scope.status_types_all[3] = $scope.status_types.filter(function(type){ return (type.name.indexOf('ДДУ')>-1)});
		$scope.status_types_all[2] = $scope.status_types.filter(function(type){ return (type.name.indexOf('ДКП')>-1)});
		$scope.dict_include = {};
		$scope.states.forEach(function(state){
			$scope.dict_include[state.id] = []
			state.include.forEach(function(incl){
				$scope.dict_include[state.id].push($scope.getStatus(incl))
			})
		});
		flat.$promise.then(function(f_data){
			$scope.ch_state = f_data['state'];
			$scope.ch_status = f_data['status'];
			if (f_data['status']['contract']){
				$scope.ch_status_types = $scope.status_types.filter(function(status_type){
					return status_type.id == f_data['status']['contract'];
				})[0];
			};
			if (f_data['status']['registration_date'])
				$scope.ch_registration_date = f_data['status']['registration_date'];
			if ($scope.ch_status && $scope.ch_status.possible_delay){
				$scope.ch_status_time = f_data['status_time'];
				$scope.stateBlock.realStatus = true;
			}
			$scope.stateBlock.hasStatus = !!$scope.ch_status;
			$scope.preloader.statuses = false;
		})
	});
	//end init

	//---автоматический учет последовательности!!
	$scope.isInAfter = function(status){
		if (!$scope.flat.status) return;
		return (($scope.flat.status.after.indexOf(status.id)>-1 || $scope.flat.status.id == status.id) &&
				$scope.ch_status.id != status.id)
	};

	$scope.$watch('ch_registration_date', function(newV, oldV){
		//зарегестрирован
		if (!$scope.flat.status || !newV ||
			($scope.flat.status.registration_date == newV && oldV == undefined) ||
			($scope.ch_status.id != 24)) return;
		$scope.ch_status_time = new Date();
		$scope.ch_status_time.setDate(newV.getDate() + 7);
	});

	$scope.initCheckboxes = function(ch_status){
		// var queue_editable = 1;
		$scope.ch_statuses_stages = [];
		var queue_editable = $scope.flat_checked.queue+1;
		$scope.ch_statuses_stages = angular.copy(ch_status.statuses_stages);
		$scope.ch_statuses_stages.forEach(function(round){
			if (!!$scope.flat_checked.stages[round.id]){
				round.status = true;
				round.date = $scope.flat_checked.stages[round.id].date;
				// round.editable = false;
			}
			// if (ch_status.id == $scope.flat_checked.status)
			if (round.queue == queue_editable)
				round.editable = true;
			// round.editable = false;
			console.log('queue_editable  ', queue_editable)
		})
		console.log('$scope.flat_statuses_stages  ', $scope.flat_checked.stages)
		console.log('$scope.ch_statuses_stages  ', $scope.ch_statuses_stages)
	};

	// нужно для изменения чекбоксов при смене статуса onchanged='statusChanged(par)'
	// $scope.statusChanged = function(par){
	// 	$scope.ch_statuses_stages = [];
	// 	if (par.id == $scope.flat_checked.status){
	// 		$scope.stateBlock.realStatus = true;
	// 		$scope.initCheckboxes(par);
	// 	} else {
	// 		$scope.stateBlock.realStatus = false;
	// 	}
	// }

	$scope.addCommentCheckbox = function(){
	};


	$scope.editStatus = function(){
		$scope.stateBlock.isEdit = true;
		$scope.tempStatus = {};
		$scope.tempStatus.ch_state = $scope.ch_state;
		$scope.tempStatus.ch_status = $scope.ch_status;
		$scope.tempStatus.ch_status_types = $scope.ch_status_types;
		$scope.tempStatus.ch_status_time = $scope.ch_status_time;
		$scope.tempStatus.phone = $scope.phone;
		$scope.tempStatus.fio = $scope.fio;
		$scope.tempStatus.ch_statuses_stages = angular.copy($scope.ch_statuses_stages);
		$scope.tempStatus.result = $scope.result;
	};

	$scope.cancelStatus = function(){
		$scope.ch_state = $scope.tempStatus.ch_state;
		$scope.ch_status = $scope.tempStatus.ch_status;
		$scope.ch_status_types = $scope.tempStatus.ch_status_types;
		$scope.ch_status_time = $scope.tempStatus.ch_status_time;
		$scope.phone = $scope.tempStatus.phone;
		$scope.fio = $scope.tempStatus.fio;
		$scope.ch_statuses_stages = angular.copy($scope.tempStatus.ch_statuses_stages);
		$scope.result = $scope.tempStatus.result;
		$scope.stateBlock.isEdit = false;
		$scope.tempStatus = null;
		$scope.stateBlock.hasStatus = !!$scope.ch_status;
		$scope.invalid = null;
	};

	$scope.isNoneStatus = function(){
		return (!$scope.ch_status || $scope.ch_status.id==21 || $scope.ch_status.id==29 || $scope.ch_status.id==30)
	};

	$scope.watchStatus = function(par){
		console.log('par   ', par)
		//без статуса
		if (!par || par.id == 21 ){
			$scope.ch_status_time = null;
			$scope.fio = '';
			$scope.result = null;
			if ($scope.invalid)
				$scope.invalid.ch_status_time = false;
			return;
		}
		//оформление
		if (par.id == 12){
			if (!$scope.flat.status_update_time){
				$scope.ch_status_time = null;
				return;
			}
			var status_update_time = new Date(Date.parse($scope.flat.status_update_time)),
				duration = ($scope.flat.status.id == 6) ? 21 : 7; //резерв вторичка - 21 день
			$scope.ch_status_time = new Date();
			$scope.ch_status_time.setDate(status_update_time.getDate() + duration);
			return;
		}
		//уже пришло с сервера - не нужно ничего менять после переходов по статусам?
		if ($scope.flat.status_time && par.id == $scope.flat.status.id){
			$scope.ch_status_time = $scope.flat.status_time;
			return;
		}
		//уже пришло с сервера - не нужно ничего менять
		if ((par.duration || par.duration==0) && par.possible_delay){
			$scope.ch_status_time = new Date();
			$scope.ch_status_time.setDate(new Date().getDate() + par.duration);
		}
	};

	updateFlatStatuses = function(){
		console.log('updateFlat  ')
		$scope.preloader.statuses = true;
		$scope.flat = Flats.get({pk: flat_pk}, function(f_data){
			$scope.ch_state = f_data['state'];
			$scope.ch_status = f_data['status'];
			if (f_data['status']['contract']){
				$scope.ch_status_types = $scope.status_types.filter(function(status_type){
					return status_type.id==f_data['status']['contract'];
				})[0];
			};
			if (f_data['status']['registration_date'])
				$scope.ch_registration_date = f_data['status']['registration_date'];
			if ($scope.ch_status && $scope.ch_status.possible_delay){
				$scope.ch_status_time = f_data['status_time'];
				$scope.stateBlock.realStatus = true;
			}
			$scope.stateBlock.hasStatus = !!$scope.ch_status;
			$scope.preloader.statuses = false;
		});
	};

	$scope.changeStatus = function(){
		$scope.invalid = null;
		console.log('$scope.ch_status_types  ', $scope.ch_status_types);
		//пока так $scope.isNoneStatus(), если можно ставить клиента при "Без статуса", то !$scope.ch_status
		if ($scope.isNoneStatus() && !!$scope.result){
			$scope.invalid = $scope.invalid || {};
			$scope.invalid.ch_status = true
		}
		if (!$scope.result && !$scope.isNoneStatus()){
			$scope.invalid = $scope.invalid || {};
			$scope.invalid.result = true
		}
		if (!$scope.ch_status_time && !$scope.isNoneStatus()){
			$scope.invalid = $scope.invalid || {};
			$scope.invalid.ch_status_time = true
		}
		if (!$scope.ch_status_types && !$scope.isNoneStatus() && $scope.ch_status.show_contract){
			$scope.invalid = $scope.invalid || {};
			$scope.invalid.ch_status_types = true;
		}
		if ($scope.ch_status.id == 24 && !$scope.ch_registration_date){
			$scope.invalid = $scope.invalid || {};
			$scope.invalid.ch_registration_date = true;
		}
		console.log('$scope.invalid  ', $scope.invalid)
		if (!!$scope.invalid)
			return;
		//продается
		//условие из непродается
		// if ($scope.flat.status.id != 21 && $scope.ch_status.id == 21){
		// 	$scope.statusComment.add();
		// 	return;
		// };
		makeStatusRequest();
	};

	$scope.statusComment = {};
	$scope.statusComment.model = null;

	$scope.statusComment.add = function(){
		$scope.statusComment.model = null;
		$('#statusComment').modal('show');
	};

	$scope.statusComment.create = function(){
		$scope.statusComment.cancel();
		makeStatusRequest($scope.statusComment.model);
	};

	$scope.statusComment.cancel = function(){
		$scope.statusComment.model = null;
		$('#statusComment').modal('hide');
	};

	function makeStatusRequest(comment){
		var req_data = {};
		req_data.state = $scope.ch_state.id;
		req_data.id = $scope.flat.id;
		if ($scope.ch_status)
			req_data.status = $scope.ch_status.id;
		if ($scope.ch_status_types)
			req_data.status_types = $scope.ch_status_types.typex;
		if ($scope.ch_status_time)
			req_data.status_time = $scope.ch_status_time;
		if ($scope.ch_registration_date)
			req_data.registration_date = $scope.ch_registration_date;
		if ($scope.result)
			req_data.client = $scope.result.id;
		if ($scope.flat.reserve_contract)
			req_data.reserve_contract = $scope.flat.reserve_contract;
		if (comment)
			req_data.comment = comment;
		if ($scope.flat.status.contract_id)
			req_data.contract_id = $scope.flat.status.contract_id;
		console.log('$scope.ch_status  ', $scope.ch_status)
		console.log('$scope.ch_status.show_contract  ', $scope.ch_status.show_contract)
		$scope.preloader.statuses = true;
		Statuses.update({data: req_data}, function(data){
			Flats.get({pk: flat_pk}, function(f_data){
				$scope.flat = f_data;
				$scope.preloader.statuses = false
				$scope.stateBlock.realStatus = true;
				$scope.isAblePayment = ($scope.flat.client);
				if (!f_data['status'] || !f_data['status']['contract'])
					$scope.ch_status_types = {};
				if (f_data['status'] && f_data['status'].id == 21)//продается
					FlatSales.query({f_pk: flat_pk}, function(data){ initSales(data);});
			});
			updateHistory();
			FlatPayments.query({f_pk: flat_pk}, function(data){
				initPayments(data);
			})
			$scope.deal = Deal.query({f_pk: flat_pk}, function(){
				console.log('update deals')
			});
			$scope.stateBlock.isEdit = false;
		})
	};

	$scope.setStatus = function(){
		$scope.stateBlock.hasStatus = true;
		$scope.editStatus();
	};

	$scope.changeInvalid = function(){
		// if ($scope.ch_status_time)
			// $scope.invalid.ch_status_time = false;
	};

	$scope.$watch(function(){return $scope.ch_state}, function(newVal, oldVal){
		if (oldVal != undefined && $scope.stateBlock.isEdit) {
			$scope.ch_status = $scope.dict_include[$scope.ch_state.id].filter(function(status){ return status.id==21})[0];
			$scope.ch_status_time = null;
			$scope.phone = null;
			$scope.fio = null;
			$scope.result = null;
			$scope.invalid = null;
			$scope.ch_status_types = null;
			$scope.ch_registration_date = null;
		}
	}, true);

	updateHistory = function(){
		console.log('--------updateHistory------')
		$scope.preloader.history = true;
		Statuses.get({pk: flat_pk}, function(data){
			$scope.history = data['history'];
			$scope.preloader.history = false
		});
	};

	$scope.getState = function(id){
		if ($scope.states)
			return $scope.states.filter(function(state){return state.id==id})[0];
		return null;
	};

	$scope.getStatus = function(id){
		if ($scope.statuses)
			return $scope.statuses.filter(function(status){return status.id==id})[0];
		return null
	};

	$scope.showLimit = true;

	$scope.riseLimit = function(history){
		// $scope.limit = $scope.lmodelimit + 5;
		$scope.limit = history.length;
		$scope.showLimit = false;
	};

	$scope.reduceLimit = function(){
		$scope.limit = 2;
		$scope.showLimit = true;
		// if ($scope.limit - 5 >= 2)
		// 	$scope.limit = $scope.limit - 5;
	};

	$scope.getSales = function(sales){
		if (sales == undefined) return;
		return 'акции "'+sales.map(function(sale){return sale.name}).join('", "')+'"';
	};

	$scope.showArrRooms = function(arr){
		if (arr == undefined) return false;
		arr = arr.filter(function(el){return !!el});
		return (arr.length>0);
	};

	$scope.modal = {};
	$scope.modal.fio = '';


	$scope.modal.showImg = function(src1, src2){
		//src1 приоритетнее
		$scope.modal.src = src1 || src2;
	};

	$scope.modal.closeImg = function(){
		console.log('$scope.modal.closeImg')
		$('#modalImg').modal('hide');
	};

	$scope.panel = {};
	$scope.panel.active = $scope.panel.active || 'comments';

	$scope.panel.setActive = function(tab){
		$scope.panel.active = tab;
	};

	$scope.panel.isActive = function(tab){
		return ($scope.panel.active == tab)
	};

	$scope.panel.getClass = function(tab){
		if (tab != $scope.panel.active)
			return 'non-active'
		return '';
	};

	$scope.comment = '';

	$scope.addComment = function(){
		var com = new Comments();
		com.data = {'comment': $scope.comment};
		com.$save({f_pk: flat_pk}, function(data){
			// console.log(data)
			$scope.comments = Comments.query({f_pk: flat_pk});
			$scope.comment ='';
		})
	};

	$scope.deleteComment = function(comment){
		c_pk = comment.id;
		comment.$delete({f_pk: flat_pk, c_pk: c_pk}, function(data){
			$scope.comments = Comments.query({f_pk: flat_pk});
		})
	};

	$scope.modal.addToDeal = function(){
		$scope.modal.condition = 'create';
		$scope.modal.fio = '';
		$scope.modal.client = null;
	};

	$scope.modal.deleteFromDeal = function(person){
		$scope.modal.person = person;
		$scope.modal.condition = 'delete';
	}

	$scope.modal.createDeal = function(){
		deal = new Deal();
		deal.data = {'role': $scope.modal.role, 'client': $scope.modal.client.id};
		deal.$save({f_pk: flat_pk}, function(data){
			$scope.deal = Deal.query({f_pk: flat_pk});
			$scope.modal.cancel()
		})
	}

	$scope.modal.removeDeal = function(){
		deal = new Deal();
		deal.$delete({f_pk: flat_pk, d_pk: $scope.modal.person.id}, function(data){
			$scope.deal = Deal.query({f_pk: flat_pk});
			$scope.modal.cancel();
		})
	}

	$scope.modal.cancel = function(){
		$('#changeDeal').modal('hide');
		$scope.modal.role = '';
	}

	$scope.modal.isShow = function(condition){
		return ($scope.modal.condition == condition);
	}

	$scope.changeSalesPermission = function(sale){
		console.log('changeSalesPermission')
		sale.exclude.forEach(function(exc_sale){
			$scope.salesPermission[exc_sale] = sale.checked
		})
	}

	$scope.updateSales = function(){
		sales = $scope.sales.filter(function(sale){return sale.checked})
		flat_sales = new FlatSales();
		flat_sales.data = {'sales': sales};
		flat_sales.$update({f_pk: flat_pk}, function(data){
			$('#changeSales').modal('hide');
			FlatSales.query({f_pk: flat_pk}, function(data){
				initSales(data);
				$scope.flat = Flats.get({pk: flat_pk});
				updateHistory();
			})
		})
	}

	$scope.cancelSales = function(){
		$('#changeSales').modal('hide');
		$scope.sales.forEach(function(sale){
			sale.checked = sale.active;
			$scope.changeSalesPermission(sale)
		})
	};

	$scope.isSaleDisabled = function(sale){
		return ($scope.salesPermission[sale.id] ||
				$scope.isFreeze() ||
				(sale.available && sale.available == 0))
	};

	$scope.editIn = {}
	$scope.addPayment = {}
	$scope.editIn.model = {}
	$scope.editIn.editNow = false;
	$scope.editIn.isAdd = false;

	initPayments = function(data){
		$scope.payments = [];
		$scope.installments_payments = [];
		$scope.reserve_payments = [];
		$scope.paymentsBlock.done = 0;
		$scope.paymentsBlock.done_full = 0;
		// $scope.reserve_payment = 12;

		data.forEach(function(payment){
			if(payment.xtype == 'reserve'){
				$scope.reserve_payments.push(payment);
			}
			if (payment.xtype == 'install'){
				$scope.installments_payments.push(payment);
				$scope.paymentsBlock.calculated = true;
				$scope.paymentsBlock.active = 'installments';
				if (!!payment.fakt_date){
					$scope.paymentsBlock.done += payment.amount;
				}
			}
			if (payment.xtype == 'full'){
				$scope.payments.push(payment);
				if (!!payment.fakt_date){
					$scope.paymentsBlock.done_full += payment.amount;
				}
				if (!$scope.paymentsBlock.active)
					$scope.paymentsBlock.active = 'usual';
			}
		})
		$scope.paymentsBlock.active = $scope.paymentsBlock.active || 'usual';
	}

	payments.$promise.then(function(data){
		initPayments(data);
	})

	$scope.isAblePayment = false;

	$scope.paymentsBlock = {};
	$scope.paymentsBlock.calculated = $scope.paymentsBlock.calculated || false;
	$scope.paymentsBlock.installments = {};
	$scope.paymentsBlock.installments.source = {first_amount: '', month_count: '', day: ''};
	//переписать жесть - объединить с active и инициализацией
	$scope.paymentsBlock.disabledRadio = function(type){
		//группа статусов резерв + ДДУ рассрочка
		if ($scope.flat.status && $scope.flat.status.group == 2 && $scope.flat.status.contract == 9){
			if (type == 'payments')
				return !($scope.payments && $scope.payments.length>0);
			if (type == 'installments_payments')
				return false;
		}
		if ($scope.flat.status && $scope.flat.status.group == 2 && $scope.flat.status.contract != 9){
			if (type == 'installments_payments')
				return !($scope.installments_payments && $scope.installments_payments.length>0);
			if (type == 'payments')
				return false;
		}
		if (type == 'installments_payments')
			return ($scope.payments && $scope.payments.length>0)
		if (type == 'payments')
			return ($scope.installments_payments && $scope.installments_payments.length>0)
	}

	isOverDate = function(date, day_of_month){
		date = angular.copy(date);
		date.setDate(1);
		date.setMonth(date.getMonth()+2);
		date.setDate(0);
		return (date.getDate() < day_of_month);
	}

	$scope.getPriceForCalculate = function(){
		if ($scope.flat.installment_price == 0) return;
		var from_price = $scope.flat.installment_price - $scope.flat.reserve_price;
		//если тип договора ДДУ рассрочка, то вычитаем другой резерв + стоимость по ДДУ
		if (!!$scope.flat.status && $scope.flat.status.contract == 9)
			from_price = $scope.flat.installment_ddu_price;
		return from_price;
	}

	$scope.paymentsBlock.installments.calculate = function(){
		var source = $scope.paymentsBlock.installments.source,
			payments = [],
			payment = {'typex': 'install', 'by_installments': true, 'fakt_date': null, 'date': source.first_day, 'amount': source.first_amount};
		payments.push(payment);
		var sum, result, count, rest, div, change, sum_change = 0;
		// ddu_price
		//flat.super_price
		if ($scope.flat.installment_price == 0) return;
		var from_price = $scope.getPriceForCalculate();
		// if (!from_price)
		// 	from_price = $scope.flat.ddu_price;
		sum =  from_price - source.first_amount;
		div = sum/source.month_count;
		result = Math.floor(div);
		change = div - result;
		count = sum/div;
		rest = sum - div*count;
		sum_change = change*source.month_count;
		var next_month = angular.copy(source.day),
			day_of_month = next_month.getDate();

		for (var i=0; i<count; i++){
			var payment = {'typex': 'install', 'by_installments': true, 'fakt_date': null, 'date': angular.copy(next_month), 'amount': result}
			payments.push(payment);
			if (isOverDate(next_month,day_of_month)){
				var prev_m = next_month.getMonth();
				next_month.setMonth(prev_m + 1);
				next_month.setDate(0);
			}
			else {
				var prev_m = next_month.getMonth();
				next_month.setMonth(prev_m + 1);
				next_month.setDate(day_of_month);
			}
			console.log('result  ', result);
		}
		if (rest>1 || sum_change>1){
			payments[count].amount += rest+sum_change;
		}
		$scope.paymentsBlock.calculateBuffer = true;
		// FlatPayments.save({f_pk: flat_pk}, {data: payments}, function(data){
		// 		FlatPayments.query({f_pk: flat_pk}, function(data){
		// 			initPayments(data);
		// 			$scope.paymentsBlock.calculated = true;
		// 		});
		// 	})
		$scope.paymentsBuffer = payments
		console.log('payments   ', payments)
		$scope.installments_payments = payments;
		$scope.paymentsBlock.calculated = true;
	}

	$scope.paymentsBlock.installments.save = function(){
		FlatPayments.save({f_pk: flat_pk}, {data: $scope.paymentsBuffer}, function(data){
			FlatPayments.query({f_pk: flat_pk}, function(data){
				initPayments(data);
				$scope.paymentsBlock.calculated = true;
				$scope.paymentsBlock.calculateBuffer = false;
			});
			updateFlatStatuses();
		})
	}

	$scope.paymentsBlock.installments.cancel = function(){
				$scope.paymentsBlock.calculated = false;
				$scope.paymentsBlock.calculateBuffer = false;
	}

	$scope.editIn.removeCancel = function(){
		$('#removePayment').modal('hide');
	}

	$scope.editIn.edit = function(obj, index){
		if ($scope.editIn.isAdd) return;
		$scope.editIn.model ={}
		$scope.editIn.model = angular.copy(obj)
		if (!!$scope.editIn.model.date)
			$scope.editIn.model.date = $scope.editIn.model.date;
		if (!!$scope.editIn.model.fakt_date)
			$scope.editIn.model.fakt_date = $scope.editIn.model.fakt_date;
		$scope.editIn.editNow = index;
	}

	$scope.editIn.delet = function(obj, index){
		if ($scope.editIn.isAdd) return;
		$scope.editIn.modal = {};
		$scope.editIn.modal.obj = obj;
		$scope.editIn.modal.ind = index;
		$('#removePayment').modal('show');
	};

	$scope.editIn.remove = function(){
		p_pk = $scope.editIn.modal.obj.id;
		FlatPayments.delete({f_pk: flat_pk, p_pk: p_pk}, function(data){
			$scope.editIn.init()
			$scope.editIn.removeCancel()
			updateFlatStatuses();
		})
	};

	//

	$scope.editIn.save = function(obj, index){
		data = angular.copy($scope.editIn.model);
		// if ($scope.editIn.model['xtype'] == "install"){
		// 	if ($scope.editIn.model['date'] == obj['date']){
		// 		//пересчитать??
		// 	}
		// }
		if (!!data.date)
			data.date = data.date;
		if (!!data.fakt_date)
			data.fakt_date = data.fakt_date;
		data.client_id = $scope.client_pk;
		if ($scope.editIn.isAdd){
			data.xtype = "full";
			FlatPayments.save({f_pk: flat_pk}, {data: data}, function(data){
				console.log('Payments.save  ', data)
				$scope.editIn.init();
				updateFlatStatuses();
			})
		} else {
			p_pk = obj.id
			FlatPayments.update({f_pk: flat_pk, p_pk: p_pk}, {data: data}, function(data){
				console.log('Payments.update  ', data)
				$scope.editIn.init();
				updateFlatStatuses();
			})
		}
	}

	// $scope.editIn.saveToField = function(index){
	// 	$scope.payments[index] = angular.copy($scope.editIn.model)
	// 	$scope.editIn.model = {};
	// 	$scope.editIn.editNow = false;
	// 	$scope.editIn.isAdd = false;
	// }

	$scope.editIn.add = function(){
		$scope.editIn.isAdd = true;
		obj = {};
		obj.createdon = new Date();
		$scope.editIn.model = {};
		if ($scope.payments && $scope.payments.length == 0)
			$scope.editIn.model.amount = $scope.flat.ddu_price;
		$scope.payments.push(obj);
		$scope.editIn.editNow = $scope.payments.length-1;
	}

	$scope.editIn.cancel = function(){
		if ($scope.editIn.isAdd)
			$scope.payments.pop();
		$scope.editIn.model = {};
		$scope.editIn.editNow = false;
		$scope.editIn.isAdd = false;
	}

	$scope.editIn.isEdit = function(index){
		return ($scope.editIn.editNow === index);
	}

	$scope.editIn.init = function(){
		FlatPayments.query({f_pk: flat_pk}, function(data){
			initPayments(data);
			$scope.editIn.model = {};
			$scope.editIn.editNow = false;
			$scope.editIn.isAdd = false;
		});
	};

	// dateParse = function(date){
	// 	var time;
	// 	if (!!Date.parse(date)){
	// 		time = new Date(Date.parse(date));
	// 	} else {
	// 		var a = date.split(/[^0-9]/);
	// 		time = new Date (a[0],a[1]-1,a[2],a[3],a[4],a[5]);
	// 	}
	// 	return time;
	// };

	$scope.isOverdue = function(status_time, possible_delay){
		if (!possible_delay || !status_time) return false;
        var status_time = Date.fromStr(status_time);
        status_time.setHours(0,0,0,0);
        var now = new Date();
        now.setHours(0,0,0,0);
        return (now>status_time);
    }

	$scope.addPayment.removeCancel = function(){
		$('#removePaymentAdd').modal('hide');
	}

	$scope.addPayment.edit = function(obj, index){
		if ($scope.addPayment.isAdd) return;
		$scope.addPayment.model ={}
		$scope.addPayment.model = angular.copy(obj)
		if (!!$scope.addPayment.model.date)
			$scope.addPayment.model.date = $scope.addPayment.model.date;
		if (!!$scope.addPayment.model.fakt_date)
			$scope.addPayment.model.fakt_date = $scope.addPayment.model.fakt_date;
		$scope.addPayment.editNow = index;
	}

	$scope.addPayment.delet = function(obj, index){
		if ($scope.addPayment.isAdd) return;
		$scope.addPayment.modal = {};
		$scope.addPayment.modal.obj = obj;
		$scope.addPayment.modal.ind = index;
		$('#removePaymentAdd').modal('show');
	}

	$scope.addPayment.remove = function(){
		p_pk = $scope.addPayment.modal.obj.id;
		FlatPayments.delete({f_pk: flat_pk, p_pk: p_pk}, function(data){
			$scope.addPayment.init();
			$scope.addPayment.removeCancel();
			updateFlatStatuses();
		})
	}

	$scope.addPayment.save = function(obj, index){
		data = angular.copy($scope.addPayment.model)
		if (!!data.date)
			data.date = data.date
		data.client_id = $scope.client_pk;
		if ($scope.addPayment.isAdd){
			data.xtype = "reserve";
			FlatPayments.save({f_pk: flat_pk}, {data: data}, function(data){
				console.log('Payments.save  ', data)
				// $scope.editIn.saveToField(index)
				$scope.addPayment.init();
				updateFlatStatuses();
			})
		}
		else {
			p_pk = obj.id
			FlatPayments.update({f_pk: flat_pk, p_pk: p_pk}, {data: data}, function(data){
				console.log('Payments.update  ', data)
				// $scope.editIn.saveToField(index)
				$scope.addPayment.init();
				updateFlatStatuses();
			})
		}
	}

	$scope.addPayment.add = function(){
		$scope.addPayment.isAdd = true;
		obj = {};
		obj.createdon = new Date();
		$scope.addPayment.model = {};
		$scope.reserve_payments.push(obj);
		$scope.addPayment.editNow = $scope.reserve_payments.length-1;
	}

	$scope.addPayment.cancel = function(){
		if ($scope.addPayment.isAdd)
			$scope.reserve_payments.pop();
		$scope.addPayment.model = {};
		$scope.addPayment.editNow = false;
		$scope.addPayment.isAdd = false;
	}

	$scope.addPayment.isEdit = function(index){
		return ($scope.addPayment.editNow === index);
	}

	$scope.addPayment.init = function(){
		FlatPayments.query({f_pk: flat_pk}, function(data){
			initPayments(data);
			$scope.addPayment.model = {};
			$scope.addPayment.editNow = false;
			$scope.addPayment.isAdd = false;
		});
	}

	$scope.fastContact = {};

	$scope.fastContact.addClient = function(){
		$('#fastContactAdd').modal('show');
		$scope.fastContact.new_client = {};
		$scope.fastContact.new_client.fio = $scope.fio;
		$scope.fastContact.new_client.phone = '';
		$scope.fastContact.load = false;
	};

	$scope.fastContact.createClient = function(){
		var cont = new Contacts();
		cont.data = $scope.fastContact.new_client;
		cont.data.time = new Date();
		cont.data.comment = "создан через быстрое добавление контакта";
		cont.data.source = 6;//другое
		cont.data.typex = 1;//входящий
		cont.data.result = 6;//другое
		cont.data.flat = "";
		cont.data.notification_time = "";
		$scope.fastContact.load = true;
		cont.$save(function(data){
			Clients().query(function(clients){
				$scope.clientsList = angular.copy(clients);
				$scope.clientsListForDeal = angular.copy(clients);
				$scope.result = clients.filter(function(c){
					return c.fio==$scope.fastContact.new_client.fio &&
							c.phone==$scope.fastContact.new_client.phone})[0];
				$scope.clients = clients.toDictionary();
				$scope.fastContact.cancel();
			});
			console.log('$scope.fastContact  ', $scope.fastContact)
		})

	};

	$scope.fastContact.cancel = function(){
		$('#fastContactAdd').modal('hide');
		$scope.fastContact.new_client = {};
	};
	
	$scope.exactArea = function(first, second){
		if(second == undefined) return first;
		return second;
	};


}
