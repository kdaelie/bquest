/*jshint sub:true*/
/*jshint forin:false*/
var title = 'Bondage Quest Tutorial';
var footer = 'Story, Scenario, and Code (c) 2016 Aelie';

var gamestats = {
};


var bindings = {
	'sample1':{
		'name':'Sample Binding',
		'description':'Sample Binding',
		'location':'Head',
		'easy':{'bound':1, 'desc':'An Easy Binding. '},
		'medium':{'bound':2, 'desc':'A Medium Binding.'},
		'hard':{'bound':2, 'hobbled':1, 'desc':'A Hard Binding.'},
		'extreme':{'bound':3, 'hobbled':1, 'desc':'An Extreme Binding.'},
		'impossible':{'bound':4, 'hobbled':2, 'desc':'An Impossible Binding.'},
		
	},
	'sample2':{
		'name':'Sample Binding',
		'description':'Sample Binding',
		'location':'Arms',
		'easy':{'bound':1, 'desc':'An Easy Binding. '},
		'medium':{'bound':2, 'desc':'A Medium Binding.'},
		'hard':{'bound':2, 'hobbled':1, 'desc':'A Hard Binding.'},
		'extreme':{'bound':3, 'hobbled':1, 'desc':'An Extreme Binding.'},
		'impossible':{'bound':4, 'hobbled':2, 'desc':'An Impossible Binding.'},
		
	},
	'sample3':{
		'name':'Sample Binding',
		'description':'Sample Binding',
		'location':'Torso',
		'easy':{'bound':1, 'desc':'An Easy Binding. '},
		'medium':{'bound':2, 'desc':'A Medium Binding.'},
		'hard':{'bound':2, 'hobbled':1, 'desc':'A Hard Binding.'},
		'extreme':{'bound':3, 'hobbled':1, 'desc':'An Extreme Binding.'},
		'impossible':{'bound':4, 'hobbled':2, 'desc':'An Impossible Binding.'},
		
	},
	'sample4':{
		'name':'Sample Binding',
		'description':'Sample Binding',
		'location':'Legs',
		'easy':{'bound':1, 'desc':'An Easy Binding. '},
		'medium':{'bound':2, 'desc':'A Medium Binding.'},
		'hard':{'bound':2, 'hobbled':1, 'desc':'A Hard Binding.'},
		'extreme':{'bound':3, 'hobbled':1, 'desc':'An Extreme Binding.'},
		'impossible':{'bound':4, 'hobbled':2, 'desc':'An Impossible Binding.'},
		
	},
	'sample5':{
		'name':'Sample Binding',
		'description':'Sample Binding',
		'location':'Neck',
		'easy':{'bound':1, 'desc':'An Easy Binding. '},
		'medium':{'bound':2, 'desc':'A Medium Binding.'},
		'hard':{'bound':2, 'hobbled':1, 'desc':'A Hard Binding.'},
		'extreme':{'bound':3, 'hobbled':1, 'desc':'An Extreme Binding.'},
		'impossible':{'bound':4, 'hobbled':2, 'desc':'An Impossible Binding.'},
		
	},
};

var enemytypes = {
	'target':{
		'name':'Target Dummy',
		'description':'This is a simple target dummy.',
		'defense':7,
		'hp':100,
		'attacks':{
		},		
		'ai':function(enemy) {
		},
	},
};

var extraactions = {
	'leave':{
		'name':'Leave Training',
		'type':'extra',
		'targets':0,
		'target':'enemy',
		'condition':{},
		'custom':function(player){
			resetFight('start');
			return true;
		}
	}
};

