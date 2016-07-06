ModalServ.$inject = ['DateFormat'];

function ModalServ(DateFormat){
	var Modal = {};
	
	//перенести в add (потому что нужно только для него )
	var createFields = function(data){
		fields = {};
		angular.forEach(data, function (field) {
			fields[field.name] = {};
			fields[field.name].type = field.type;
			fields[field.name].choices = field.choices;
			switch (field.type) {
				case 'Char':
				case 'Textarea':
				case 'DateTime':
					fields[field.name].value = '';
					break;
				case 'Float':
				case 'Integer':
				case 'BigInteger':
					fields[field.name].value = null;
					break;
				case 'ForeignKey':
				case 'Select':
					fields[field.name].value = field.choices[0] || '';
					break;
				case 'JSON':
					fields[field.name].value = [];
					break;
				case 'File':
					fields[field.name].value = null;
					break;
				case 'Multiselect':
				case 'Checkbox':
					fields[field.name].value = [];
					// fields[field.name].choices.map(function(choice){return choice.selected = false;})
					break;
			}
	    });
	    return fields;
	};

	var initAddFields = function(){
		loc_fields = {};
		glob_fields = angular.copy(this.fields);
		// console.log('glob_fields   ', glob_fields)
		angular.forEach(glob_fields, function (field, key) {
			loc_fields[key] = {}
			loc_fields[key].type = field.type;
			loc_fields[key].errors = null;
			loc_fields[key].choices = field.choices;
			loc_fields[key].id = null;
			switch (loc_fields[key].type) {
				case 'Char':
				case 'Textarea':
				case 'DateTime':
					loc_fields[key].value = '';
					break;
				case 'Float':
				case 'Integer':
				case 'BigInteger':
					loc_fields[key].value = null;
					break;
				case 'ForeignKey':
				case 'Select':
					loc_fields[key].value = field.choices[0] || '';
					break;
				case 'JSON':
					loc_fields[key].value = [];
					break;
				case 'File':
					loc_fields[key].value = null;
					break;
				case 'Multiselect':
				case 'Checkbox':
					loc_fields[key].value = [];
					// fields[field.name].choices.map(function(choice){return choice.selected = false;})
					break;
			}
		})
		console.log('initAddFields ', loc_fields['plan_img'])
		return loc_fields;
	};

	var initEditFields = function(obj){
		console.log('obj  ', obj)
		loc_fields = {}
		glob_fields = angular.copy(this.fields);
		angular.forEach(glob_fields, function (field, key) {
			// console.log('field ', key)
			loc_fields[key] = {}
			loc_fields[key].type = field.type;
			loc_fields[key].choices = field.choices;
			loc_fields[key].errors = null;
			loc_fields[key].id = obj.id;
			if (field.type == 'Multiselect' || field.type == 'Checkbox'){
				//----------------- вот тут запариться!!!! ------------------
				loc_fields[key].value = [];
			}
			else {
				loc_fields[key].value = angular.copy(obj[key]);
			}
	    });
	    console.log('initEditFields ', loc_fields['plan_img'])
	    return loc_fields;
	};

	var getValue = function(obj){
		var new_obj = {}
		angular.forEach(obj, function (field, key) {
			field.errors = [];
			if (field.type == "Multiselect" || field.type == "Checkbox"){
			//для препочтений в новом контакте
				if (key=='preferences'){
					new_obj[key] = field.choices.filter(function(choice){ return choice.selected }).map(function(choice){ return {id: choice.id, name: choice.name}})
				} else {
					new_obj[key] = field.choices.filter(function(choice){ return choice.selected }).map(function(choice){ return choice.id})
				}
			}
			else if (field.type == 'ForeignKey' || field.type == 'Select'){
				new_obj[key] = field.value.id
			}
			else if (field.type == 'DateTime' || field.type == 'Date'){
				//////////////!!!!!!!!!!!!///////////
				var local_time = angular.copy(field.value);
				// if (local_time)
					// local_time.setHours(local_time.getHours() - local_time.getTimezoneOffset() / 60);
				new_obj[key] = local_time;
			}
			else if (field.type == 'File'){
				new_obj[key] = field.value;
			}
			else {
				//null тут ње подходит, потому что в форме планировок null подствавляется как строка- может проблема на сервере?
				new_obj[key] = (field.value===0 || !!field.value) ? field.value : '';
			}
		})
		return new_obj;
	};

	var handleErrors = function(fields, data){
		// console.log('invalid_fields  ', data)
		invalid_fields = data;
		angular.forEach(invalid_fields, function(errors, field){
			fields[field].errors = errors
			// console.log('field ',field,'  ',fields[field])
		})
	};

	Modal.cancel = function(){
		Modal.init();
	};

	Modal.init = function(){
		$('#myModal').modal('hide');
		this.data = {};
		this.cur_obj = {};//временный объект - ссылка на редактируемый объект
		Modal.isload = false;
		// this.condition = '';
	}

	Modal.add = function(){
		this.data = initAddFields(this.fields);
		this.condition = 'create';
	};

	Modal.edit = function(obj){
		//-----------!!!предобработка для чекбоксов и мультиселектов------
		this.data = initEditFields(obj)
		this.cur_obj = obj;
		this.condition = 'update';
	};

	Modal.delet = function(obj){
		this.data = initEditFields(obj)
		this.cur_obj = obj;
		this.condition = 'remove';
	}

	Modal.create = function(){
		fields = this.data;
		var obj = this.resource;
		obj.data = getValue(this.data);	
		Modal.isload = true;
		obj.$save(function(data){
			// console.log('Modal.create response', data)
			Modal.createCallback(data);
		}, function(data){
			Modal.isload = false;
			console.log('error? ', data)
			try {
				handleErrors(fields, data.data)
			}
			catch (error){
				if (Modal.errorCallback)
					Modal.errorCallback(data);
				console.log('error ', error)
			}
		})
	}

	Modal.update = function(){
		fields = this.data;
		var obj = this.resource;
		obj.data = getValue(this.data);	
		obj.data.id = this.cur_obj.id;
		Modal.isload = true;
		obj.$update(function(data){
			// console.log('Modal.update  ', data)
			Modal.createCallback(data);
		}, function(data){
			Modal.isload = false;
			// console.log('error? ', data)
			try {
				handleErrors(fields, data.data)
			}
			catch (error){
				console.log('error ', error)
			}
		})
	}

	Modal.remove = function(){
		var obj = this.resource;
		// console.log('this.cur_obj  ', this.cur_obj)
		obj.data = getValue(this.data);
		obj.data.id = this.cur_obj.id
		Modal.isload = true;
		// console.log('Modal.remove  ', obj.data)
		this.cur_obj.$delete({'pk': obj.data.id}, function(data){
			// console.log('remove  this.cur_obj ', data)
			Modal.createCallback(data);
		}, function(data){
			Modal.isload = false;
			console.log('error? ', data)
		})
	}

	Modal.show = function(condition) {
		return (Modal.condition == condition)
	}

	return {
		init: function(fields, resource, createCallback, errorCallback){
			Modal.fields = createFields(fields);
			Modal.resource = resource;
			Modal.createCallback = createCallback;
			Modal.errorCallback = errorCallback || false;
			Modal.isload = false;
			return Modal;
		}
	}
}