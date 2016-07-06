//TODO close when click outside element
function multipleSelect($document){
	return {
		restrict: 'AE',
		scope: {
			list: '=',
			placeholder: '=',
			disabled: '=?',
			order: '=?',
			hasntAll: '=?',
			onchanged: '&?'
		},
		templateUrl: '/assets/app_main/views/multipleSelectDirective.html',
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
				if (scope.list == undefined || scope.list.length==0) return false;
				return scope.multiSelect.condition;
			};

			// //выбор элемента
			scope.multiSelect.toggleName = function(obj){
				obj.selected = !obj.selected;
				if ('onchanged' in scope)
					scope.onchanged({par: scope.list});
			};
			
			// //выбор Все
			scope.multiSelect.resetSelected = function(list){
				list.map(function(item){ return item.selected = false})
				scope.multiSelect.toggleDropdown();
				if ('onchanged' in scope)
					scope.onchanged({par: scope.list});
			};

			scope.multiSelect.getSelected = function(list){
				selected = []
				if (list == undefined || list.length==0)
					return 'Нет вариантов';
				list.forEach(function(item){
					if (item.selected)
						selected.push(item.name)
				})
				if (selected.length>0)
					return selected.join(', ')
				return scope.placeholder || "Все";
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
