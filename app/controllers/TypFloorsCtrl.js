function TypFloorsCtrl($scope, TypFloors, Plans, Forms, ModalServ, typfloors_list, settings){
	console.log('TypFloors.Ctrl');
	var self = this;
	self.base_href = settings.base_href;
	self.rooms = [{name: '?????', id: 0},{name: 'Однокомнатные', id: 1},{name: 'Двухкомнатные', id: 2},{name: 'Трехкомнатные', id: 3},{name: 'Четырехкомнатные', id: 4}];
	self.dict_plans = {};
	self.plans =  Plans.query(function(){
		self.plans.forEach(function(plan){
			self.dict_plans[plan.id] = plan;
		})
	});
	//delet и остальное не работает, потому что форма не пришла
	self.form = Forms.get({entity: 'typfloor'}, function(data){
		data.push({"choices": [],"name": "a_name","type": "Char"})
		self.Mod = new ModalServ.init(data, new TypFloors(), createCallback);//+еще колбек на результаты update и create 
	})

	createCallback = function(obj){
		console.log('createCallback ', obj)
		self.models.type_floors = TypFloors.query(function(){
			self.Mod.init()
		})
	}

	//все для работы с планами внутри этажа
	//во всплывашке
	self.ModPlans = {}

	self.ModPlans.getAddTo = function(floor){
		self.ModPlans.floor = floor;
		self.plansCount = {};
	}

	self.ModPlans.addTo = function(plan){
		self.plansCount[plan.id] = self.plansCount[plan.id] || 0;
		self.plansCount[plan.id]++;
	}

	self.ModPlans.removeFrom = function(plan){
		self.plansCount[plan.id] = self.plansCount[plan.id] || 0;
		if (self.plansCount[plan.id]>0) self.plansCount[plan.id]--;
	}

	self.ModPlans.createTo = function(){
		stackOfPlans = [];
		for (var plan_id in self.plansCount){
			for (var i=0; i<self.plansCount[plan_id]; i++){
				stackOfPlans.push({'plan_id': plan_id})
			}
		}
		pk = self.ModPlans.floor.id;
		plans = self.ModPlans.floor.data.concat(stackOfPlans)
		data = {id: pk, data: plans}
		TypFloors.update({data: data}, function(data){
			self.models.type_floors = TypFloors.query();
			self.ModPlans.cancel()
		})
	}

	self.ModPlans.cancel = function(){
		self.plansCount = {};
		$('#plansModal').modal('hide');
	}


	//внутри этажа
	self.models = {
		selected: null,
		type_floors: typfloors_list,
		edited: null,
		back_selected: null
	}

	self.getEditIn = function(floor){
		if (self.models.edited) 
			self.models.edited.data = angular.copy(self.models.back_selected.data);
		self.models.edited = floor;
		self.models.back_selected = angular.copy(floor);
	}

	self.deletIn = function(floor, plan){
		floor.data = floor.data.filter(function(dplan){return plan != dplan})
	}

	self.saveEditIn = function(floor){
		TypFloors.update({data: floor}, function(data){
			console.log('update data ', data)
			self.models.edited = null;
		})
	}

	self.editInThis = function(floor){
		return (self.models.edited == floor)
	}

	self.cancelEditIn = function(floor){
		if (self.models.edited) 
			self.models.edited.data = angular.copy(self.models.back_selected.data);
		self.models.edited = null;
	}
	//конец - все для работы с планами внутри этажа

	self.getTypes = function(arr){
		return arr.map(function(item){return item.plan_id})
	}

}
