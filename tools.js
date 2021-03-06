function toId(text)
{
	text = text || '';
	if (typeof text !== 'string') return ''; //???
	return text.replace(/ /g, '');
}

function BattleTools()
{
	var selfT = this;
	this.getImmunity = function(type, target) {
		for (var i=0; i<target.types.length; i++)
		{
			if (BattleTypeChart[target.types[i]] && BattleTypeChart[target.types[i]].damageTaken && BattleTypeChart[target.types[i]].damageTaken[type] === 3)
			{
				return false;
			}
		}
		return true;
	};
	this.getEffectiveness = function(type, target) {
		var totalTypeMod = 0;
		for (var i=0; i<target.types.length; i++)
		{
			if (!BattleTypeChart[target.types[i]]) continue;
			var typeMod = BattleTypeChart[target.types[i]].damageTaken[type];
			if (typeMod === 1) // super-effective
			{
				totalTypeMod++;
			}
			if (typeMod === 2) // resist
			{
				totalTypeMod--;
			}
			// in case of weird situations like Gravity, immunity is
			// handled elsewhere
		}
		return totalTypeMod;
	};
	this.getTemplate = function(template) {
		if (!template || !template.id)
		{
			var id = toId(template);
			template = {};
			if (id && BattlePokedex[id])
			{
				template = BattlePokedex[id];
			}
			if (BattleTiers[id])
			{
				template.tier = BattleTiers[id].tier;
			}
			if (BattleTiers[id])
			{
				template.tier = BattleTiers[id].tier;
			}
			if (BattleLearnsets[id])
			{
				template.learnset = BattleLearnsets[id].learnset;
			}
		}
		return template;
	};
	this.getMove = function(move) {
		if (!move || !move.id)
		{
			var id = toId(move);
			move = {};
			if (id.substr(0,12) === 'HiddenPower[')
			{
				var hptype = id.substr(12);
				hptype = hptype.substr(0,hptype.length-1);
				id = 'HiddenPower'+hptype;
			}
			if (id && BattleMovedex[id])
			{
				move = BattleMovedex[id];
			}
			if (!move.critRatio) move.critRatio = 1;
			if (!move.id) move.id = id;
			if (!move.effectType) move.effectType = 'Move';
		}
		return move;
	};
	this.getNature = function(nature) {
		return BattleScripts.getNature.call(selfT, nature);
	};
	this.getEffect = function(effect) {
		if (!effect || typeof effect === 'string')
		{
			var name = effect;
			var id = toId(name);
			effect = {};
			if (id && BattleStatuses[id])
			{
				effect = BattleStatuses[id];
			}
			else if (id && BattleMovedex[id] && BattleMovedex[id].effect)
			{
				effect = BattleMovedex[id].effect;
			}
			else if (id && BattleAbilities[id] && BattleAbilities[id].effect)
			{
				effect = BattleAbilities[id].effect;
			}
			else if (id && BattleItems[id] && BattleItems[id].effect)
			{
				effect = BattleItems[id].effect;
			}
			else if (id && BattleFormats[id])
			{
				effect = BattleFormats[id];
				if (!effect.effectType) effect.effectType = 'Format';
			}
			else if (id === 'recoil')
			{
				effect = {
					effectType: 'Recoil'
				};
			}
			else if (id === 'drain')
			{
				effect = {
					effectType: 'Drain'
				};
			}
			if (!effect.id) effect.id = id;
			if (!effect.name) effect.name = name;
			if (!effect.category) effect.category = 'Effect';
			if (!effect.effectType) effect.effectType = 'Effect';
		}
		return effect;
	};
	this.getItem = function(item) {
		if (!item || typeof item === 'string')
		{
			var id = toId(item);
			item = {};
			if (id && BattleItems[id])
			{
				item = BattleItems[id];
			}
			if (!item.id) item.id = id;
			if (!item.category) item.category = 'Effect';
			if (!item.effectType) item.effectType = 'Item';
		}
		return item;
	};
	this.getAbility = function(ability) {
		if (!ability || typeof ability === 'string')
		{
			var id = toId(ability);
			ability = {};
			if (id && BattleAbilities[id])
			{
				ability = BattleAbilities[id];
			}
			if (!ability.id) ability.id = id;
			if (!ability.category) ability.category = 'Effect';
			if (!ability.effectType) ability.effectType = 'Ability';
		}
		return ability;
	};
	this.getType = function(type) {
		if (!type || typeof type === 'string')
		{
			var id = toId(type);
			type = {};
			if (id && BattleTypeChart[id])
			{
				type = BattleTypeChart[id];
				type.isType = true;
				type.effectType = 'Type';
			}
			if (!type.id) type.id = id;
			if (!type.effectType)
			{
				// man, this is really meta
				type.effectType = 'EffectType';
			}
		}
		return type;
	};
	
	
	this.checkLearnset = function(move, template) {
		if (move.id) move = move.id;
		do
		{
			if (!template.learnset || template.learnset[move])
			{
				return true;
			}
			if (template.species === 'Deoxys-S' || template.species === 'Deoxys-A' || template.species === 'Deoxys-D')
			{
				template = selfT.getTemplate('Deoxys');
			}
			else if (template.species.substr(0,7) === 'Arceus-')
			{
				template = selfT.getTemplate('Arceus');
			}
			else
			{
				template = selfT.getTemplate(template.prevo);
			}
		} while (template && template.id);
		return false;
	};
	this.getBanlistTable = function(format, subformat) {
		var banlistTable;
		if (format.banlistTable && !subformat)
		{
			banlistTable = format.banlistTable;
		}
		else
		{
			if (!format.banlistTable) format.banlistTable = {};
			if (!format.setBanTable) format.setBanTable = [];
			if (!format.teamBanTable) format.teamBanTable = [];
			
			banlistTable = format.banlistTable;
			if (!subformat) subformat = format;
			if (subformat.banlist)
			{
				for (var i=0; i<subformat.banlist.length; i++)
				{
					// make sure we don't infinitely recurse
					if (banlistTable[toId(subformat.banlist[i])]) continue;
					
					banlistTable[subformat.banlist[i]] = true;
					banlistTable[toId(subformat.banlist[i])] = true;
					
					var plusPos = subformat.banlist[i].indexOf('+');
					if (plusPos && plusPos > 0)
					{
						var plusPlusPos = subformat.banlist[i].indexOf('++');
						if (plusPlusPos && plusPlusPos > 0)
						{
							var complexList = subformat.banlist[i].split('++');
							for (var j=0; j<complexList.length; j++)
							{
								complexList[j] = toId(complexList[j]);
							}
							format.teamBanTable.push(complexList);
						}
						else
						{
							var complexList = subformat.banlist[i].split('+');
							for (var j=0; j<complexList.length; j++)
							{
								complexList[j] = toId(complexList[j]);
							}
							format.setBanTable.push(complexList);
						}
					}
					
					var subsubformat = selfT.getEffect(subformat.banlist[i]);
					if (subsubformat.banlist && subsubformat.effectType === 'Banlist')
					{
						selfT.getBanlistTable(format, subsubformat);
					}
				}
			}
		}
		return banlistTable;
	};
	this.validateTeam = function(team, format) {
		var problems = [];
		format = selfT.getEffect(format);
		selfT.getBanlistTable(format);
		if (format.team === 'random')
		{
			return false;
		}
		if (!team)
		{
			return ["Random teams are not allowed in this format."];
		}
		if (!team.length)
		{
			return ["Your team has no pokemon."];
		}
		var teamHas = {};
		for (var i=0; i<team.length; i++)
		{
			var setProblems = selfT.validateSet(team[i], format, teamHas);
			if (setProblems)
			{
				problems = problems.concat(setProblems);
			}
		}
		
		for (var i=0; i<format.teamBanTable.length; i++)
		{
			var bannedCombo = '';
			for (var j=0; j<format.teamBanTable[i].length; j++)
			{
				if (!teamHas[format.teamBanTable[i][j]])
				{
					bannedCombo = false;
					break;
				}
				
				if (j == 0)
				{
					bannedCombo += format.teamBanTable[i][j];
				}
				else
				{
					bannedCombo += ' and '+format.teamBanTable[i][j];
				}
			}
			if (bannedCombo)
			{
				problems.push("Your team has the combination of "+bannedCombo+", which is banned.");
			}
		}
		
		if (!problems.length) return false;
		return problems;
	};
	this.validateSet = function(set, format, teamHas) {
		var problems = [];
		format = selfT.getEffect(format);
		if (!set)
		{
			return ["This is not a pokemon."];
		}
		set.species = set.species || set.name || 'Bulbasaur';
		set.name = set.name || set.species;
		var template = selfT.getTemplate(set.species);
		var source = '';
		
		var setHas = {};
		
		if (!template || !template.abilities)
		{
			set.species = 'Bulbasaur';
			template = selfT.getTemplate('Bulbasaur')
		}
		
		var banlistTable = selfT.getBanlistTable(format);
		
		setHas[toId(set.species)] = true;
		if (banlistTable[toId(set.species)])
		{
			problems.push(set.species+' is banned.');
		}
		setHas[toId(set.ability)] = true;
		if (banlistTable[toId(set.ability)])
		{
			problems.push(set.name+"'s ability "+set.ability+" is banned.");
		}
		setHas[toId(set.item)] = true;
		if (banlistTable[toId(set.item)])
		{
			problems.push(set.name+"'s item "+set.item+" is banned.");
		}
		if (banlistTable['Unreleased'] && setHas['SoulDew'])
		{
			problems.push(set.name+"'s item "+set.item+" is unreleased.");
		}
		setHas[toId(set.ability)] = true;
		if (banlistTable['Standard'])
		{
			var totalEV = 0;
			for (var k in set.evs)
			{
				totalEV += set.evs[k];
			}
			if (totalEV > 510)
			{
				problems.push(set.name+" has more than 510 total EVs.");
			}
			
			var ability = selfT.getAbility(set.ability).name;
			if (ability !== template.abilities['0'] &&
			    ability !== template.abilities['1'] && 
			    ability !== template.abilities['DW'])
			{
				problems.push(set.name+" ("+set.species+") can't have "+set.ability+".");
			}
			if (ability === template.abilities['DW'])
			{
				source = 'DW';
				
				unreleasedDW = {
					Serperior: 1, Chandelure: 1, Ditto: 1,
					Breloom: 1, Zapdos: 1, Lucario: 1, Feraligatr: 1, Gothitelle: 1,
					'Ho-Oh': 1, Lugia: 1, Raikou: 1
				};
				
				if (unreleasedDW[set.species] && banlistTable['Unreleased'])
				{
					problems.push(set.name+" ("+set.species+")'s Dream World ability is unreleased.");
				}
			}
		}
		if (!set.moves || !set.moves.length)
		{
			problems.push(set.name+" has no moves.");
		}
		else for (var i=0; i<set.moves.length; i++)
		{
			var move = selfT.getMove(set.moves[i]);
			setHas[move.id] = true;
			if (banlistTable[move.id])
			{
				problems.push(set.name+"'s move "+set.moves[i]+" is banned.");
			}
			else if (move.ohko && banlistTable['OHKO'])
			{
				problems.push(set.name+"'s move "+set.moves[i]+" is an OHKO move, which is banned.");
			}
			
			if (banlistTable['Standard'])
			{
				if (!selfT.checkLearnset(move, template))
				{
					problems.push(set.name+" ("+set.species+") can't learn "+move.name);
				}
			}
		}
		setHas[toId(template.tier)] = true;
		if (banlistTable[template.tier])
		{
			problems.push(set.name+" is in "+template.tier+", which is banned.");
		}
		
		if (teamHas)
		{
			for (var i in setHas)
			{
				teamHas[i] = true;
			}
		}
		for (var i=0; i<format.setBanTable.length; i++)
		{
			var bannedCombo = '';
			for (var j=0; j<format.setBanTable[i].length; j++)
			{
				if (!setHas[format.setBanTable[i][j]])
				{
					bannedCombo = false;
					break;
				}
				
				if (j == 0)
				{
					bannedCombo += format.setBanTable[i][j];
				}
				else
				{
					bannedCombo += ' and '+format.setBanTable[i][j];
				}
			}
			if (bannedCombo)
			{
				problems.push(set.name+" has the combination of "+bannedCombo+", which is banned.");
			}
		}
		
		if (!problems.length) return false;
		return problems;
	};
	
	/* for (var i in BattleScripts)
	{
		var script = BattleScripts[i];
		this[i] = function() {
			return script.apply(selfT, arguments);
		};
	} */
}

exports.BattleTools = BattleTools;
