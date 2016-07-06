function ignoreMouseWheel(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			element.bind('mousewheel', function(event){
				element[0].blur();
			});
		}
	}
};

function dropdownMenu(){
	return {
		restrict: 'AE',
		link: function(scope, elem, attrs, ctrl){
			elem.bind('click', function (e){
				if (e.target.className.indexOf('dropdown-client') == -1)
			    	return false;
			});
		}
	}
};

function format($filter) {
    return {
        require: '?ngModel',
        link: function(scope, elem, attrs, modelCtrl){
            if (!modelCtrl) return;

            modelCtrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(modelCtrl.$modelValue)
            });

            function getCaretPosition(input){
		        if (!input) return 0;
		        if (input.selectionStart !== undefined) {
		            return input.selectionStart;
		        } else if (document.selection) {
		            // Curse you IE
		            input.focus();
		            var selection = document.selection.createRange();
		            selection.moveStart('character', input.value ? -input.value.length : 0);
		            return selection.text.length;
		        }
		        return 0;
		    };

		    function setCaretPosition(input, pos){
		        if (!input) return 0;
		        if (input.offsetWidth === 0 || input.offsetHeight === 0) {
		            return; // Input's hidden
		        }
		        if (input.setSelectionRange) {
		            input.focus();
		            input.setSelectionRange(pos, pos);
		        }
		        else if (input.createTextRange) {
		            // Curse you IE
		            var range = input.createTextRange();
		            range.collapse(true);
		            range.moveEnd('character', pos);
		            range.moveStart('character', pos);
		            range.select();
		        }
		    };

            modelCtrl.$parsers.unshift(function (viewValue){
                var plainNumber = viewValue.replace(/^0+\d*/g, '0');
                plainNumber = plainNumber.replace(/[^\d]/g, '');
                var pos = getCaretPosition(elem[0]);
                elem.val($filter(attrs.format)(plainNumber));
                var newPos = pos + modelCtrl.$viewValue.length - plainNumber.length;
            	setCaretPosition(elem[0], newPos);
                return plainNumber;
            });
        }
    };
};


function inputConnection(){
	return {
		restrict: 'AE',
		scope: {
			conmodel: '='
		},
		require: 'ngModel',
		link: function(scope, elem, attrs, ngModelCtrl){

			scope.$watch(function(){return ngModelCtrl.$viewValue}, function(){
				scope.conmodel = ngModelCtrl.$viewValue;
			});
		}
	}
};

function inputSearch($document){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			list: '=',
			result: '=',
			disabled: '=?',
			invalid: '=?'
		},
		templateUrl: '/assets/app_main/views/inputSearchDirective.html',
		link: function(scope, elem, attrs, ngModelCtrl){
			var isShow = false;

			byPhone = function(){
				var s = scope.conmodel.substring(0, scope.conmodel.indexOf('_')) || scope.conmodel;
				s = s.replace(/\(/, "\\(");
				s = s.replace(/\)/, "\\)");
				if (s.length == 0 || s.length<12) return [];
				var regExp = new RegExp('^\\'+s, 'i');
				return scope.list.filter(function(client){return regExp.test(client.phone)})
			}

			scope.$watch(function(){return scope.conmodel}, function(){
				if (scope.conmodel == undefined || scope.list == undefined) return;
				scope.listSearch = byPhone();
				if (scope.listSearch.length == 1 &&
					scope.listSearch[0].phone == scope.conmodel){
					scope.pickObj(scope.listSearch[0]);
				}
			})

			scope.pickObj = function(obj){
				// console.log('scope.pickObj  ')
				scope.model = obj.phone;
				scope.result = obj;
				isShow = false;
				scope.invalid = false;
			}

			scope.showSearchResult = function(){
				if (!!scope.result)//нужно для работы в связке
		      		scope.model = scope.result.phone;
				if (!scope.listSearch || scope.listSearch.length==0)
					return false;
				if (!!scope.model && scope.listSearch.length==1)
					return false
				return isShow;
			}

			//нужно чтобы обнулять результаты изза присваивания модели в связке и результата в вотче
			scope.checkResult = function(keyEvent){
				if (!!scope.result && keyEvent.keyCode==8)
					scope.result = null;
			}
			//нужно чтобы обнулять результаты изза присваивания модели в связке и результата в вотче
			scope.toShow = function() {
				isShow = true;
				scope.result = null;
			}

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;
		        if (isClickedElementChildOfPopup)
		          return;
		        isShow = false;
		        scope.$apply();
		    });

		}
	}
};

function inputSearchFio($document){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			list: '=',
			result: '=',
			disabled: '=?',
			invalid: '=?',
			additem: '&?'
		},
		templateUrl: '/assets/app_main/views/inputSearchFioDirective.html',
		link: function(scope, elem, attrs, ngModelCtrl){
			var isShow = false;
			scope.showAdd = false;
			console.log('----------')
			console.log('attrs  ', attrs)
			console.log('attrs  ', !!attrs['additem'])

			if (!!attrs['additem'])
				scope.showAdd = true;

			scope.canAdd = function(){
				return scope.showAdd &&
					!scope.disabled &&
					scope.listSearch && scope.listSearch.length == 0 &&
					!scope.result &&
					scope.model && scope.model.length>0;
			}

			scope.callAdd = function(){
				scope.additem();
			}

			byFio = function(){
				if (scope.model.length == 0) return [];
				var names = [];
				names = scope.model.split(' ');
				reg_str = names.map(function(name){return '(?=.*'+name+')'}).join('');
				var regExp = new RegExp(reg_str, 'i');
				return scope.list.filter(function(client){ return regExp.test(client.fio) });
			}

			scope.$watch(function(){return scope.model}, function(){
				if (scope.model == undefined) return;
				if (scope.list == undefined) return;
				scope.listSearch = byFio();
				if (scope.listSearch.length == 1 && scope.listSearch[0].fio.length == scope.model.length)
					scope.pickObj(scope.listSearch[0]);
			})

			scope.pickObj = function(obj){
				// console.log('scope.pickObj  ')
				scope.model = obj.fio;
				scope.result = obj;
				isShow = false;
				scope.invalid = false;
			}

			scope.removeResult = function(){
				scope.result = null;
				isShow = true;
			}

			scope.showSearchResult = function(){
				if (!!scope.result){
		      		scope.model = scope.result.fio;
		      	}
				if (scope.listSearch && scope.listSearch.length == 0)
					return false;
				return isShow;
			}

			scope.clickInput = function() {
				if (scope.listSearch && scope.listSearch.length > 1)
					isShow = true;
			}

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;
		        if (isClickedElementChildOfPopup)
		          return;
		      	// if (!!scope.result){
		      	// 	scope.model = scope.result.fio;
		      	// }
		        isShow = false;
		        scope.$apply();
		    });

		}
	}
};

