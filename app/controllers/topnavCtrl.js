function topnavCtrl($scope, $rootScope, $cookies, $state, $window, Jarvis, $timeout, UserNotifications, Projects, UpdateFactory, $location){
	console.log('--- topnavCtrl ---');

	$scope.reqx = '';
	var project_id = $cookies.get('project');

	//в проекте романтика другой перечень квартир - stock_v2
	if ($cookies.get('project') == '32'){
		if ($location.path().substr(1) == 'stock'){
			var loc = $location.absUrl().split('?')[1];
			(loc == undefined) ? $window.location.href = '/#/stock_v2' : $window.location.href = '/#/stock_v2'+'?'+loc;
		}
	} else {
		if ($location.path().substr(1) == 'stock_v2'){
			var loc = $location.absUrl().split('?')[1];
			(loc == undefined) ? $window.location.href = '/#/stock' : $window.location.href = '/#/stock'+'?'+loc;
		}
	};

	function reloadApp(){
		if ( ['build_view', 'flat', 'client_card'].indexOf($state.current.name) > -1 )
			$window.location.hash = '/';
		if (['stock', 'stock_v2'].indexOf($state.current.name) > -1){
			var needToTransition = false,
				cur_state = $state.current.name;
			//убираем фильтры в перечне квартир, которые не должны сохраняться при переходе между проектами
			['buildings', 'plans'].forEach(function(field){
				if ($state.params[field]) {
					$state.params[field] = undefined;
					needToTransition = true;
				}
			});
			if (needToTransition)
				$window.location.hash = $state.href(cur_state, $state.params);
		};
		$window.location.reload();
	};

	$window.onfocus = function(){
	   	if (project_id && project_id != $cookies.get('project'))
		   	reloadApp();
	};

	$scope.changeProject = function(project){
		$cookies.put('project', project.id);
	  	reloadApp();
	};

	$scope.projects = Projects.query(function(data){
		$scope.cur_project = {};
		console.log('project_id ', project_id)
		if (!project_id){
			$scope.cur_project.name = 'Не выбран проект';
			return;
		}
		$scope.cur_project = data.filter(function(project){return project.id==project_id})[0];
	});

	$scope.jarvisReqx = function(){
		request = new Jarvis();
		request.data = {}
		request.data.reqx = $scope.reqx;
		request.data.project = 1;
		if($scope.reqx.length > 0){
			request.$save(function(data){
				console.log(' > * . * < ');
				$scope.messageShow = true;
				$timeout(function() {
					$scope.messageShow = false;
					$scope.reqx = "";
			    }, 8000);
				$scope.closeMessageShow = function() {
					$scope.messageShow = false;
					$scope.reqx = "";
				}
				console.log(data)
			})
		}
	};

	$scope.notifications = {};
	$scope.notifications.list = [];

	$scope.notifications.update = function(){
		$scope.notifications.preload = true;
		UserNotifications.query(function(data){
			$scope.notifications.preload = false;
			$scope.notifications.list = data;
		});
		console.log('updateNotifications  ', UserNotifications.query())
	}

	$scope.notifications.check = function(notification, index){
		var data = {id: notification.id, active: false};
		UserNotifications.update({data: data}, function(data){
			$scope.notifications.list.splice(index, 1);
		});
	}

	$scope.$on("$locationChangeStart", function(e, currentLocation, previousLocation){
		var sign = 'contacts/add',
			main = window.location.origin+'/#';

		$cookies.remove('prev_page');
		if (currentLocation.indexOf(sign)>-1 && previousLocation.indexOf(sign)==-1){
			var path = previousLocation.replace(main, '')
			$cookies.put('prev_page', path);
		}
	})
}
