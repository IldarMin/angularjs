function ProjectsCtrl(ModalServ, Forms, $scope, Projects, projects_list, settings){
	var self = this;
	self.projects = projects_list;

	$scope.dash_block = {};
	$scope.dash_block.times = [{id: 'today', name: 'День'},{id: 'yesterday', name: 'Вчера'},{id: 'week', name: 'Неделя'},
	{id: 'month', name: 'Месяц'},{id: 'quarter', name: 'Квартал'},{id: 'year', name: 'Год'}, {id: 'all', name: 'Итого'}];

	$scope.dash_block_two = {};
	$scope.dash_block_two.th = [{id: 'today', name: 'Сайт'},{id: 'yesterday', name: 'Звонки'},{id: 'week', name: 'Посещения'},
	{id: 'month', name: 'Бронь'},{id: 'quarter', name: 'резерв'},{id: 'year', name: 'Продано'}];

	self.form = Forms.get({entity: 'project'}, function(data){
		// console.log(data)
		self.Mod = new ModalServ.init(data, new Projects(), createCallback);//+еще колбек на результаты update и create
		// angular.forEach(data, function(field){
		// 	console.log(field.verbose+'  '+field.name+'  '+field.type+'  '+field.choices.length)
		// })
		// console.log('fields ', fields)
		// self.form.$remove({pk: '123'}, function(){
		// 	console.log('elf.form.$delete(function()');
		// })
	})

	createCallback = function(obj){
		console.log('createCallback ', obj)
		self.projects = Projects.query(function(){
			self.Mod.init()
		});
	}

	// jquerrrry

	$scope.arrows = function(obj) {
        console.log(obj.target.parentNode.parentNode.parentNode.parentNode.id);
    };



};