function inputSearchFioTemp($document){
	return {
		restrict: 'AE',
		scope: {
			model1: '=',
			list1: '=',
			result1: '=',
			disabled1: '=?',
			invalid1: '=?'
		},
		templateUrl: '/assets/app_main/views/inputSearchFioTempDirective.html',
		link: function(scope, elem, attrs, ngModelCtrl){
			var isShow1 = false;

			byFio1 = function(){
				if (scope.model1.length == 0) return [];
				var names = [];
				names = scope.model1.split(' ');
				reg_str = names.map(function(name){return '(?=.*'+name+')'}).join('')
				// console.log('reg_str  ', reg_str)
				var regExp = new RegExp(reg_str, 'i')
				return scope.list1.filter(function(client){ return regExp.test(client.fio) })
			}

			scope.$watch(function(){return scope.model1}, function(){
				if (scope.model1 == undefined) return;
				if (scope.list1 == undefined) return;
				scope.listSearch1 = byFio1();
				if (scope.listSearch1.length == 1 && scope.listSearch1[0].fio.length == scope.model1.length)
					scope.pickObj1(scope.listSearch1[0]);
			})

			scope.pickObj1 = function(obj){
				// console.log('scope.pickObj  ')
				scope.model1 = obj.fio;
				scope.result1 = obj;
				isShow1 = false;
				scope.invalid = false;
			}

			scope.removeResult1 = function(){
				scope.result1 = null;
				isShow1 = true;
			}

			scope.showSearchResult1 = function(){
				if (!!scope.result1){
		      		scope.model1 = scope.result1.fio;
		      	}
				if (scope.listSearch1 && scope.listSearch1.length == 0)
					return false;
				return isShow1;
			}

			scope.clickInput1 = function() {
				if (scope.listSearch1 && scope.listSearch1.length > 1)
					isShow1 = true;
			}

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;
		        if (isClickedElementChildOfPopup)
		          return;
		      	// if (!!scope.result){
		      	// 	scope.model = scope.result.fio;
		      	// }
		        isShow1 = false;
		        scope.$apply();
		    });

		}
	}
};

function leftMenuDir(LeftMenu, UpdateFactory){
	return {
		restrict: 'AE',
		templateUrl: '/assets/app_main/views/leftMenuDirective.html',
		link: function(scope, elem, attr){
			scope.$watch(function(){return UpdateFactory.getBuildings()}, function(nv ,ov){
				scope.menulist = LeftMenu.query();
			})
		}
	}
};

function toggleElem($state){
	return {
		restrict: 'AE',
		scope: {
			item: '='
		},
		link: function(scope, elem, attr){
	        var getPk = function(str){
				return str.match(/[0-9]+/g);
			};

	     	elem.bind('click', function(){
	           	elem.toggleClass('subdrop');
	            elem.next('.list-unstyled').slideToggle();

	            if (scope.item.name == 'Дома' && elem.hasClass('subdrop')){
	            	var pk = getPk(scope.item.links[0].link);
	            	$state.go('build_view', {b_pk: pk[0], s_pk: pk[1]});
	            }
	        });

		}
	}
};

function activeElem($state, $compile){
	return {
		restrict: 'AE',
		link: function(scope, elem, attr){

			scope.$watch(function(){return $state.href($state.current.name)}, function(cur_url, old_url){
				var cur_state = $state.current.name,
					tab_href = attr.href;
				if (cur_url.indexOf('buildings')>0 && cur_url.indexOf('sections')>0){
					actual_url = getBuildingUrl(cur_url);
					tab_href = getBuildingUrl(attr.href);
				} else {
					actual_url = $state.href(cur_state, {}, {'inherit': false});
				}
				elem.removeClass('active');
				if (tab_href.indexOf('price_manage') > -1 && actual_url.indexOf('price_manage') > -1){
					elem.addClass('active');
					return;
				}
				if ($state.current.name != 'main' && tab_href.indexOf(actual_url) > -1)
					elem.addClass('active');
			})

			getBuildingUrl = function(str){
				var regExp = new RegExp("\\d*$");
				return str.replace(regExp, "");
			}
		}
	}
};

function tagsInput(){
	return {
		restrict: 'AE',
		scope: {
			list: '='
		},
		templateUrl: '/assets/app_main/views/tagsInputDirective.html',
		link: function(scope, elem, attr){
			scope.inputTag = '';

			scope.lostFocus = function(){
				if (scope.inputTag == '') return;
				scope.inputTag = scope.inputTag.replace(/,/g, '.');
				scope.list.push(scope.inputTag);
				scope.inputTag = '';
			}

			scope.catchKeyPress = function(keyEvent){
				if (keyEvent.charCode === 13){
					scope.lostFocus();
					// keyEvent.target.blur()
				}
				return;
			}

			scope.removeTag = function(index){
				scope.list.splice(index, 1)
			}
		}
	}
};

