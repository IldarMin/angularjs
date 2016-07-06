function PlansCtrl($scope, $cacheFactory, ModalServ, Forms, Plans, plans_list, settings){
	var self = this;
	self.base_href = settings.base_href;
	self.plans = plans_list;
	self.rooms = [{name: '?????', id: 0},{name: 'Однокомнатные', id: 1},{name: 'Двухкомнатные', id: 2},{name: 'Трехкомнатные', id: 3},{name: 'Четырехкомнатные', id: 4}];
	self.form = Forms.get({entity: 'plan'}, function(data){
		data.push({"choices": [],"name": "name","type": "Char"});
		self.Mod = new ModalServ.init(data, new Plans(), createCallback());//+еще колбек на результаты update и create 
		console.log('self.Mod  ', self.Mod);
		self.Mod.add_fix = function(){
			self.Mod.add();
			if ('copy_id' in self.Mod.data)
				delete self.Mod.data['copy_id']
		};

		self.Mod.copy = function(plan){
			self.Mod.edit(plan);
			self.Mod.condition = 'copy';
			self.Mod.data['copy_id'] = {};
			self.Mod.data['copy_id'].value = plan.id;
			console.log('self.Mod.copy', self.Mod);
		};
	});

	function createCallback(){
		return function(obj){
			$cacheFactory.get('$http').remove('/api/plans/');
			Plans.query(function(p_data){
				self.plans = p_data;
				self.Mod.init();
			});
		}
	};

}