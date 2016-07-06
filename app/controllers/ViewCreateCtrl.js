function ViewCreateCtrl($scope, $location, Forms, ModalServ, Buildings){
	console.log('ViewCreateCtrl')
	$scope.form = Forms.get({entity: 'building'}, function(data){
		console.log('data  ', data)
		$scope.Mod = new ModalServ.init(data, new Buildings(), createCallback);//+еще колбек на результаты update и create 
		$scope.Mod.add();
		console.log('$scope.Mod ', $scope.Mod);
	})
	console.log('$scope.form ', $scope.form)

	createCallback = function(obj){
		console.log('createCallback  ', obj)
		console.log('createCallback  ', obj.id)
		$location.path('/buildings/'+obj.id+'/sections/');
	}

}