function multipleInput(){
	return {
		restrict: 'AE',
		scope: {
			list: '='
		},
		templateUrl: '/assets/app_main/views/multipleInputDirective.html',
		link: function(scope, elem, attr){
			scope.multiInput = {};

			scope.multiInput.removeItem = function(index){
				scope.list.splice(index, 1);
			}

			scope.multiInput.addItem = function(){
				// console.log('scope.list   ', scope.list)
				if (!scope.list) scope.list = []
				scope.list.push('');
			}
		}
	}
};

function oneSelect($document){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			list: '=',
			onchanged: '&?',
			disabled: '=?',
			invalid: '=?'
		},
		templateUrl: '/assets/app_main/views/oneSelectDirective.html',
		link: function(scope, elem, attr){

			scope.select = {};
			scope.select.condition = false;
			// //при нажатии на инпут
			scope.select.toggleDropdown = function(){
				scope.select.condition = !scope.select.condition;
			}

			// //показывать список или нет
			scope.select.showDropdown = function(){
				return scope.select.condition;
			}

			//смена статуса у списка из селекта при нажатии
			scope.select.toggleName = function(obj){
				temp = (!!scope.model) ? scope.model.id : null;
				new_temp = (!!obj) ? obj.id : null;
				scope.model = obj;
				scope.select.condition = false;
				if (temp!= new_temp && 'onchanged' in scope)
					scope.onchanged({par: scope.model});
			}

			// scope.isEmpty = function(){
			// 	return (scope.list==undefined || scope.list.length==0 || (scope.list.length==1 && scope.list[0].id=='all'))
			// }

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;

		        if (isClickedElementChildOfPopup)
		          return;

		        scope.$apply(function(){
		            scope.select.condition = false;
		        });
		    });
		}
	}
};

function oneSelectStatus($document, $parse){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			list: '=',
			type: '=',
			disabled: '=?',
			invalid: '=?',
			onchanged: '&?',
			isShow: '&?'
		},
		templateUrl: '/assets/app_main/views/oneSelectStatusDirective.html',
		link: function(scope, elem, attr){
			// console.log('oneSelectStatus scope ', scope)

			scope.select = {};

			scope.select.isShow = function(obj){
				if (attr['isShow'])
					return scope.isShow({obj: obj});
				return true;
			}

			scope.select.condition = false;
			// //при нажатии на инпут
			scope.select.toggleDropdown = function(){
				scope.select.condition = !scope.select.condition;
			}

			// //показывать список или нет
			scope.select.showDropdown = function(){
				return scope.select.condition;
			}

			//смена статуса у списка из селекта при нажатии
			scope.select.toggleName = function(obj){
				temp = (!!scope.model) ? scope.model.id : null;
				new_temp = (!!obj) ? obj.id : null;
				scope.model = obj;
				scope.select.condition = false;
				scope.invalid = false;
				if (temp!= new_temp && 'onchanged' in scope)
					scope.onchanged({par: scope.model});
			}

			scope.select.isType = function(type){
				return (type==scope.type)
			}

			$document.bind('click', function(event){
				// console.log('$document.bind(click, function(event){')
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;

		        if (isClickedElementChildOfPopup)
		          return;

		        scope.select.condition = false;
		        scope.$apply();
		    });
		}
	}
};

function fileInput(settings){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			conmodel: '@'
		},
		templateUrl: '/assets/app_main/views/fileInputDirective.html',
		link: function(scope, elem, attr){
			scope.base_href = settings.base_href;

			//костыль - выполняется при открытии окна с данной директивой 
			//видимо чтобы пережать значение showmodel
			//но файл заливается в model
			//showmodel - только тотбражени во вьюхе
			scope.$watch('conmodel', function(newVal, oldVal){
				scope.showmodel = scope.model;
			}, true);

			scope.$watch(function(){return JSON.stringify(scope.showmodel)}, function(newVal, oldVal){
				scope.newFile = !scope.showmodel;
			}, true);

			scope.deleteFile = function(){
				scope.showmodel = null;
				angular.element("input[type='file']").val(null);
				scope.model = null;
			};

			scope.uploadFile = function(files) {
		    	scope.model = files[0];
		    	var reader = new FileReader();
		    	reader.onload = function (e) {
		            scope.showmodel = e.target.result;
		            scope.$apply();
		        }
		        reader.readAsDataURL(files[0]);
			};
		}
	}
}

function checkboxSet(){
	return {
		restrict: 'AE',
		scope: {
			list: '='
		},
		templateUrl: '/assets/app_main/views/checkboxSetDirective.html',
		link: function(scope, elem, attr){
		}
	}
}

function formErrors($compile){
	return {
		restrict: 'AE',
		scope: {
			errors: '='
		},
		template: '<ul class="parsley-errors-list filled" id="parsley-id-4">'+
					'<li class="parsley-required" ng-repeat="error in errors">'+
					'{{error}}'+
					'</li>'+
				'</ul>'
	}
}

function formInput($compile){
	return {
		restrict: 'AE',
		scope: {
			type: '=',
			model: '=',
			list: '=',
			placeholder: '=?',
			errors: '=',
			onchanged: '&?',
			objid: '=?'
		},
		templateUrl: '/assets/app_main/views/formInputDirective.html',
		link: function(scope, elem, attr){
			scope.isType = function(input_type){
				return (scope.type == input_type);
			};

			scope.isInvalid = function(){
				if (!!scope.errors && scope.errors.length>0)
					return 'has-error';
				return '';
			};

			scope.$watchGroup( ['type', 'errors'], function(newVal, oldVal){
				// console.log('some changes')
				var html = '',
					error = '';
				switch (scope.type) {
					case 'Char'://and length choices ==0
						html = '<input type="text" class="form-control" ng-model="model" ng-class="isInvalid()" placeholder="{{placeholder}}">';
						break;
					case 'Phone'://and length choices ==0
						html = '<input type="text" class="form-control" ng-model="model">';
						break;
					case 'Float':
					case 'Integer':
					case 'BigInteger':
						html = '<input type="number" class="form-control" ng-model="model" ng-class="isInvalid()" placeholder="{{placeholder}}" ignore-mouse-wheel min="0">';
						break;
					case 'ForeignKey':
					case 'Select':
						html = '<div one-select model="model" list="list"></div>';
						break;
					case 'JSON':
						html = '<div tags-input list="model"></div>';
						break;
					case 'File':
						html = '<div file-input model="model" conmodel="{{objid}}"></div>';
						break;
					case 'Date':
					case 'DateTime':
						html = '<input type="text" class="form-control" placeholder="дд.мм.гггг" id="datepicker"'+
								'jqdatepicker ng-model="model" ng-model-options="{ updateOn: \'blur\'}">'
						break;
					case 'MultiSelect':
						html = '<div multiple-select list="model" placeholder="placeholder"></div>'
						break;
					case 'Checkbox':
                 		html = '<div checkbox-set list="list"></div>';
						break;
					case 'Textarea':
						// html = '<textarea required class="form-control" data-parsley-id="50"></textarea>'
						html = '<textarea class="form-control" ng-model="model"></textarea>'
						break;
				}
				error = '<div form-errors errors="errors"></div>'
				html += error;
				elem.html(html).show();
	        	$compile(elem.contents())(scope);
			})
		}
	}
}

