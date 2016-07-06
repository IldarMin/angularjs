function SalesCtrl($scope, sales, Sales, settings) {
	$scope.sales = sales;
	$scope.permissions = settings.permissions;
	console.log('---SalesCtrl---', settings.permissions)
	
	initCalendar = function(sales){
		sales.$promise.then(function(data){
			$scope.events = []
			data.forEach(function(sale){
				if (!sale.from_date && !sale.to_date)
					return;
				event = {
					title: sale.name,
					start: sale.serialized.duration.from,
					end: sale.serialized.duration.to,
					color: '#7B8F9E'
				}
				$scope.events.push(event)
			})
		})
	}

	initCalendar(sales);

	$scope.modal = {};

	$scope.modal.deletSale = function(sale){
		$scope.modal.sale = sale;
	}

	$scope.modal.remove = function(){
		Sales.delete({'pk': $scope.modal.sale.id}, function(data){
			console.log('Sales.$delete ', data)
			sales = Sales.query();
			$scope.sales = sales;
			initCalendar(sales);
			$scope.modal.cancel()
		})
	}

	$scope.modal.cancel = function(){
		$('#deletSale').modal('hide');
		$scope.modal.sale = null;
	}

}