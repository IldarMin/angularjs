function DateFormat(){
	return {
		toDate: function(val){
			if (!val) return null;
			var parts = val.split(".");
			return new Date(Date.UTC(parts[2], parts[1]-1, parts[0]));
		},

		fromDate: function(val){
			if (!val) return null;
			var temp = new Date(Date.parse(val));
			var yyyy = temp.getUTCFullYear().toString();
			var mm = (temp.getUTCMonth()+1).toString();
			var dd  = temp.getUTCDate().toString();
			return (dd[1]?dd:"0"+dd[0]) +'.'+ (mm[1]?mm:"0"+mm[0]) +'.'+ yyyy;
		},

		toUTC: function(val){
			if (val== '' || val==undefined || val==null) return false;
			var date = new Date(Date.parse(val));
			return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
		},

		toDateN: function(val){
			// console.log('format text from the user')
			if (!val) return null;
			var parts = val.split(".");
			var year = parts[2], 
				month = parts[1]-1, 
				day = parts[0],
				now = new Date();
			if (!month && month != 0)
				month = now.getUTCMonth();
			if (!year)
				year = now.getUTCFullYear();
			// return new Date(year, month, day, 0,0,0,0);
			return new Date(year, month, day, 12,0,0,0);
		},

		fromDateN: function(val){
			if (!val) return '';
			var temp = new Date(Date.parse(val));
			var yyyy = temp.getUTCFullYear().toString();
			var mm = (temp.getMonth()+1).toString();
			var dd  = temp.getDate().toString();
			return (dd[1]?dd:"0"+dd[0]) +'.'+ (mm[1]?mm:"0"+mm[0]) +'.'+ yyyy;
		},
	}
};

function HelpFunction(){
	return {
		toDictionary: function(arr, field){
			dict = {}
			arr.forEach(function(obj){
				dict[obj[field]] = obj
			})
			return dict;
		}
	}
};

function UpdateFactory(){
	var updated = {}
	updated.buildings = 0;
	return {
		setBuildings: function(){
			updated.buildings++;
		},
		getBuildings: function(){
			return updated.buildings;
		}
	}
};

function PlansFilters(){
	return {
		byBuilding: function(building, plan){
			if (!building || building.id == 'all')
				return true;
			return (plan.buildings.indexOf(building.id)>-1);
		},

		bySection: function(section, plan){
			if (section.id == 'all')
				return true;
			return (plan.sections.indexOf(section.id)>-1);
		},

		byBuildings: function(buildings, plan){
			if (!buildings || buildings.length == 0)
				return true;
			return plan.buildings.some(function(p_building){ return buildings.indexOf(p_building)>-1 });
		},

		bySections: function(sections, plan){
			if (!sections || sections.length == 0)
				return true;
			return plan.sections.some(function(p_section){ return sections.indexOf(p_section)>-1 });
		},

		byArea: function(area, plan){
			return ((!!area.from && area.from <= plan.area || !area.from) &&
			 		(!!area.to && area.to >= plan.area || !area.to))
		},

		byRoom: function(room, plan){
			return (room.id == 'all' || plan.rooms_count == room.id);
		}

	}
};

function UserRole(settings){
	return {
		isDirectors: function(){
			return (settings.group && settings.group.id == 4);
		},
		isDevelopers: function(){
			return (settings.group && settings.group.id == 5);
		},
		isManagers: function(){
			return (settings.group && settings.group.id == 1);
		},
		isLeaders: function(){
			return (settings.group && settings.group.id == 2);
		}
	}
};

// function BuildFirstSection(){
// 	var sectionOfBuild = {};
// 	return {
// 		setList: function(links){
// 			links.forEach(function(obj){
// 				// "#/buildings/53/sections/136"
// 				// /(?<=buildings.*)[0-9]/
// 				// /(?:buildings )[0-9]+/
// 				var b_pk = obj.link.match(/buildings\/([0-9]+)/)[1],
// 					s_pk = obj.link.match(/sections\/([0-9]+)/)[1];
// 				sectionOfBuild[b_pk] = s_pk;
// 			})

// 		},
// 		getSection: function(building){
// 			console.log('sectionOfBuild  ', sectionOfBuild);
// 			console.log('building  ', building);
// 			console.log('sectionOfBuild[building]  ', sectionOfBuild[building]);
// 			return sectionOfBuild[building] || '';
// 		}
// 	}
// }