function jqdatepicker(DateFormat, $parse){
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl){
        	//format text from the user (view to model)
			ngModelCtrl.$parsers.push(function(value) {
				// console.log('from the user  ', value)
				return DateFormat.toDateN(value)
			});

            //format text going to user (model to view)
	        ngModelCtrl.$formatters.push(function(value) {
				// console.log('to the user  1', value)
				return DateFormat.fromDateN(value)
			});

			scope.$watch(function(){return ngModelCtrl.$viewValue}, function(oldVal, newVal){
				if (ngModelCtrl.$viewValue && ngModelCtrl.$viewValue.length != 10) return;
				element.datepicker('setDate',ngModelCtrl.$viewValue);
				element.datepicker('update');
				element.blur();
			})

			element.datepicker({
                dateFormat: 'DD, MM, yy',
                language: 'ru',
                autoclose: true,
                todayHighlight: true
            });
        }
    };
};

function jqdatepickerCallback(DateFormat, $parse, $timeout){
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl){
            //format text going to user (model to view)
	        ngModelCtrl.$formatters.push(function(value) {
				return DateFormat.fromDateN(value)
			});

			//format text from the user (view to model)
			ngModelCtrl.$parsers.push(function(value) {
				return DateFormat.toDateN(value)
			});

			// scope.$watch(function(){return ngModelCtrl.$viewValue}, function(oldVal, newVal){
			// 	element.datepicker('setDate',$parse(attrs['ngModel'])(scope));
			// 	element.datepicker('update');
			// })

			scope.$watch(function(){return ngModelCtrl.$viewValue}, function(oldVal, newVal){
				if (ngModelCtrl.$viewValue && ngModelCtrl.$viewValue.length != 10) return;
				element.datepicker('setDate',ngModelCtrl.$viewValue);
				element.datepicker('update');
				element.blur();
			})

			element.bind('show', function(){
	            angular.element('.datepicker.datepicker-dropdown > .datepicker-days table td.day').not('td.active').bind('click', function(){
	            	$timeout(function(){
	            		scope.change_date(null)},
	            	1000)
	            })
	        });

			element.datepicker({
                dateFormat: 'DD, MM, yy',
                language: 'ru',
                autoclose: true,
                todayHighlight: true
            });
        }
    };
};

function bootpopoverimg($compile, $document){
	return {
        restrict: 'A',
        scope: {
        	img: '=',
        },
        link: function(scope, element, attrs){

        	// aria-describedby
        	element.popover({
		        html : true,
		        content: function() {
	        		html = '<div class="flat-row">'+
	        					'<div class="img-wrapper">'+
	        						'<img ng-src="{{img}}">'+
	        					'</div>'+
	        				'</div>';
		          	var linkFn = $compile(angular.element(html));
		          	return linkFn(scope);
		        }
		    });

        }
    };
};

function bootpopovernew($document){
	return {
        restrict: 'A',
        link: function(scope, element, attrs){
        	element.popover({
		        html : true
		    });

		    $document.bind('click', function(e) {
		    	if (!element.is(e.target) && angular.element('.popover').find(e.target).length == 0)
		    		element.popover('hide');
			});

        }
    };
};

function jqcalendar(){
    return {
        restrict: 'A',
        require: 'ngModel',
         link: function(scope, element, attrs, ngModelCtrl){
         	// console.log('element.fullCalendar  ')
         	// console.log('element.fullCalendar  ')
         	// console.log(scope.events)

         	scope.$watchCollection(function(){return scope.events}, function(){
				// console.log('$watchCollection   ', scope.events)
			    // element.fullCalendar('refetchEvents');
			    // console.log('window.calendar  ', window.calenda
			    if (scope.events == undefined) return;
			    // window.calendar.fullCalendar('renderEvent', scope.events[0]);
			    window.calendar.fullCalendar('removeEvents');
			    window.calendar.fullCalendar('addEventSource', scope.events);
			    // console.log('fullCalendar  ', window.calendar.fullCalendar('clientEvents'));

			})


			window.calendar = element.fullCalendar({
	            lang: 'ru',
	            timezone: 'local',
	            dayClick: function(){
	            	// console.log('dayClick')
	            },
	            onDrop: function(){
	            	// console.log('onDrop')
	            },
	            slotDuration: '00:15:00', /* If we want to split day time each 15minutes */
	            minTime: '08:00:00',
	            maxTime: '19:00:00',
	            defaultView: 'month',
	            handleWindowResize: true,
	            // height: $(window).height() - 200,
	            header: {
	                left: 'prev,next today',
	                center: 'title',
	                right: 'month,agendaWeek,agendaDay'
	            },
	            // editable: true,
	            // droppable: true, // this allows things to be dropped onto the calendar !!!
	            eventLimit: true, // allow "more" link when too many events
	            selectable: true,
	            eventSources: [{events: scope.events}]
	            // drop: function(date) { console.log(' $this.onDrop($(this), date);') },
	            // select: function (start, end, allDay) { console.log('$this.onSelect(start, end, allDay);') },
	            // eventClick: function(calEvent, jsEvent, view) { console.log('$this.onEventClick(calEvent, jsEvent, view);') },
			});
        }
    };
};