var intro = [
	{
		'picture': 'images/gamescreen.png',
		'story': [
			"<center><font size='+3'>Bondage Quest: Tutorial</font></center>",
			"Bondage Quest is a game that pits a party of player characters against enemies all too eager to restrain them in any way possible.",
			"It originated as a chat room game played with a GM, a party of players and a pile of dice, but it has been reborn as a fully automated game made for one player.",
			"This version strives to follow the original chat based rules in as possible, but some rules have been altered to facilitate this automated version.",
		],
	},
	{
		'story': [
			"<b>1.  Events Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;This panel is the game log.  All actions taken and their results will appear here.",
			"<b>2.  Rolls Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;This panel is the rolls log.  Anytime the dice are rolled, the result of the roll will appear here.  Almost all attacks, effects, and escapes are decided by dice rolls.",
			"<b>3.  Turn Order Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;Enemies and Players are displayed here in turn order.  For enemies, their HP bar and Defense are also displayed next to their name.  All Enemy buffs and any Player buffs that cause them to lose their turn will appear below their names.  Players will also show whether they are 'Standing' or 'Moving'.",
			"<b>4.  Environment Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;Some scenarios contain additional stats that signify something in the game's state.  Anything from danger level to progress towards an objective can be tracked here.",
			"<b>5.  Binding Status Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;The statuses caused by the player's bindings appear here.  In general, these statuses do nothing on their own, but have direct effects on the combat statuses.<ul><li><b>Gagged:</b> Reduces spell hit and at higher levels, blocks all spell casts entirely.</li><li><b>Bound:</b> Reduces physical hit and at higher levels, blocks all physical attacks entirely.</li><li><b>Hobbled:</b> Reduces defense and trap rolls.</li><li><b>Submissive:</b> Reduces willpower rolls and increases the effect of enemy attacks.</li><li><b>Breathless:</b> Reduces defense.</li><li><b>Vibrating:</b> Reduces escape rolls and blocks the ability to struggle an additional time when standing still.</li><li><b>Immobilized:</b> Automatically standing still.</li><li><b>Stunned:</b> Cannot use any abilities or escape on your turn.</li><li><b>Helpless:</b> Turn is skipped.</li><li><b>Incapacitated:</b> Player is defeated.  Their turn is skipped, and enemies cannot attack them.  They may be able to rejoin the fight in some scenarios.</li></ul>",
			"<b>6.  Combat Status Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;Direct modifiers to rolls and other stats are displayed here.<ul><li><b>Class Resources:</b>  Each class has a unique resource that powers their abilities.  Ribbons and Mana function similarly, built up by some abilities, and spent by others.  Weapons can be used for abilities as long as they are fully charged and not broken.</li><li><b>Defense:</b> Hit rolls must equal or higher than defense to succeed.</li><li><b>Physical Hit:</b> Modifier to all physical attacks.  A single wide crimson segment means physical attacks are not usable.</li><li><b>Spell Hit:</b> Modifier to all magical attacks.  A single wide crimson segment means magical attacks are not usable.</li><li><b>Escape:</b> Modifier to all escape rolls.</li><li><b>Willpower:</b> Modifier to all willpower rolls.  Willpower is used to resist some enemy attacks.</li><li><b>Traps:</b> Modifier to all trap rolls.  Traps are only present in some scenarios.</li><li><b>Enemy Effect:</b> Modifier to the effect rolls of enemy attacks.</li><li><b>Contested Roll:</b> Some enemy attacks involve grappling that lasts beyond the initial attack.  In a contested roll, the player and the enemy will roll individually and the higher number will win (players win ties).  This is a modifier to the player's roll.</li></ul>",
			"<b>7.  Bindings Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;This panel displays the bindings that each player is bound in.  Bindings each have a level from 1 to 10.  Higher levels have more severe effects, and are more difficult to escape from.  Binding effects go up at certain levels:<ul><li><b>1:</b> Easy</li><li><b>2:</b> Medium</li><li><b>3-4:</b> Hard</li><li><b>5-7:</b> Extreme</li><li><b>8-10:</b> Impossible</li></ul>",
			"<b>8.  Buffs/Debuffs Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;Any buffs or debuffs on the current player will be displayed here.",
			"<b>9.  Attacks Panel</b><br>&nbsp;&nbsp;&nbsp;&nbsp;Available attacks for the current player appear here.  In some situations, additional 'extra' attacks will appear.",
			
		],
	},
];

var fights = {
	'attack_training':{
		'name':'Attack Training',
		'next':'start',
		'fail':'start',
		'reward':10,
		'start':function() {
			addPlayer('Lia', 'magical_girl');
			addPlayer('Reika', 'elementalist');
			addPlayer('Erin', 'valkyrie');
			var _key = addEnemy('target');
			_key = addEnemy('target');
			_key = addEnemy('target');
		},
	},
	'escape_training':{
		'name':'Escape Training',
		'next':'start',
		'fail':'start',
		'reward':10,
		'start':function() {
			var _key = addPlayer('Lia', 'magical_girl');
			adjustItem(_key, 'sample1', 1);
			adjustItem(_key, 'sample2', 2);
			adjustItem(_key, 'sample3', 3);
			adjustItem(_key, 'sample4', 5);
			adjustItem(_key, 'sample5', 8);
			_key = addPlayer('Reika', 'elementalist');
			adjustItem(_key, 'sample1', 1);
			adjustItem(_key, 'sample2', 2);
			adjustItem(_key, 'sample3', 3);
			adjustItem(_key, 'sample4', 5);
			adjustItem(_key, 'sample5', 8);
			_key = addPlayer('Erin', 'valkyrie');
			adjustItem(_key, 'sample1', 1);
			adjustItem(_key, 'sample2', 2);
			adjustItem(_key, 'sample3', 3);
			adjustItem(_key, 'sample4', 5);
			adjustItem(_key, 'sample5', 8);
			_key = addEnemy('target');
		},
	},

}	

var states = {
	'start':{
		'title':'Tutorial Realm',
		'map': 'images/outside_realm.png',
		'map-items': [
		],
		'story': [
				"If you want more info about an attack, enemy, binding, or character, you can 'examine' it to get a detailed explanation.",
				"<img src=\"./games/" + escUrl(game) + "/images/examinedemo.png\">",
			],
		'decisions': [
			{'decision': 'Attack Training', 'result':{'move_to':'attack'}},
			{'decision': 'Escape Training', 'result':{'move_to':'escape'}},
		],
		'actions': [
		],
	},

	'attack':{
		'title':'Tutorial Realm',
		'fight':'attack_training',
		'map': 'images/outside_realm.png',
		'map-items': [],
		'story': [
				"To attack an enemy, choose the attack in the bottom right, then choose the target.",
				"<img src=\"./games/" + escUrl(game) + "/images/attackdemo.png\">",
			],
		'actions': [
		],
	},

	'escape':{
		'title':'Tutorial Realm',
		'fight':'escape_training',
		'map': 'images/outside_realm.png',
		'map-items': [],
		'story': [
				"To escape a binding, choose 'escape' in the bottom right, then choose the binding.",
				"<img src=\"./games/" + escUrl(game) + "/images/escapedemo.png\">",
			],
		'actions': [
		],
	},
};

var bad_ends = {

	};

var good_ends = [];