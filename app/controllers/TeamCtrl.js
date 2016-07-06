function TeamCtrl($location, $scope, user_groups, users, user_permissions, NewGroup, SystemUsers){
	$scope.user_groups = user_groups;
	$scope.users = users;
	$scope.user_permissions = user_permissions;

	// users.$promise.then(function(users){
	// 	users.forEach(function(user){
	// 		// if(user.fields.groups != false){
	// 		// 	user.fields.group = $scope.user_groups.filter( function(u_g){ return u_g.pk == user.fields.groups[0] } )[0]['fields']['name'];
	// 		// }
	// 	})
	// 	$scope.users = users;
	// });

	$scope.new_group = new NewGroup();
	$scope.create = function(user) {
		$scope.new_group.$save()
		console.log($scope.new_group)
	};

	$scope.system_user = new SystemUsers();
	$scope.create = function(user) {
		$scope.system_user.$save(function(responce){
			if(responce.status == 'success'){
				$('#addUser').modal('hide');
				// console.log($('#addUser'))

				// console.log($('#addUser').modal('hide'))
				$location.path('/team/'+responce.pk);
			}
		})
	};
}