function niceScroll(){
    return {
        restrict: 'AE',
        link: function(scope, element, attrs, ngModelCtrl){
            element.niceScroll();
        }
    };
};

function chartLines(){
    return {
        restrict: 'AE',
        scope: {
        	points: '='
        },
        link: function(scope, element, attrs){
        	var lineCharts = {};

        	scope.$watch(function(){return scope.points}, function(){
        		if (scope.points == undefined) return;
        		if (lineCharts[attrs.points])
        			lineCharts[attrs.points].destroy();
        		lineCharts[attrs.points] = createLineChart(scope.points, element);
        	})

        	// scope.$watchCollection(['timeRange', 'type'], function(){
        	// 	if (scope.timeRange == undefined || scope.type == undefined) return;
        	// 	// createLineChart(scope.points, element)
        	// 	console.log("$watchCollection(['timeRange', 'type']")
        	// })

        	createLineChart = function(points, elem){
        		// if (this.lineChart) this.lineChart.destroy()
        		// console.log('createLineChart element  ', elem)
        		var ctx = elem.get(0).getContext("2d"),
                data = {
                    labels: points.time,
                    datasets: [{
                        label: '',
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: points.count
                    }]
                },
                options = {
                	scaleShowGridLines : false,
				    //String - Colour of the grid lines
				    // scaleGridLineColor : "rgba(0,0,0,.05)",
				    // //Number - Width of the grid lines
				    // scaleGridLineWidth : 1,
				    // //Boolean - Whether to show horizontal lines (except X axis)
				    // scaleShowHorizontalLines: true,
				    // //Boolean - Whether to show vertical lines (except Y axis)
				    // scaleShowVerticalLines: true,
				    pointDot : false,
				    //Number - Radius of each point dot in pixels
				    pointDotRadius : 4,
				    // //Number - Pixel width of point dot stroke
				    // pointDotStrokeWidth : 1,
				    // //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
				    // pointHitDetectionRadius : 20,
				    // //Boolean - Whether to show a stroke for datasets
				    // datasetStroke : true,
				    // //Number - Pixel width of dataset stroke
				    // datasetStrokeWidth : 2,
				    // //Boolean - Whether to fill the dataset with a colour
				    // datasetFill : true
				    showTooltips: false,
                };
            	return new Chart(ctx).Line(data, options);

        	}
        }
    };
};

function oneSelectGroup($document){
	return {
		restrict: 'AE',
		scope: {
			model: '=',
			list: '=',
			onchanged: '&?',
			disabled: '=?'
		},
		templateUrl: '/assets/app_main/views/oneSelectGroupDirective.html',
		link: function(scope, elem, attr){
			scope.select = {};
			scope.select.condition = false;
			// //при нажатии на инпут
			scope.select.toggleDropdown = function(){
				scope.select.condition = !scope.select.condition;
			}

			// //показывать список или нет
			scope.select.showDropdown = function(){
				return scope.select.condition;
			}

			//смена статуса у списка из селекта при нажатии
			scope.select.toggleName = function(obj){
				temp = (!!scope.model) ? scope.model.id : null;
				new_temp = (!!obj) ? obj.id : null;
				scope.model = obj;
				scope.select.condition = false;
				if (temp!= new_temp && 'onchanged' in scope)
					scope.onchanged({par: scope.model});
			}

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;

		        if (isClickedElementChildOfPopup)
		          return;

		        scope.$apply(function(){
		            scope.select.condition = false;
		        });
		    });
		}
	}
}

//TODO close when click outside element
function multipleSelectGroup($document){
	return {
		restrict: 'AE',
		scope: {
			list: '=',
			placeholder: '=',
			disabled: '=?',
			order: '=?',
			detailed: '=?'
		},
		templateUrl: '/assets/app_main/views/multipleSelectGroupDirective.html',
		link: function(scope, elem, attr){
			scope.multiSelect = {};
			scope.multiSelect.condition = false;
			scope.multiSelect.order = (!!scope.order) ? scope.order : 'name';

			// //при нажатии на инпут
			scope.multiSelect.toggleDropdown = function(){
				scope.multiSelect.condition = !scope.multiSelect.condition;
			};

			// //показывать список или нет
			scope.multiSelect.showDropdown = function(){
				// console.log(scope.multiSelect.condition)
				if (scope.list == undefined || scope.list.length==0) return false;
				return scope.multiSelect.condition;
			};

			scope.multiSelect.getSelected = function(list){
				selected = [];
				//Здесь формируется заголовок селекта - выбранные группы и их статусы
				if (list == undefined || list.length==0)
					return 'Нет вариантов';
				list.forEach(function(item){
					for (var i=0;i<item.list.length;i++) {
						if (item.parent.selected || item.list[i].selected){
								selected.push(item.parent.name)
								// console.log(item.list[i].name);
						}
					}
				})
				if (selected.length>0)
					// return selected.join(', ');
					return selected.reduce(function(a,b){if (a.indexOf(b)<0) a.push(b); return a;}, []).join(', ');
				return scope.placeholder || "Все";
			};

			scope.multiSelect.resetSelected = function(list){
				list.forEach(function(group){
					group.parent.selected = false;
					group.list.map(function(item){return item.selected = false});
				})
				scope.multiSelect.toggleDropdown();
			};

			// //смена статуса у списка из селекта при нажатии
			scope.multiSelect.toggleName = function(obj, group){
				obj.selected = !obj.selected;
				if (group.parent.selected && !obj.selected){
					group.parent.selected = false;
					return;
				}
				if (!group.parent.selected && obj.selected && group.list.every(function(item){return item.selected})){
					group.parent.selected = true;
				}
			};

			scope.multiSelect.toggleGroup = function(group){
				group.parent.selected = !group.parent.selected;
				group.list.forEach(function(item){
					item.selected = group.parent.selected;
				})
			};

			$document.bind('click', function(event){
		        var isClickedElementChildOfPopup = elem.find(event.target).length > 0;
		        if (isClickedElementChildOfPopup)
		          return;
		        scope.multiSelect.condition = false;
		        scope.$digest();
		    });
		}
	}
}

