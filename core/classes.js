var classes = {
	'elementalist':{
		'name':"Elementalist",
		'description':'A caster that uses <span style=\"color: #40A0B0\">Mana</span> to harm or hinder her enemies.',
		'color':'#40A0B0',
		'defense':9,
		'categories':['Basic','Empowered','Other'],
		'attacks':{
			'ele-strike': {
				'name':'Elemental Strike',
				'description':'This spell generates <span style=\"color: #40A0B0\">Mana</span> whether or not it hits.',
				'damage':{'base':1,'d6':1, 'mana':1},
				'targets':1,
				'type':'spell',
				'target':'enemy',
				'category':'Basic',
				'custom':function(player) {
					players[player]['stats']['mana'] += this['damage']['mana'];
					return false;
				},
			},
			'ele-missile': {
				'name':'Magic Missile',
				'description':'This spell hits <span style=\"color: lightcoral\">3</span> times and generates <span style=\"color: #40A0B0\">Mana</span> for each hit.',
				'damage':{'base':1, 'hits':3, 'mana':1},
				'targets':1,
				'type':'spell',
				'target':'enemy',
				'category':'Basic',
				'custom':function(player) {
					targets_picked.push(targets_picked[1]);
					targets_picked.push(targets_picked[1]);
					return false;
				},
				'hitcustom':function(player, enemy) {
					players[player]['stats']['mana'] += this['damage']['mana'];
					return false;
				},
			},
			'ele-blast': {
				'name':'Elemental Blast',
				'description':'This spell hits <span style=\"color: lightcoral\">2</span> targets and consumes <span style=\"color: #40A0B0\">Mana</span> whether it hits or not.',
				'damage':{'base':1, 'd4':2, 'mana':-2},
				'targets':2,
				'type':'spell',
				'target':'enemy',
				'category':'Empowered',
			},
			'ele-summon': {
				'name':'Summon Elemental',
				'description':'This spell summons an elemental that attacks its target at the end of each turn.  If the target dies, it will choose a new target at random.',
				'damage':{'d6':1, 'mana':-3},
				'targets':1,
				'type':'spell',
				'target':'enemy',
				'category':'Empowered',
				'custom':function(player) {
					addBuff(player, 'elemental', {'name':'Summoned Elemental','duration':3,'target':targets_picked[1],'custom':function() {
							if (victory) return;
							if (!(this['target'] in enemies))
								this['target'] = Object.keys(enemies)[ Math.floor(Object.keys(enemies).length * Math.random())];
							sendEvent(this['name'] + " attacks " + enemies[this['target']]['name'] + "...");

							var _roll = diceRoll({'d20':1}, this['name'] + " [Hit]");
							if (_roll >= enemies[this['target']]['stats']['defense']) {
								var _damage = diceRoll({'d6':1}, this['name'] + " [Damage]");
								sendEvent("and hits, dealing <span style=\"color:red\">" + _damage + "</span> damage!<br>", true);
								damageEnemy(this['target'], _damage);
							} else {
								sendEvent("but misses!<br>", true);
							}
					}});
					nextTurn();
					return true;
				},
			},		
			'ele-explosion': {
				'name':'Mana Explosion',
				'description':'This spell deals extreme damage and costs a lot of <span style=\"color: #40A0B0\">Mana</span> whether or not it hits.',
				'damage':{'base':3, 'd6':3, 'mana':-4},
				'targets':1,
				'type':'spell',
				'target':'enemy',
				'category':'Empowered',
			},
			'ele-meditation': {
				'name':'Meditation',
				'description':'This spell generates <span style=\"color: #40A0B0\">Mana</span> at the cost of making the user vulnerable until their next turn.',
				'targets':0,
				'damage':{'mana':3},
				'type':'spell',
				'target':'enemy',
				'category':'Other',
				'custom':function(player) {
					players[player]['stats']['mana'] += this['damage']['mana'];
					setStanding(player);
					sendEvent(players[player]['name'] + " begins meditation to gather mana.  She will be vulnerable until her next turn!<br>");
					addBuff(player, 'standing', {'name':'Meditating','defense':-4, 'enemyeffect':4, 'hidden':true});
					nextTurn();
					return true;
				}
			},
			'ele-flash': {
				'name':'Blinding Flash',
				'description':'This spell blinds all targets for several turns, reducing their <span style=\"color: #22B14C\">Hit</span>, <span style=\"color: #22B14C\">Defense</span> and <span style=\"color: #22B14C\">Effect</span>.',
				'targets':0,
				'damage':{'mana':-1},
				'type':'spell',
				'target':'enemy',
				'category':'Other',
				'custom':function(player) {
					sendEvent(players[player]['name'] + " emits a flash of light as bright as the sun, temporarily blinding the enemies!<br>");
					for (var _enemy in enemies)
						enemyBuff(_enemy, 'blinded', {'name':'Blinded','duration':3,'defense':-2, 'effect':-2, 'hit':-2});
					nextTurn();
					return true;
				}
			},		
		},
	},
	'valkyrie':{
		'name':"Valkyrie",
		'description':'An offensive class that can use an array of ancient <span style=\"color: gray\">Weapons</span> to attack her enemies.<br><br>She can <span style=\"color: red\">Break</span> her weapons to unleash their full power in one burst at the cost of not being able to use it again that battle.',
		'color':'gray',
		'defense':9,
		'categories':['Basic','Gungnir','Tyrfing','Mjolnir','Equip'],
		'setupcustom':function(player) {
			addBuff(player, 'baseweapon',{'name':'Base Weaponry','tyrfing':4,'gungnir':4,'mjolnir':4,'hidden':true});
		},
		'attacks':{
			'valk-strike': {
				'name':'Unarmed Strike',
				'description':'A basic attack that can be used even if other <span style=\"color: gray\">Weapons</span> are broken.  It deals less damage than other attacks, but hits twice.',
				'damage':{'d4':1,'hits':2},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Basic',
				'custom':function(player) {
					targets_picked.push(targets_picked[1]);
					return false;
				},
			},
			'valk-gung-equip': {
				'name':'The Spear, Gungnir',
				'description':'Equip this <span style=\"color: gray\">Weapon</span>. Does not end the user\'s turn.',
				'targets':0,
				'type':'other',
				'notrap':true,
				'target':'enemy',
				'category':'Equip',
				'condition':function(player) {
					return !hasBuff(player, 'gungnir');
				},
				'custom':function(player) {
					players[player]['equipped'] = 'gungnir';
					showActions(player);
					return true;
				},
			},
			'valk-gung-attack': {
				'name':'Pierce Armor',
				'description':'Deal damage with bonus <span style=\"color: #22B14C\">Hit</span>.  Lowers the target\'s <span style=\"color: #22B14C\">Defense</span> until their next turn.  <span style=\"color: gray\">Weapon</span> is unusable for 2 turns.',
				'damage':{'d6':1, 'hit':2},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Gungnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'gungnir');
				},
				'hitcustom':function(player, enemy) {
					enemyBuff(enemy, 'gungnir', {'name':'Pierce Armor','duration':2,'defense':-2});
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'gungnir', {'name':'Gungnir Recovery','duration':3,'gungnir':-3,'hidden':true,'custom':function() { this['gungnir'] = (this['duration']-1) * -1;
					}});
					return true;
				},
			},
			'valk-gung-defense': {
				'name':'Unrivalled Accuracy',
				'description':'Raise an ally\'s <span style=\"color: #22B14C\">Hit</span> for 4 turns.   <span style=\"color: gray\">Weapon</span> is unusable for 3 turns.',
				'damage':{'hit':2},
				'targets':1,
				'type':'other',
				'target':'ally',
				'category':'Gungnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'gungnir');
				},
				'custom':function(player) {
					sendEvent("An aura of power surrounds " + players[targets_picked[1]]['name'] + "!<br>");
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'gungnir', {'name':'Gungnir Recovery','duration':4,'gungnir':-4,'hidden':true,'custom':function() { this['gungnir'] = (this['duration']-1) * -1; }});
					addBuff(targets_picked[1], 'gungnir-buff', {'name':'Unrivalled Accuracy','duration':4,'hit':2});
					return false;
				},
			},
			'valk-gung-overdrive': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Meteor Spear</span>',
				'description':'Deal damage with bonus <span style=\"color: #22B14C\">Hit</span>.  Lowers the target\'s  <span style=\"color: #22B14C\">Defense</span> for 3 turns.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'damage':{'d6':3, 'hit':2},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Gungnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'gungnir');
				},
				'hitcustom':function(player, enemy) {
					enemyBuff(enemy, 'gungnir', {'name':'Pierce Armor','duration':3,'defense':-2});
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'gungnir', {'name':'Gungnir Recovery','gungnir':-8,'hidden':true});
					return true;
				},
			},
			'valk-gung-bondage': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Bondage Destruction</span>',
				'description':'<span style=\"color: red\">Dissolve</span> one binding that is below 8 levels.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'targets':1,
				'type':'other',
				'target':'binding',
				'category':'Gungnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'gungnir');
				},
				'custom':function(player) {
					if (players[selected_player]['bindings'][selected_item]['level'] < 8) {
						sendEvent("Gungnir shatters, releasing its magic and dissolving the " + bindings[selected_item]['location'] + " bondage!<br>", true);
						removeItem(selected_player, selected_item);
						players[player]['equipped'] = 'unarmed';
						addBuff(player, 'gungnir', {'name':'Gungnir Recovery','gungnir':-8,'hidden':true});
					} else {
						sendEvent("Gungnir glows, but nothing more.  It seems this bondage is too strong to be removed by it!<br>");
					}
					return false;
				},
			},
			'valk-tyr-equip': {
				'name':'The Sword, Tyrfing',
				'description':'Equip this <span style=\"color: gray\">Weapon</span>. Does not end the user\'s turn.',
				'targets':0,
				'type':'other',
				'notrap':true,
				'target':'enemy',
				'category':'Equip',
				'condition':function(player) {
					return !hasBuff(player, 'tyrfing');
				},
				'custom':function(player) {
					players[player]['equipped'] = 'tyrfing';
					showActions(player);
					return true;
				},
			},
			'valk-tyr-attack': {
				'name':'Slash of Misfortune',
				'description':'Deal high damage to the enemy.  Lowers the target\'s <span style=\"color: #22B14C\">Hit</span> until their next turn.  <span style=\"color: gray\">Weapon</span> is unusable for 2 turns.',
				'damage':{'base':2, 'd6':1},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Tyrfing',
				'condition':function(player) {
					return (players[player]['equipped'] == 'tyrfing');
				},
				'hitcustom':function(player, enemy) {
					enemyBuff(enemy, 'gungnir', {'name':'Misfortune','duration':1,'hit':-2});
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'tyrfing', {'name':'Tyrfing Recovery','duration':3,'tyrfing':-3,'hidden':true,'custom':function() { this['tyrfing'] = (this['duration']-1) * -1;
					}});
					return true;
				},
			},
			'valk-tyr-defense': {
				'name':'Fortune Aura',
				'description':'Raise an ally\'s <span style=\"color: #22B14C\">Defense</span> for 4 turns.   <span style=\"color: gray\">Weapon</span> is unusable for 3 turns.',
				'damage':{'defense':2},
				'targets':1,
				'type':'other',
				'target':'ally',
				'category':'Tyrfing',
				'condition':function(player) {
					return (players[player]['equipped'] == 'tyrfing');
				},
				'custom':function(player) {
					sendEvent("An aura of power surrounds " + players[targets_picked[1]]['name'] + "!<br>");
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'tyrfing', {'name':'Tyrfing Recovery','duration':4,'tyrfing':-4,'hidden':true,'custom':function() { this['tyrfing'] = (this['duration']-1) * -1; }});
					addBuff(targets_picked[1], 'tyrfing-buff', {'name':'Fortune Aura','duration':4,'defense':2});
					return false;
				},
			},
			'valk-tyr-overdrive': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Wave of Misfortune</span>',
				'description':'Deal high damage to the target.  Lowers the target\'s  <span style=\"color: #22B14C\">Hit</span> for 3 turns.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'damage':{'base':2, 'd6':2},
				'targets':0,
				'type':'physical',
				'target':'enemy',
				'category':'Tyrfing',
				'condition':function(player) {
					return (players[player]['equipped'] == 'tyrfing');
				},
				'custom':function(player, enemy) {
					for (var _enemy in enemies) {
						targets_picked.push(_enemy);
					}
				},
				'hitcustom':function(player, enemy) {
					enemyBuff(enemy, 'tyrfing', {'name':'Misfortune','duration':2,'hit':-2});
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'tyrfing', {'name':'Tyrfing Recovery','tyrfing':-8,'hidden':true});
					return true;
				},
			},
			'valk-tyr-bondage': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Bondage Destruction</span>',
				'description':'<span style=\"color: red\">Dissolve</span> one binding that is below 8 levels.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'targets':1,
				'type':'other',
				'target':'binding',
				'category':'Tyrfing',
				'condition':function(player) {
					return (players[player]['equipped'] == 'tyrfing');
				},
				'custom':function(player) {
					if (players[selected_player]['bindings'][selected_item]['level'] < 8) {
						sendEvent("Tyrfing shatters, releasing its magic and dissolving the " + bindings[selected_item]['location'] + " bondage!<br>", true);
						removeItem(selected_player, selected_item);
						players[player]['equipped'] = 'unarmed';
						addBuff(player, 'tyrfing', {'name':'Tyrfing Recovery','tyrfing':-8,'hidden':true});
					} else {
						sendEvent("Tyrfing glows, but nothing more.  It seems this bondage is too strong to be removed by it!<br>");
					}
					return false;
				},
			},
			'valk-mjol-equip': {
				'name':'The Hammer, Mjolnir',
				'description':'Equip this <span style=\"color: gray\">Weapon</span>. Does not end the user\'s turn.',
				'targets':0,
				'type':'other',
				'notrap':true,
				'target':'enemy',
				'category':'Equip',
				'condition':function(player) {
					return !hasBuff(player, 'mjolnir');
				},
				'custom':function(player) {
					players[player]['equipped'] = 'mjolnir';
					showActions(player);
					return true;
				},
			},
			'valk-mjol-attack': {
				'name':'Reverberating Smash',
				'description':'Deal very high damage with a low <span style=\"color: #22B14C\">Hit</span> rate.  <span style=\"color: gray\">Weapon</span> is unusable for 3 turns.',
				'damage':{'base':2, 'd6':2, 'hit':-3},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Mjolnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'mjolnir');
				},
				'hitcustom':function(player, enemy) {
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'mjolnir', {'name':'Mjolnir Recovery','duration':4,'mjolnir':-4,'hidden':true,'custom':function() { this['mjolnir'] = (this['duration']-1) * -1;
					}});
					return true;
				},
			},
			'valk-mjol-defense': {
				'name':'Enhanced Strength',
				'description':'Raise an ally\'s <span style=\"color: #22B14C\">Escape</span> for 4 turns.   <span style=\"color: gray\">Weapon</span> is unusable for 3 turns.',
				'damage':{'escape':2},
				'targets':1,
				'type':'other',
				'target':'ally',
				'category':'Mjolnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'mjolnir');
				},
				'custom':function(player) {
					sendEvent("An aura of power surrounds " + players[targets_picked[1]]['name'] + "!<br>");
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'mjolnir', {'name':'Mjolnir Recovery','duration':4,'mjolnir':-4,'hidden':true,'custom':function() { this['mjolnir'] = (this['duration']-1) * -1; }});
					addBuff(targets_picked[1], 'mjolnir-buff', {'name':'Enchanced Strength','duration':4,'escape':2});
					return false;
				},
			},
			'valk-mjol-overdrive': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Mountain Crusher</span>',
				'description':'Deals extreme damage.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'damage':{'base':4, 'd6':4},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Mjolnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'mjolnir');
				},
				'hitcustom':function(player, enemy) {
					players[player]['equipped'] = 'unarmed';
					addBuff(player, 'mjolnir', {'name':'Mjolnir Recovery','mjolnir':-8,'hidden':true});
					return true;
				},
			},			
			'valk-mjol-bondage': {
				'name':'Overdrive: <span style=\"font-weight: bold;\">Bondage Destruction</span>',
				'description':'<span style=\"color: red\">Dissolve</span> one binding that is below 8 levels.  <span style=\"color: gray\">Weapon</span> is <span style=\"color: red\">Broken</span> and cannot be used for the rest of the fight.',
				'targets':1,
				'type':'other',
				'target':'binding',
				'category':'Mjolnir',
				'condition':function(player) {
					return (players[player]['equipped'] == 'mjolnir');
				},
				'custom':function(player) {
					if (players[selected_player]['bindings'][selected_item]['level'] < 8) {
						sendEvent("Mjolnir shatters, releasing its magic and dissolving the " + bindings[selected_item]['location'] + " bondage!<br>", true);
						removeItem(selected_player, selected_item);
						players[player]['equipped'] = 'unarmed';
						addBuff(player, 'mjolnir', {'name':'Mjolnir Recovery','mjolnir':-8,'hidden':true});
					} else {
						sendEvent("Mjolnir glows, but nothing more.  It seems this bondage is too strong to be removed by it!<br>");
					}
					return false;
				},
			},
		},
	},
	'magical_girl':{
		'name':"Magical Girl",
		'description':'A defensive class that uses <span style=\"color: #FFADC9\">Ribbon</span> power to support her allies and attack her enemies.<br><br>Her class has the innate ability to reduce incoming bindings by consuming <span style=\"color: #FFADC9\">Ribbon</span> power.',
		'color':'#FFADC9',
		'defense':11,
		'categories':['Basic','Transformation','Ultimate'],
		'attacks':{
			'mg-wand': {
				'name':'Wand Smash',
				'description':'Hit an enemy with your wand. Is a <span style=\"color: lightcoral\">Physical</span> attack, so it can be used even while <span style=\"color: #22B14C\">Gagged</span>.',
				'damage':{'base':1,'d6':1},
				'targets':1,
				'type':'physical',
				'target':'enemy',
				'category':'Basic',
			},
			'mg-emergency': {
				'name':'Emergency Transformation',
				'description':'Can only be used when heavily bound.  Lowers the user\'s highest binding by 4 levels, and creates a shield that raises the user\'s <span style=\"color: #22B14C\">Defense</span>.  Cannot be reused until the shield wears off.',
				'damage':{'ribbon':10},
				'targets':0,
				'type':'other',
				'target':'ally',
				'category':'Basic',
				'condition':function(player) {
					if (hasBuff(player, 'magical-shield'))
						return false;
					for (var _binding in players[player]['bindings'])
						if (players[player]['bindings'][_binding]['level'] > 6 && bindings[_binding]['notransfer'] !== true)
							return true;
					return false;
				},
				'custom':function(player) {
					players[player]['stats']['ribbon'] += this['damage']['ribbon'];	
					var _level = 0;
					var _tempbinding = null;
					for (var _binding in players[player]['bindings']) {
						if (players[player]['bindings'][_binding]['level'] > _level) {
							_level = players[player]['bindings'][_binding]['level'];
							_tempbinding = _binding;
						}
					}
					adjustItem(player,_tempbinding, -4);
					addBuff(player, 'magical-shield', {'name':'Magical Shield','defense':2,'duration':5});
					sendEvent("Your transformation not only recharges your power, but also releases your " + bindings[_tempbinding]['location'] + " bondage! The ribbons form a shield to ward off incoming attacks, as well.<br>");
					return false;
				}
			},
			'mg-transform': {
				'name':'Transformation Sequence',
				'description':'Generates <span style=\"color: #FFADC9\">Ribbon</span> power.  In addition, the user gains <span style=\"color: #22B14C\">Defense</span> and <span style=\"color: #22B14C\">Hit</span>.  Cannot be reused until the transformation wears off.',
				'damage':{'ribbon':10},
				'targets':0,
				'type':'spell',
				'target':'ally',
				'category':'Basic',
				'condition':function(player) {
					return (!hasBuff(player, 'magical-dress') && !hasBuff(player, 'ripped-dress'));
				},
				'custom':function(player) {
					players[player]['stats']['ribbon'] += this['damage']['ribbon'];	
					addBuff(player, 'magical-dress', {'name':'Magical Dress','hit':2,'defense':2,'duration':5});
					sendEvent("You gather your power, and it forms a dress made of ribbons around your body!<br>");
					return false;
				}
			},
			'mg-gather': {
				'name':'Gather Power',
				'description':'Generates <span style=\"color: #FFADC9\">Ribbon</span> power.  Can only be used while transformed.',
				'damage':{'ribbon':10},
				'targets':0,
				'type':'spell',
				'target':'ally',
				'category':'Basic',
				'condition':function(player) {
					return hasBuff(player, 'magical-dress');
				},
				'custom':function(player) {
					players[player]['stats']['ribbon'] += this['damage']['ribbon'];	
					sendEvent("You gather even more power, readying yourself for the climax!<br>");
					return false;
				}
			},
			'mg-magic': {
				'name':'Ribbon Magic',
				'description':'Consumes <span style=\"color: #FFADC9\">Ribbon</span> power in exchange for heavy damage.  Can only be used while transformed.',
				'damage':{'base':1, 'd4':3,'ribbon':-3},
				'targets':1,
				'type':'spell',
				'target':'enemy',
				'category':'Transformation',
				'condition':function(player) {
					return hasBuff(player, 'magical-dress');
				},
			},
			'mg-dress': {
				'name':'Ribbon Dress',
				'description':'Consumes <span style=\"color: #FFADC9\">Ribbon</span> power to grant an ally <span style=\"color: #22B14C\">Defense</span> and <span style=\"color: #22B14C\">Hit</span>.  Can only be used while transformed.',
				'damage':{'hit':2,'defense':2,'ribbon':-1},
				'targets':1,
				'type':'other',
				'target':'ally',
				'category':'Transformation',
				'condition':function(player) {
					return hasBuff(player, 'magical-dress');
				},
				'custom':function(player) {
					if (player == targets_picked[1]) {
						showTextResult("This cannot be used on yourself!");
						players[player]['stats']['ribbon'] -= this['damage']['ribbon'];
						return true;
					}
					sendEvent("A dress made of ribbons appears around " + players[targets_picked[1]]['name'] + "!<br>");
					addBuff(targets_picked[1], 'ribbon-dress', {'name':'Ribbon Dress','duration':4,'hit':2,'defense':2});
					return false;
				},
			},
			'mg-spiral': {
				'name':'Eternal Spiral Ribbon Flash',
				'description':'Consumes all of the user\'s <span style=\"color: #FFADC9\">Ribbon</span> power to deal extreme damage to all enemies.  Can only be used while transformed.  After casting, the user\'s transformation will wear off, and she will be unable to re-transform for 2 turns.',
				'damage':{'base':2, 'd6':3,'ribbon':-15, 'hit':2},
				'targets':0,
				'type':'spell',
				'target':'enemy',
				'category':'Ultimate',
				'condition':function(player) {
					if (!hasBuff(player, 'magical-dress'))
						return false;
					if (players[player]['stats']['ribbon'] < 11)
						return false;
					return true;
				},
				'custom':function(player) {
					sendEvent("A whirlwind of ribbons form as you raise your wand and let your power explode.  The power is so great that it destroys even your magical dress!  As the attack fades, you slump to the ground exhausted...<br>");
					for (var _enemy in enemies) {
						targets_picked.push(_enemy);
					}
					players[player]['stats']['ribbon'] = 0;
					
					addBuff(player, 'magical-dress', {'name':'Magical Dress','hit':2,'defense':2,'duration':1});
					addBuff(player, 'ripped-dress', {'name':'Destroyed Dress','duration':3});
					return false;
				}
			},
			'mg-escape': {
				'name':'Moon Ribbon Escape Magic',
				'description':'Consumes all of the user\'s <span style=\"color: #FFADC9\">Ribbon</span> power to grant an <span style=\"color: #22B14C\">Escape</span> buff to all allies.  Can only be used while transformed.  After casting, the user\'s transformation will wear off, and she will be unable to re-transform for 1 turn.',
				'damage':{'ribbon':-15},
				'targets':0,
				'type':'spell',
				'target':'ally',
				'category':'Ultimate',
				'condition':function(player) {
					if (!hasBuff(player, 'magical-dress'))
						return false;
					if (players[player]['stats']['ribbon'] < 11)
						return false;
					return true;
				},
				'custom':function(player) {
					sendEvent("You expend all of your remaining power to summon ribbons which surround you and your allies, cutting and tearing at their bindings.<br>");
					for (var _player in players) {
						addBuff(_player,'ribbon-escape',{'name':'Ribbon Escape','escape':6,'duration':2});
					}
					players[player]['stats']['ribbon'] = 0;
					
					removeBuff(player, 'magical-dress');
					addBuff(player, 'ripped-dress', {'name':'Destroyed Dress','duration':2});
					return false;
				}
			},
			'mg-sacrifice': {
				'name':'Ribbon Sacrifice',
				'description':'A last resort that can be used after an Emergency Transformation.  Absorb up to half of your ally\'s bindings onto yourself.  Cannot absorb bindings onto locations that are already at 8 or higher.',
				'damage':{'ribbon':-4},
				'targets':0,
				'type':'other',
				'target':'ally',
				'category':'Ultimate',
				'condition':function(player) {
					if (!hasBuff(player, 'magical-shield'))
						return false;
					return true;
				},
				'custom':function(player) {
					sendEvent("In one final, desperate move, your magic absorbs your allies' bondage and places it on you instead!<br>");
					for (var _player in players) {
						if (_player != player && players[_player]['stats']['incapacitated'] === 0) {
							for (var _binding in players[_player]['bindings']) {
								if (bindings[_binding]['notransfer'] !== true) {
									if (hasItem(player, _binding, 8)) {
										sendEvent("Cannot absorb any more " + bindings[_binding]['location'] + " bondage!<br>");
									} else {
										var _levels = Math.floor(players[_player]['bindings'][_binding]['level'] / 2);
										sendEvent("Absorbed " + _levels + " levels of " + bindings[_binding]['location'] + " bondage from " + players[_player]['name'] + "!<br>");
										adjustItem(_player, _binding, -(_levels));
										adjustItem(player, _binding, _levels);
									}
								}
							}	
						}
					}
					return false;
				}
			},
		},
	}
};