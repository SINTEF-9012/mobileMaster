'use strict';

angular.module('mobileMasterApp').provider('Knowledge', function () {

	var knowledge = [
		{
			typeName: "", // default
			tablePropertiesOrder: { name : 10, location: -1} /*,
			icon: (thing)=> {
				return L.marker();
			}*/
		},
		{
			typeName: "vehicle",
			tablePropertiesOrder: { speed: 5 }
		}
	];

	this.addKnowledge = (k: Knowledge) => {
		knowledge.push(k);
	};

	this.$get = ()=> {
		return {
			getPropertiesOrder: (thingType: ThingModel.ThingType) =>
			{
				var scores = {};
				_.each(knowledge, (k: Knowledge)=> {
					if (thingType.Name.match(k.typeName)) {
						_.each(k.tablePropertiesOrder, (score, key) =>
						{
							if (scores.hasOwnProperty(key)) {
								scores[key] += score;
							} else {
								scores[key] = score;
							}
						});
					}
				});

				var list = [];

				_.each(thingType.Properties, (prop: ThingModel.PropertyType) => {
					var score = scores[prop.Key] || 0;

					if (score >= 0) {
						var scopeProp: any = {
							key: prop.Key,
							required: prop.Required,
							type: ThingModel.Type[prop.Type]
					};

						// TODO identify undefined source and fixe it
						if (prop.Name !== "undefined") {
							scopeProp.name = prop.Name;
						}
						if (prop.Description !== "undefined") {
							scopeProp.description = prop.Description;
						}

						list.push({
							key: prop.Key,
							property: scopeProp,
							score: score + (prop.Required ? 1 : 0)
						});
					}
				});
				list.sort((a, b) => {
					var scorea = a.score,
						scoreb = b.score;
					return scorea === scoreb ? a.key.localeCompare(b.key) : scoreb - scorea;
				});

				return list;
			}
		};
	};
});