function hasPermission(settings){
	return {
		restrict: 'AE',
		link: function(scope, element, attrs){

			var permissions = attrs['hasPermission'].split('|');
			var hasSmth = false;
			//действуем по правилу 'или' - показывать если есть хотя бы одна из
			permissions.forEach(function(p){
				if (settings.permissions[p])
					hasSmth = true;
			})
			if (!hasSmth) element.addClass('non-permission');
		}
	}
};

function sortItem(){
	return {
		restrict: 'AE',
		transclude: true,
		template: '<nobr><ng-transclude></ng-transclude><span class="arrows"><i class="fa fa-sort-asc up"></i><i class="fa fa-sort-desc down"></i></span></nobr>',
		link: function(scope, element, attrs){

			if (element.hasClass('active-sort')) {
				scope.isReverse = element.hasClass('reverse') ? '-' : '';
				scope.activeItem = attrs.sortItem;
			};

			element.bind('click', function(){
				if (element.hasClass('active-sort')) {
					element.toggleClass('reverse');
				} else {
					element.addClass('active-sort');
					// element.addClass('reverse');
				}
				scope.isReverse = element.hasClass('reverse') ? '-' : '';
				scope.activeItem = attrs.sortItem;
				scope.$digest();
			})

			scope.$watch(function(){return scope.activeItem}, function(){
				if (scope.activeItem != attrs.sortItem){
					element.removeClass('active-sort');
					element.removeClass('reverse');
				}
			})
		}
	}
};

function inlineEditor($compile, $parse){
	return {
		restrict: 'AE',
		transclude: true,
		template: '<a><ng-transclude></ng-transclude></a>',
		link: function(scope, element, attrs){
			scope.editor = {};

			scope.$watch(function(){return scope.editor.activeItem}, function(){
				if (scope.editor.activeItem != attrs.item){
					// console.log("scope.activeItem != attrs.item")
					element.find('a').css({'display': 'block'});
					element.find(".editable-container").remove();
				}
			})


			element.find('a').bind('click', function(event){
				if (scope.editor.activeItem) return;
				scope.editor.model = $parse(attrs.item)(scope);
				scope.editor.errors = null;
				scope.editor.activeItem = attrs.item;
				if ('disabled' in attrs) return;
				var input = '<input ng-model="editor.model" type="text" class="form-control input-sm" style="padding-right: 24px;">';
				if ('calendar' in attrs)
					input = '<input ng-model="editor.model" type="text" jqdatepicker class="form-control input-sm" style="padding-right: 24px;">';
				if ('phone' in attrs)
					input = '<input ng-model="editor.model" type="text" class="form-control input-sm" style="padding-right: 24px;" ui-mask="+7 (999) 999-99-99" model-view-value="true">';
    			if ('select' in attrs)
    				input = '<div one-select model="editor.model" list="typex_choices"></div>';
    			if ('mask' in attrs){
    				scope.mask = attrs['mask'];
    				input = '<input ng-model="editor.model" ui-mask="{{mask}}" model-view-value="true" type="text" class="form-control input-sm" style="padding-right: 24px;">';
    			}
    			if ('textarea' in attrs)
					input = '<textarea ng-model="editor.model" class="form-control input-sm" rows="1" style="padding-right: 24px;"></textarea>';

    			var form_html = '<span class="editable-container editable-inline">'+
	    					'<div class="control-group form-group m-b-0">'+
		                     	'<div class="col-xs-8">'+ input +
		                     	'</div>'+
		                      	'<div class="editable-buttons col-xs-4">'+
		                        	'<button type="button" class="btn btn-success btn-sm" ng-click="editor.saveEdit()"><i class="md md-done"></i></button>'+
		                        	'<button type="button" class="btn btn-danger btn-sm" ng-click="editor.cancelEdit()"><i class="md md-clear"></i></button>'+
		                      	'</div>'+
	                   		'</div>'+
	                   		'<ul class="parsley-errors-list filled m-t-0" ng-show="!!editor.errors">'+
		                   		'<li class="parsley-required" ng-repeat="error in editor.errors">'+
		                   			'{{error}}'+
		                   		'</li>'+
			                '</ul>'+
                  		'</span>';
    			element.append($compile(form_html)(scope))
    			element.find('a').css({'display': 'none'})
    			if ('calendar' in attrs) return;
    			element.find('input').focus()
    			element.find('textarea').focus()

			})

			scope.editor.saveEdit = scope.saveEdit;

			scope.editor.cancelEdit = function(){
				scope.editor.model = null;
				scope.editor.activeItem = null;
			}

		}
	}
};

