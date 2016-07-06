function BuildingsCtrl($scope, $cacheFactory, buildings, Forms, ModalServ, Buildings, UpdateFactory){
	console.log('----BuildingsCtrl----')
	$scope.buildings = buildings;
	$scope.form = Forms.get({entity: 'building'}, function(data){
		console.log('data  ', data)
		$scope.Mod = new ModalServ.init(data, new Buildings(), createCallback);//+еще колбек на результаты update и create
		console.log('$scope.Mod ', $scope.Mod);
	})
	console.log('$scope.form ', $scope.form)

	createCallback = function(obj){
		$cacheFactory.get('$http').remove('/api/buildings/');
		Buildings.query(function(data){
			$scope.buildings = data;
			$scope.Mod.init()
			console.log('UpdateFactory')
			UpdateFactory.setBuildings();
		});

	}
}
