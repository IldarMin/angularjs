function PriceManageCtrl($scope, $state){
	console.log('$stateParams.tab_name  ', $state.current.url)

	$scope.isActive = function(tab_name){
		if (tab_name == $state.current.url)
			return 'active'
		return '';
	}

}