function inlineEditorPencil(){
	return {
		restrict: "AE",
		transclude: true,
		scope: {
			model: '=',
			type: '=',
			list: '=?',
			saveCallback: '&?'
		},
		templateUrl: '/assets/app_main/views/inlineEditorPencilDirective.html',
		link: function(scope, elem, attrs){
			scope.pencil_editor = {};
			scope.pencil_editor.hover = false;
			scope.pencil_editor.editable = false;


			scope.pencil_editor.show = function(){
				return scope.pencil_editor.hover && !scope.pencil_editor.editable;
			};

			scope.pencil_editor.edit = function(){
				scope.pencil_editor.editable = true;
				if (scope.type == 'text')
					scope.pencil_editor.model = angular.copy(scope.model);
				if (scope.type == 'select'){
					scope.pencil_editor.model = scope.list.filter(function(obj){return obj.id == scope.model})[0]
					scope.pencil_editor.list = angular.copy(scope.list)
				}
			};

			scope.pencil_editor.cancel = function(){
				scope.pencil_editor.editable = false;
				scope.pencil_editor.hover = false;
				scope.pencil_editor.model = '';
			};

			scope.pencil_editor.success = function(){
				scope.pencil_editor.hover = false;
				scope.pencil_editor.editable = false;
				if (scope.type == 'text')
					scope.model = angular.copy(scope.pencil_editor.model);
				if (scope.type == 'select')
					scope.model = scope.pencil_editor.model.id;
			};

			scope.pencil_editor.save = function(){
				var callback = scope.saveCallback(),
					new_val = scope.pencil_editor.model;
				if (scope.type == 'select')
					new_val = new_val.id;
				callback(new_val, function(){
					return scope.pencil_editor.success;
				}());
			};

			scope.pencil_editor.is = function(type){
				return scope.type == type;
			}

			elem.bind({
				'mouseenter': function(){
					scope.pencil_editor.hover = true;
					scope.$digest();
				},
				'mouseleave': function(){
					scope.pencil_editor.hover = false;
					scope.$digest();
				}
			})

		}
	}
};

function jqFlotChart($filter){
	return {
		restrict: 'AE',
		scope: {
			points: '=',
			duration: '='
		},
		link: function(scope, elem, attrs){
			var getTooltip = function(label, x, y) {
			    return "%x" + " : " +  $filter('price')(y);
			}

			var borderColor = '#f5f5f5';
			var bgColor = '#fff';
			var charColors = {'dash_reservations': '#5fbeaa','dash_reserves': '#ffbd4a','dash_sales': '#34d3eb','dash_contacts': '#5d9cec','dash_clients': '#269bd2', 'dash_contacts_site': '#99E9F5',
								'dash_contacts_call': '#5FBEAA', 'dash_contacts_visit': '#6C85BD'};
			var charColor = '#555';
			var linesOptions = {
				fill: true,
				lineWidth: 1,
				fillColor: {
					colors: [{
						opacity: 0.5
					}, {
						opacity: 0.5
					}]
				}
			};

			var barsOptions = {
        		fill: true,
            	barWidth: 20000000,
        		horizontal: false,
        		fillColor: {
					colors: [{
						opacity: 1
					}, {
						opacity: 1
					}]
				}
			};

			var legendOptions = {
				position: "ne",
				// backgroundColor : '#f7f9fa',
				margin: [0, -24],
				noColumns: 0,
				labelBoxBorderColor: null,
			};

			var options = {
				series: {
					bars: barsOptions,
					lines: linesOptions,
					color: charColor,
					points: {
						show: false
					},
					shadowSize: 0
				},
				grid: {
					hoverable: true,
					clickable: true,
					borderColor: borderColor,
					tickColor: "#f9f9f9",
					borderWidth: 1,
					labelMargin: 10,
					backgroundColor: bgColor
				},
				yaxis: {
					tickColor: '#f5f5f5',
					minTickSize: 1,
					tickDecimals: 0,
					min: 0,
					font: {
						color : '#bdbdbd'
					}
				},
				xaxis: {
					mode: "time",
					timezone: "browser",
					dayNames: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
					monthNames: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
					tickLength: 5,
					tickColor: '#f5f5f5',
					font: {
						color : '#bdbdbd'
					}
				},
				tooltip: true,
				tooltipOpts: {
					content: getTooltip,
					shifts: {x : -60, y : 25},
					defaultTheme: false
				}
			}

			scope.$watch('points', function(points){
				if (points == undefined) return;
				if ('bars' in attrs){
					if (points[0] && points[0].length <3){
						// options['series']['bars']['barWidth'] =  ;
					}
					var bars = [{label : 'План', color : '#c5dbed'}, {label : 'Факт', color : '#ffdea4'}];
					bars.forEach(function(bar, index){
						bar['data'] = points[index];
						bar['bars'] = bar['bars'] || { order : index+1 };
					})
					data = bars;
					options['series']['bars']['show'] = true;
					options['series']['lines']['show'] = false;
					options['legend'] = legendOptions;
					options['xaxis']['minTickSize'] = [1, "day"];
				}
				else {
					charColor = charColors[attrs['points']] || '#000';
					options['series']['color'] = charColor;
					options['series']['bars']['show'] = false;
					options['series']['lines']['show'] = true;
					options['xaxis']['minTickSize'] = null;
					if (!scope.duration)
						options['xaxis']['minTickSize'] = [1, "day"];
					options['legend'] = {};
					data = [ points ];
				}
				chart = $.plot(elem, data, options);
			})
		}
	}
};

function fastDate(){
	return {
		restrict: 'AE',
		scope: {
			from: '=',
			to: '=',
			default: '=?'
		},
		templateUrl: '/assets/app_main/views/fastDateDirective.html',
		link: function(scope, elem, attrs){
			scope.filter = {};
			scope.list = {};

			getListMonths = function(){
				var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
					months = [];
				monthNames.forEach(function(el, i){
					months.push({id: i, name: el});
				})
				console.log('months  ', months);
				months.unshift({id: 'all', name: 'Все'})
				return months;
			};

			getListYears = function(){
				var now = new Date(),
					cur_year = now.getFullYear(),
					from_year = 2011,
					years = [];
				for (var i=cur_year; i>=from_year; i--){
					years.push({id: i, name: i});
				}
				console.log('years  ', years);
				years.unshift({id: 'all', name: 'Все'})
				return years;
			};

			scope.$watch('filter', function(newV, oldV){
				console.log('scope.filter ', scope.filter)
				var year = scope.filter.year.id,
					month = scope.filter.month.id;
				if (year == 'all' && month == 'all'){
					scope.from = null;
					scope.to = null;
					return;
				}
				if (year == 'all'){
					scope.filter.month = {id: 'all', name: 'Все'};
					scope.from = null;
					scope.to = null;
					return;
				}
				if (month == 'all'){
					scope.from = new Date(year, 0, 1, 12);
					scope.to = new Date(year, 11, 31, 12);
					return;
				}
				scope.from = new Date(year, month, 1, 12);
				scope.to = new Date(year, month+1, 0, 12)
			}, true)


			scope.list.months = getListMonths();
			scope.list.years = getListYears();

			var now = new Date(),
				cur_month = now.getMonth(),
				cur_year = now.getFullYear();

			if ('all' in attrs){
				scope.filter.year = {id: 'all', name: 'Все'};
				scope.filter.month = {id: 'all', name: 'Все'};
			} else {
				scope.filter.month = scope.list.months.filter(function(month){return month.id == cur_month})[0];
				scope.filter.year = scope.list.years.filter(function(year){return year.id == cur_year})[0];
			}

		}
	}
};

