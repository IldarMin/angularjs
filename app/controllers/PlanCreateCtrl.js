function PlanCreateCtrl($scope, Plans, Forms, ModalServ){
	$scope.form = Forms.get({entity: 'plan'}, function(data){
		$scope.Mod = new ModalServ.init(data, new Plans(), createCallback);//+еще колбек на результаты update и create 
		$scope.Mod.add();
		console.log('$scope.Mod ', $scope.Mod);
	})
	console.log('$scope.form ', $scope.form)

	createCallback = function(obj){
		console.log(obj.building)
		$location.path('/buildings/'+obj.building+'/sections');
	}

}
