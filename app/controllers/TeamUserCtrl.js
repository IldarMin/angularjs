function TeamUserCtrl($scope, user, user_groups){
	$scope.user = user
	$scope.user_groups = user_groups
	$scope.selectedGroup = ''
	$scope.haveGroups = false

	$scope.changeGroup = function(){
		$scope.haveGroups = false;
	}

	user.$promise.then(function(user){
		$scope.haveGroups = (user.groups.length>0) ? true : false;
		$scope.user.flatshistory.map(function(elem){return elem.type='flatshistory'});
		$scope.user.flslshistory.map(function(elem){return elem.type='flslshistory'});
		$scope.user.manage_flats.map(function(elem){return elem.type='manage_flats'});

		$scope.user.all_history = $scope.user.flatshistory.concat($scope.user.flslshistory, $scope.user.manage_flats)
		return $scope.user;
	});

	$scope.save_group = function(user){
		console.log($scope.selectedGroup)
		$scope.user.groups[0] = $scope.selectedGroup
		$scope.user.$update()

		$scope.user.$promise.then(function(user){
			$scope.haveGroups = ($scope.user.groups.length>0) ? true : false;
			$scope.user.all_history = $scope.user.flatshistory.concat($scope.user.flslshistory, $scope.user.manage_flats)
			// console.log($scope.user)
			return $scope.user;
		});
	}
}