// function autonumber($locale, $filter){
// 	$locale.NUMBER_FORMATS.GROUP_SEP = " ";
// 	$locale.NUMBER_FORMATS.CURRENCY_SYM = "";
//     var decimalSep = $locale.NUMBER_FORMATS.DECIMAL_SEP;
//     var toNumberRegex = new RegExp('[^0-9]', 'g');

//     var filterFunc = function (value) {
//         return $filter('currency')(value, '', '');
//     };

//     function getCaretPosition(input){
//         if (!input) return 0;
//         if (input.selectionStart !== undefined) {
//             return input.selectionStart;
//         } else if (document.selection) {
//             // Curse you IE
//             input.focus();
//             var selection = document.selection.createRange();
//             selection.moveStart('character', input.value ? -input.value.length : 0);
//             return selection.text.length;
//         }
//         return 0;
//     };

//     function setCaretPosition(input, pos){
//         if (!input) return 0;
//         if (input.offsetWidth === 0 || input.offsetHeight === 0) {
//             return; // Input's hidden
//         }
//         if (input.setSelectionRange) {
//             input.focus();
//             input.setSelectionRange(pos, pos);
//         }
//         else if (input.createTextRange) {
//             // Curse you IE
//             var range = input.createTextRange();
//             range.collapse(true);
//             range.moveEnd('character', pos);
//             range.moveStart('character', pos);
//             range.select();
//         }
//     };
    
//     function toNumber(currencyStr) {
//         return parseFloat(currencyStr.replace(toNumberRegex, ''), 10);
//     };

// 	return {
// 		restrict: 'AE',
//         require: 'ngModel',
// 		link: function(scope, elem, attrs, modelCtrl){
// 			console.log('$locale  ', $locale)
//         	modelCtrl.$formatters.push(filterFunc);

//             modelCtrl.$parsers.push(function(newViewValue){
//             	if (!newViewValue) return;
//                 var oldModelValue = modelCtrl.$modelValue;
//                 var newModelValue = toNumber(newViewValue);
//                 modelCtrl.$viewValue = filterFunc(newModelValue);
//                 var pos = getCaretPosition(elem[0]);
//                 elem.val(modelCtrl.$viewValue);
//                 var newPos = pos + modelCtrl.$viewValue.length -
//                                    newViewValue.length;
//                 if ((oldModelValue === undefined) || isNaN(oldModelValue))
//                     newPos -= 0;
//                 setCaretPosition(elem[0], newPos);
//                 return newModelValue;
//             });
// 		}
// 	}
// };

function autonumber($locale, $filter){
	$locale.NUMBER_FORMATS.CURRENCY_SYM = "";
    var decimalSep = $locale.NUMBER_FORMATS.DECIMAL_SEP;
    var toNumberRegex = new RegExp('[^0-9\\' + decimalSep + ']', 'g');

    var filterFunc = function (value, fractionSize) {
        return $filter('currency')(value, '', fractionSize);
    };

    function getCaretPosition(input){
        if (!input) return 0;
        if (input.selectionStart !== undefined) {
            return input.selectionStart;
        } else if (document.selection) {
            input.focus();
            var selection = document.selection.createRange();
            selection.moveStart('character', input.value ? -input.value.length : 0);
            return selection.text.length;
        }
        return 0;
    };

    function setCaretPosition(input, pos){
        if (!input) return 0;
        if (input.offsetWidth === 0 || input.offsetHeight === 0) {
            return; // Input's hidden
        }
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(pos, pos);
        }
        else if (input.createTextRange) {
            // Curse you IE
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };
    
    function toNumber(currencyStr, fractionSize) {
        return parseFloat(currencyStr.replace(toNumberRegex, ''));
    };

	return {
		restrict: 'AE',
        require: 'ngModel',
		link: function(scope, elem, attrs, modelCtrl){
			var fractionSize = 0,
				newPosMove = 0;

			if (attrs['autonumber'] == undefined || attrs['autonumber'] == 'price'){
				$locale.NUMBER_FORMATS.GROUP_SEP = " ";
			};
			if (attrs['autonumber'] == 'area') {
				$locale.NUMBER_FORMATS.GROUP_SEP = "";
				fractionSize = 2;
				newPosMove = 3;
			};

        	modelCtrl.$formatters.push(function(newModelValue){
        		return filterFunc(newModelValue, fractionSize);
        	});
 
            modelCtrl.$parsers.push(function(newViewValue){
            	if (!newViewValue) return;
                var oldModelValue = modelCtrl.$modelValue;
                var newModelValue = toNumber(newViewValue);
                modelCtrl.$viewValue = filterFunc(newModelValue, fractionSize);
                var pos = getCaretPosition(elem[0]);
                elem.val(modelCtrl.$viewValue);
                var newPos = pos + modelCtrl.$viewValue.length -
                                   newViewValue.length;
                if ((oldModelValue === undefined) || isNaN(oldModelValue))
                    newPos -= newPosMove;
                setCaretPosition(elem[0], newPos);
                return newModelValue;
            });
		}
	}
};

