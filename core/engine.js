/*jshint sub:true*/
/*jshint forin:false*/
/* BQuest
 * 
 * This file is part of BQuest
 * 
 * BQuest is licenced under public domain and or CC-0
 * See http://creativecommons.org/publicdomain/zero/1.0/
 * 
 * BQuest uses jQuery, licenced by the jQuery Fundation
 * under the MIT Licence (see https://jquery.org/license/)
 * 
 * Please notice that only the game engine is in public domain.
 * Game data (pictures, stories, texts and more) are subject to their
 * own licence which may differ.
 */

// Game variables
/////////////////
var game;
var i18n = {};
var inventory = {};
var objects = [];
var stat_values = {};
var stat_base_values = {};
var stat_max_values = {};
var categories = {};
var flags = {};
var images = {};
var image_flags = [];
var image_paths = [];
var image_save = {};
var image_save_full = {};
var canvas = document.createElement("canvas");
var canvas_context = canvas.getContext("2d");

var selected_player = "";
var selected_item = "";
var current_player = "";
var critical = false;

var players = {};
var enemies = {};
var nextenemy = 1;

var currentturn = 0;
var turnorder = [];

var current_state_index = 'start';
var current_state = null;
var current_action = null;
var current_fight = null;

var action_state = null;
var PICK_ACTION = 0;
var PICK_TARGET = 1;
var WILDCARD = "*";

var action_picked = null;
var ACTION_MAP = "_map_item_clicked";
var ACTION_DECISION = "_decision_item_clicked";
var targets_picked = [];
var backlog = "";
var backlog2 = "";

var defeat = false;
var victory = false;
//Default data
//////////////

var stats = {
	'incapacitated':{
		'name':'Incapacitated',
		'name_short':'Incapacitated',
		'additive':false,
		'nomod':true,
		'column':'status',
		'width':100,
		'bar':'autofail.png',
		'bar_negative':'autofail.png',
	},
	'helpless':{
		'name':'Helpless',
		'name_short':'Helpless',
		'additive':false,
		'nomod':true,
		'column':'status',
		'width':100,
		'bar':'autofail.png',
		'bar_negative':'autofail.png',
	},
	'stunned':{
		'name':'Stunned',
		'name_short':'Stun',
		'additive':false,
		'nomod':true,
		'column':'status',
		'width':100,
		'bar':'autofail.png',
		'bar_negative':'autofail.png',
	},
	'immobilized':{
		'name':'Immobilized',
		'name_short':'Immob',
		'additive':false,
		'nomod':true,
		'column':'status',
		'width':100,
		'bar':'autofail.png',
		'bar_negative':'autofail.png',
	},
	'gagged':{
		'name':'Gagged',
		'name_short':'Gagged',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'spellhit':-2},
			{'spellhit':-4},
			{'spellhit':-99},
			{'spellhit':-99, 'escape':-1},
		]
	},
	'blinded':{
		'name':'Blinded',
		'name_short':'Blinded',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'hit':-1},
			{'hit':-2},
			{'hit':-3, 'defense':-1},
			{'hit':-4, 'defense':-2},
		]
	},
	'bound':{
		'name':'Bound',
		'name_short':'Bound',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'physhit':-2},
			{'physhit':-4},
			{'physhit':-99},
			{'physhit':-99, 'escape':-1},
		]
	},
	'hobbled':{
		'name':'Hobbled',
		'name_short':'Hobbled',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'defense':-1, 'traps':-1},
			{'defense':-2, 'traps':-2},
			{'defense':-3, 'traps':-3},
			{'defense':-4, 'traps':-4},
		]
	},
	'submissive':{
		'name':'Submissive',
		'name_short':'Submissive',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'willpower':-1, 'enemyeffect':2},
			{'willpower':-2, 'enemyeffect':4},
			{'willpower':-3, 'enemyeffect':6},
			{'willpower':-4, 'enemyeffect':8},
		]
	},
	'breathless':{
		'name':'Breathless',
		'name_short':'Breathless',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'defense':-1},
			{'defense':-2},
			{'defense':-3},
			{'defense':-4},
		]
	},
	'vibrating':{
		'name':'Vibrating',
		'name_short':'Vibrating',
		'additive':false,
		'column':'status',
		'width':20,
		'bar':'status.png',
		'bar_negative':'autofail.png',
		'effects':[
			{},
			{'escape':-1},
			{'escape':-2},
			{'escape':-3},
			{'escape':-4},
		]
	},
	'ribbon':{
		'name':'Ribbon Power',
		'name_short':'Ribbon',
		'additive':true,
		'reset':false,
		'column':'combat',
		'width':5,
		'bar':'ribbon.png',
		'bar_negative':'',
	},
	'mana':{
		'name':'Mana',
		'name_short':'Mana',
		'additive':true,
		'reset':false,
		'column':'combat',
		'width':10,
		'bar':'mana.png',
		'bar_negative':'',
	},
	'gungnir':{
		'name':'Gungnir',
		'name_short':'CD',
		'additive':true,
		'column':'combat',
		'width':12,
		'bar':'spear.png',
		'bar_negative':'spear_broken.png',
	},
	'tyrfing':{
		'name':'Tyrfing',
		'name_short':'CD',
		'additive':true,
		'column':'combat',
		'width':12,
		'bar':'sword.png',
		'bar_negative':'sword_broken.png',
	},
	'mjolnir':{
		'name':'Mjolnir',
		'name_short':'CD',
		'additive':true,
		'column':'combat',
		'width':12,
		'bar':'hammer.png',
		'bar_negative':'hammer_broken.png',
	},
	'defense':{
		'name':'Defense',
		'name_short':'Def',
		'additive':true,
		'column':'combat',
		'width':5,
		'enemy':true,
		'bar':'defense.png',
		'bar_negative':'',
	},
	'physhit':{
		'name':'Physical Hit',
		'name_short':'P.Hit',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'bar':'positive.png',
		'bar_negative':'negative.png',
		'bar_extreme':'autofail.png',
	},
	'spellhit':{
		'name':'Spell Hit',
		'name_short':'S.Hit',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'bar':'positive.png',
		'bar_negative':'negative.png',
		'bar_extreme':'autofail.png',
	},
	'escape':{
		'name':'Escape',
		'name_short':'Esc',
		'additive':true,
		'column':'combat',
		'width':10,
		'bar':'positive.png',
		'bar_negative':'negative.png',
	},
	'willpower':{
		'name':'Willpower',
		'name_short':'Will',
		'additive':true,
		'column':'combat',
		'width':10,
		'bar':'positive.png',
		'bar_negative':'negative.png',
	},
	'traps':{
		'name':'Traps',
		'name_short':'Trap',
		'additive':true,
		'column':'combat',
		'width':10,
		'bar':'positive.png',
		'bar_negative':'negative.png',
	},
	'enemyeffect':{
		'name':'Enemy Effect',
		'name_short':'E.Eff',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'bar':'positive.png',
		'bar_negative':'negative.png',
	},
	'hit':{
		'name':'Hit',
		'name_short':'Hit',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'hidden':true,
		'add_to':['physhit','spellhit'],
		'bar':'positive.png',
		'bar_negative':'negative.png',
		'bar_extreme':'autofail.png',
	},
	'effect':{
		'name':'Effect',
		'name_short':'Eff',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'bar':'positive.png',
		'bar_negative':'negative.png',
	},
	'roll':{
		'name':'Contested Roll',
		'name_short':'Roll',
		'additive':true,
		'column':'combat',
		'width':10,
		'enemy':true,
		'bar':'positive.png',
		'bar_negative':'negative.png',
		'bar_extreme':'autofail.png',
	},
	
};

var escape_table = {
	'easy': {'fail':3,'auto':6,'free':20}, 
	'medium': {'fail':6,'-1':14,'free':20}, 
	'hard': {'fail':9,'-1':13,'-2':17,'-3':20},
	'extreme': {'fail':13,'-1':16,'-2':18,'-3':20}, 
	'impossible': {'fail':16,'-1':18,'-2':20},
};

var actions = [
	{ 'code': 'examine', 'targets': 1},
	{ 'code': 'escape', 'targets': 1},
	{ 'code': 'movement', 'targets': 0},
	{ 'code': 'endturn', 'targets': 0},
	{ 'code': 'attack', 'targets': 2, 'hidden':true},
	{ 'code': 'extra', 'targets': 2, 'hidden':true},
];

var default_actions = [
		{'action': ['movement'], 'result':{'swap_movement':''}},
		{'action': ['endturn'], 'result':{'end_turn':''}},
		{'action': ['escape', "*"], 'result':{'escape':''}},
		{'action': ['examine', "*"], 'result':{'examine':''}},
];


// General tools
////////////////

String.prototype.format = function (args) {
	var str = this;
	return str.replace(String.prototype.format.regex, function(item) {
		var intVal = parseInt(item.substring(1, item.length - 1));
		var replace;
		if (intVal >= 0) {
			replace = args[intVal];
		} else if (intVal === -1) {
			replace = "{";
		} else if (intVal === -2) {
			replace = "}";
		} else {
			replace = "";
		}
		return replace;
	});
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

function _get( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results === null )
    return null;
  else
    return results[1];
}

function isDefined(varName) {
	return typeof(window[varName]) != "undefined";
}

function escHtml(string) {
	return string;
}
function escAttr(string) {
	return string;
}
function escUrl(string) {
	return string;
}
/** Escape string to include it in javascript code, surrounded by ' '
 * and by " " for html element. */
function escJs(string) {
	var esc = string.replace(new RegExp("'", 'g'), "\\'");
	esc = esc.replace(new RegExp("\"", 'g'), "&quot;");
	return esc;
}

function translate(string, array) {
	if (string in i18n) {
		if (Array.isArray(array)) {
			for (var i = 0; i < array.length; i++) {
				array[i] = translate(array[i]);
			}
			return i18n[string].format(array);
		} else {
			return i18n[string];
		}
	}
	return string;
}

function diceRoll(dice, reason, _critical) {
	critical = false;
	var dicestring = "";
	dicestring += "<div>" + escHtml(reason) + ": ";
	var totalroll = 0;
	var first = true;
	var temproll;
	var i;
	if ('d4' in dice) {
		first = false;
		dicestring += "<span style=\"color: #22B14C\">" + dice['d4'] + "d4</span>";
		temproll = 0;
		for (i = 0; i < dice['d4']; i++) {
			temproll += Math.ceil(Math.random()*4);
		}
		dicestring += "<span style=\"font-weight: bold;\"> (" + temproll + ")</span>";
		totalroll += temproll;
	}
	if ('d6' in dice) {
		if (first) 
			first = false;
		else 
			dicestring += " + ";
		
		dicestring += "<span style=\"color: #22B14C\">" + dice['d6'] + "d6</span>";
		temproll = 0;
		for (i = 0; i < dice['d6']; i++) {
			temproll += Math.ceil(Math.random()*6);
		}
		dicestring += "<span style=\"font-weight: bold;\"> (" + temproll + ")</span>";
		totalroll += temproll;
	}
	if ('d20' in dice) {
		if (first) 
			first = false;
		else 
			dicestring += " + ";
		
		dicestring += "<span style=\"color: #22B14C\">" + dice['d20'] + "d20</span>";
		temproll = 0;
		for (i = 0; i < dice['d20']; i++) {
			temproll += Math.ceil(Math.random()*20);
		}
		if (temproll == 20 * dice['d20'])
			critical = true;
		dicestring += "<span style=\"font-weight: bold;\"> (" + temproll + ")</span>";
		totalroll += temproll;
	}
	if ('base' in dice && dice['base'] !== 0) {
		if (first) 
			first = false;
		else {	
			if (dice['base'] > 0)
				dicestring += " + ";
			else 
				dicestring += " - ";				
		}
		dicestring += "<span style=\"color: #22B14C\">" + Math.abs(dice['base']) + "</span>";
		totalroll += dice['base'];
	}
	if (_critical) {
		if (first) 
			first = false;
		else 
			dicestring += " + ";
		
		dicestring += "<span style=\"font-weight: bold; color: red\">1d6</span>";
		temproll = Math.ceil(Math.random()*6);
		dicestring += "<span style=\"font-weight: bold;\"> (<span style=\"color: red\">" + temproll + "</span>)</span>";
		totalroll += temproll;
	}
	dicestring += " = <span style=\"font-weight: bold; color: #ED1C34\"> " + totalroll + "</span>";
	if (critical)
		dicestring += "<span style=\"font-weight: bold; color: red\"> CRIT!</span>";
	dicestring += "</div>";
	var div = jQuery("#rolls-text");
	div.append(dicestring);
	div.scrollTop(div.prop('scrollHeight'));
	return totalroll;
}


function damageString(damage, targets) {
	var damagestring = "<span style=\"font-weight: bold;\">";
	var first = true;
	if ('d4' in damage) {
		if (first) {
			damagestring += " (";
			first = false;
		} else {
			damagestring += "+";
		}
		damagestring += "<span style=\"color: #22B14C\">" + damage['d4'] + "d4</span>";
	}
	if ('d6' in damage) {
		if (first) {
			damagestring += " (";
			first = false;
		} else {
			damagestring += "+";
		}
		damagestring += "<span style=\"color: #22B14C\">" + damage['d6'] + "d6</span>";
	}
	if ('base' in damage) {
		if (first) {
			damagestring += " (";
			first = false;
		} else {
			damagestring += "+";
		}
		damagestring += "<span style=\"color: #22B14C\">" + damage['base'] + "</span>";
	}
	if (!first) 
		damagestring += ")";
	if (targets > 1)
		damagestring += " x" + targets;
	if (damage['mana'] < 0)
		damagestring += " (<span style=\"color: #E04060\">" + damage['mana'] + " Mana</span>)";
	if (damage['mana'] > 0)
		damagestring += " (<span style=\"color: #40A0B0\">" + damage['mana'] + " Mana</span>)";
	if (damage['hits'] > 1)
		damagestring += " x" + damage['hits'];
	if (damage['hit'] < 0)
		damagestring += " (<span style=\"color: #E04060\">Hit" + damage['hit'] + "</span>)";
	if (damage['hit'] > 0)
		damagestring += " (<span style=\"color: #22B14C\">Hit+" + damage['hit'] + "</span>)";
	if (damage['defense'] < 0)
		damagestring += " (<span style=\"color: #E04060\">Def" + damage['defense'] + "</span>)";
	if (damage['defense'] > 0)
		damagestring += " (<span style=\"color: #22B14C\">Def+" + damage['defense'] + "</span>)";
	if (damage['escape'] < 0)
		damagestring += " (<span style=\"color: #E04060\">Esc" + damage['escape'] + "</span>)";
	if (damage['escape'] > 0)
		damagestring += " (<span style=\"color: #22B14C\">Esc+" + damage['escape'] + "</span>)";
	if (damage['ribbon'] < 0)
		damagestring += " (<span style=\"color: #B0B3FF\">Rbn" + damage['ribbon'] + "</span>)";
	if (damage['ribbon'] > 0)
		damagestring += " (<span style=\"color: #FFADC9\">Rbn+" + damage['ribbon'] + "</span>)";
	damagestring += "</span>";
	
	return damagestring;
}

function statString(player, item, type) {
	var statstring = "";
	var _stat;
	if (type == 'title')
		return statstring;
	var effects;
	if (type == 'attack') {
		effects = classes[players[player]['class']]['attacks'][item];
		if ('damage' in effects)
			statstring += damageString(effects['damage'], effects['targets']);
	}
	if (type == 'buff')
		effects = players[player]['buffs'][item];
	if (type == 'item') {
		var tier = "";
		if (players[player]['bindings'][item]['level'] <= 1)
			tier = 'easy';
		else if (players[player]['bindings'][item]['level'] <= 2)
			tier = 'medium';
		else if (players[player]['bindings'][item]['level'] <= 4)
			tier = 'hard';
		else if (players[player]['bindings'][item]['level'] <= 7)
			tier = 'extreme';
		else 
			tier = 'impossible';
		effects = bindings[item][tier];
	}
	if (type == 'enebuff')
		effects = enemies[player]['buffs'][item];
	
	for (_stat in stats) {
		if (_stat in effects) {
			if (effects[_stat] > 0) {
				if (stats[_stat]['nomod'] === true)
					statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #ED1C34\">" + stats[_stat]['name_short'] + "</span>)</span>";
				else
					statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #22B14C\">" + stats[_stat]['name_short'] + "+" + effects[_stat] + "</span>)</span>";					
			} else if (effects[_stat] < 0) {
				statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #ED1C34\">" + stats[_stat]['name_short'] + "" + effects[_stat] + "</span>)</span>";
			}
		}
	}

	if ((type == 'buff' || type == 'enebuff')&& 'duration' in effects) {
		if (effects['duration'] == 1)
			statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #ED1C34\">1 Rd</span>)</span>";
		if (effects['duration'] == 2)
			statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #FFF200\">2 Rds</span>)</span>";
		if (effects['duration'] > 2)
			statstring += "<span style=\"font-weight: bold;\"> (<span style=\"color: #22B14C\">" + effects['duration'] + " Rds</span>)</span>";
	}
	
	return statstring;
}

function showTextResult(textResult) {
	var title = null;
	if (action_picked == ACTION_DECISION) {
		title = translate(current_state['decisions'][target_picked]['decision']);
	} else if (action_picked != ACTION_MAP) {
		// Get the title on regular command (shows the command itself)
		var i18n = "_pick_target_" + action_picked['targets'] + "_completed";
		var i18n_args = [];
		i18n_args.push(translate(action_picked['code']));
		for (var i = 0; i < action_picked['targets']; i++) {
			if (i >= targets_picked.length)
				i18n_args.push('');
			else
				i18n_args.push(targets_picked[i]);
		}
		// Look for alternate linker word in picked action
		if ('linker' in action_picked) {
			i18n_args.push(translate(action_picked['linker']));
		} else {
			// Put default linker word
			i18n_args.push(translate('_pick_target_linker'));
		}
		title = translate(i18n, i18n_args);
	}
	
	showResult(textResult, title);
}

/** Show result popup with message and optionnal title */
function showResult(string, title) {
	switch (arguments.length) {
	case 1:
		title = null;
	}
	var result = null;
	if (Array.isArray(string)) {
		result = "";
		for (var i = 0; i < string.length; i++) {
			result += "<p>" + escHtml(translate(string[i])) + "</p>";
		}
	} else {
		result = "<p>" + escHtml(translate(string)) + "</p>";
	}
	var res = jQuery("#result");
	res.removeClass("result-hidden");
	res.addClass("result-shown");
	html = "";
	if (title !== null) {
		html += "<div class=\"title\">" + escHtml(title) + "</div>";
	}
	html += "<div>" + result + "</div><div id=\"click-to-close\">" + escHtml(translate("_click_to_close")) + "</div>";
	res.html(html);
}
/** Hide result popup */
function closeResult() {
	var res = jQuery("#result");
	res.addClass("result-hidden");
	res.removeClass("result-shown");
	res.html("");
}

function sendEvent(string, bold) {
	var div = jQuery("#description-text");
	if (bold) {
		div.append("<span style='font-weight:bold;'>" + string + "</span>");
		backlog += "<span style='font-weight:bold;'>" + string + "</span>";
	} else {
		div.append("<span>" + string + "</span>");	
		backlog += "<span>" + string + "</span>";
	}
	div.scrollTop(div.prop('scrollHeight'));
}

// Game functions
/////////////////

/** Set an item in given inventory location and update display */
function setItem(player, item, level) {
	players[player]['bindings'][item]['level'] = level;
	if (level > players[player]['bindings'][item]['maxlevel'])
		players[player]['bindings'][item]['maxlevel'] = level;
	players[player]['bindings'][item]['autoescape'] = false;
	var _span = jQuery("#bindings-" + player + " li#item-" + escAttr(item));
	_span.html("<div class=\"location\">" + escHtml(bindings[item]['location']) + "<div class=\"bar\">&nbsp;</div></div>");
	_span.append("<div class=\"effects\"></div>");
	_span.append("<div class=\"item\"></div>");
	_span = jQuery("#bindings-" + player + " li#item-" + escAttr(item) + " .location .bar");
	var _src = "./core/images/bindings.png";
	_span.append("<div style=\"z-index:1; position: absolute; top: 0; left: 0; height:18px; width:" + Math.min(101,Math.abs(level*10+1)) + "px; background:url('" + _src + "') 0 0;\"></div>");
	_src = "./core/images/background.png";
	_span.append("<div style=\"z-index:0; position: absolute; top: 0; left: 0; height:18px; width:" + Math.min(101,Math.abs(players[player]['bindings'][item]['maxlevel']*10+1)) + "px; background:url('" + _src + "') 0 0;\"></div>");
	// Add to inventory
	var tier = "";
	if (players[player]['bindings'][item]['level'] <= 1)
		tier = 'easy';
	else if (players[player]['bindings'][item]['level'] <= 2)
		tier = 'medium';
	else if (players[player]['bindings'][item]['level'] <= 4)
		tier = 'hard';
	else if (players[player]['bindings'][item]['level'] <= 7)
		tier = 'extreme';
	else 
		tier = 'impossible';
	
	// Display
	_span = jQuery("#bindings-" + player + " li#item-" + escAttr(item) + " .item");
	_span.html("<span class='glowing'>" + escHtml(bindings[item][tier]['desc']) + "</span>");
	_span = jQuery("#bindings-" + player + " li#item-" + escAttr(item) + " .effects");
	_span.html(statString(player, item, 'item'));
	setTimeout(function(){
		var tempspan = jQuery("#bindings-" + player + " li#item-" + escAttr(item) + " .item .glowing");
		tempspan.removeClass('glowing');
		tempspan.addClass('notglowing');				
		setTimeout(function(){
			var tempspan = jQuery("#bindings-" + player + " li#item-" + escAttr(item) + " .item .notglowing");
			tempspan.removeAttr('style');
			tempspan.removeClass('notglowing');
		},2000);
	},3000);
	recalculateStats(player);
}

function addItem(player, item, level) {
	jQuery("#none-" + player).remove();
	jQuery("#bindings-" + player + " li#item-" + escAttr(item)).remove();
	jQuery("#bindings-" + player).append("<li id=\"item-" + escAttr(item) + "\" onclick=\"javascript:bindingPicked('" + escJs(player) + "','" + escJs(item) + "');\"></li>");
	players[player]['bindings'][item] = {};
	players[player]['bindings'][item]['level'] = level;
	players[player]['bindings'][item]['maxlevel'] = level;
	setItem(player, item, level);
}

function removeItem(player, item) {
	if ('removecustom' in bindings[item])
		bindings[item].removecustom();
	jQuery("#bindings-" + player + " li#item-" + escAttr(item)).remove();
	delete players[player]['bindings'][item];
	if (Object.keys(players[player]['bindings']).length === 0) {
		jQuery("#bindings-" + player).append("<div id=\"none-" + escAttr(player) + "\">None!</div>");
	}
	recalculateStats(player);
}

function adjustItem(player, item, levels) {
	var currentlevel;
	if (item in players[player]['bindings']) {
		currentlevel = players[player]['bindings'][item]['level'];
		if (levels > 0) {
			if (currentlevel < 8)
				levels = Math.min(8-currentlevel, levels);
			else
				levels = 1;
		}
		currentlevel += levels;
		if (currentlevel > 10)
			currentlevel = 10;
		if (currentlevel > 0) {
			setItem(player, item, currentlevel);
		} else {
			removeItem(player, item);
		}
	} else if (levels > 0) {
		addItem(player, item, levels);
	}
	if (levels > 0) {
		if ('applycustom' in bindings[item])
			bindings[item].applycustom(player, item, levels);
	}

}

function totalItems(player) {
	var _total = 0;
	for (var _binding in players[player]['bindings'])
		_total += players[player]['bindings'][_binding]['level'];
	return _total;
}

function hasItem(player, item, level) {
	if (item in players[player]['bindings'] && players[player]['bindings'][item]['level'] >= level) {
		return true;
	}
	return false;
}

function getItemLevel(player, item) {
	if (item in players[player]['bindings']) {
		return players[player]['bindings'][item]['level'];
	}
	return 0;
}

function addBuff(player, name, buff) {
	players[player]['buffs'][name] = buff;
	recalculateStats(player);
}

function enemyBuff(enemy, name, buff) {
	enemies[enemy]['buffs'][name] = buff;
	recalculateEnemy(enemy);
}

function hasBuff(player, name) {
	if (name in players[player]['buffs']) {
		return true;
	}
	return false;
}

function removeBuff(player, name) {
	if (name in players[player]['buffs']) {
		delete players[player]['buffs'][name];
		recalculateStats(player);
	}
}

function removeEnemyBuff(enemy, name) {
	if (name in enemies[enemy]['buffs']) {
		delete enemies[enemy]['buffs'][name];
		recalculateEnemy(enemy);
	}
}

function addObject(player, item, name, type) {
	// Add object if not already in list
	if (objects.indexOf(item) != -1) {
		return;
	}
	objects.push(item);
	// Display
	var id = objects.indexOf(item);
	
	if (type == 'attack') {
		if (id === 0) {
			jQuery("#attacks").append("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:attackPicked('" + escJs(item) + "');\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		} else {
			jQuery("#object-" + escAttr(objects[id-1])).after("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:attackPicked('" + escJs(item) + "');\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		}
	} else 	if (type == 'extra') {
		if (id === 0) {
			jQuery("#attacks").append("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:extraPicked('" + escJs(item) + "');\">" + escHtml(name) + "</li>");
		} else {
			jQuery("#object-" + escAttr(objects[id-1])).after("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:extraPicked('" + escJs(item) + "');\">" + escHtml(name) + "</li>");
		}
	} else if (type == 'title') {
		if (id === 0) {
			jQuery("#attacks").append("\n<li class=\"object-title\" id=\"object-" + escAttr(item) + "\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		} else {
			jQuery("#object-" + escAttr(objects[id-1])).after("\n<li class=\"object-title\" id=\"object-" + escAttr(item) + "\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		}
		var tempspan = jQuery("#attacks li#object-" + escAttr(item));
		tempspan.addClass('object-title');
	} else {
		if (id === 0) {
			jQuery("#attacks").append("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:targetPicked('" + escJs(item) + "');\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		} else {
			jQuery("#object-" + escAttr(objects[id-1])).after("\n<li id=\"object-" + escAttr(item) + "\" onclick=\"javascript:targetPicked('" + escJs(item) + "');\">" + escHtml(name) + escHtml(statString(player, item, type)) + "</li>");
		}
	}
	
}

function removeObject(item) {
	var id = objects.indexOf(item);
	if (id != -1) {
		jQuery("#object-" + escAttr(item)).remove();
		objects.splice(id, 1);
		return;
	}
}

function hasObject(item) {
	if (objects.indexOf(item) == -1) {
		return false;
	}
	return true;
}

function expireBuffs(buffs) {
	var _buff;
	var _stat;
	for (_buff in buffs) {
		if ('custom' in buffs[_buff])
			buffs[_buff].custom();
		if ('duration' in buffs[_buff] && buffs[_buff]['duration'] != -1) {
			buffs[_buff]['duration']--;
			if (buffs[_buff]['duration'] === 0) {
				if (turnorder[currentturn]['type'] == 'player')
					removeBuff(turnorder[currentturn]['name'], _buff);
				else 
					removeEnemyBuff(turnorder[currentturn]['name'], _buff);
			}
		}
	}
	for (_stat in gamestats)
		if ('valuecustom' in gamestats[_stat])
			gamestats[_stat].valuecustom();
	recalculateEnvironment();
}

function freeEscape(player, number) {
	addBuff(player,'free-escape',{'name':'Free Escape <span style="color:red">x' + number + '</span>','number':number,'duration':1});
}

function nextTurn() {
	if (defeat) return;
	var _span;
	if (currentturn >= 0) {
		if (turnorder[currentturn]['type'] == 'player') {
			if (action_picked && action_picked['code'] == 'escape' && !hasBuff(turnorder[currentturn]['name'], 'free-escape') && hasBuff(turnorder[currentturn]['name'],'standing')) {
				if (players[turnorder[currentturn]['name']]['stats']['vibrating'] !== 0)
					sendEvent(players[turnorder[currentturn]['name']]['name'] + " could not get a Free Escape because she is vibrating!<br>");
				else
					freeEscape(turnorder[currentturn]['name'],1);
			}
			if (hasBuff(turnorder[currentturn]['name'],'free-escape') && players[turnorder[currentturn]['name']]['buffs']['free-escape']['number'] > 0) {
				showActions(turnorder[currentturn]['name']);
				drawOrder();
				return;
			}
			expireBuffs(players[turnorder[currentturn]['name']]['buffs']);
			recalculateStats(turnorder[currentturn]['name']);
			_span = jQuery("#status-title-" + turnorder[currentturn]['name']);
			_span.removeClass('title-highlight');
			_span.addClass('title');				
			_span = jQuery("#bindings-title-" + turnorder[currentturn]['name']);
			_span.removeClass('title-highlight');
			_span.addClass('title');				
		} else {
			expireBuffs(enemies[turnorder[currentturn]['name']]['buffs']);	
		}
	}
	currentturn++;
	if (currentturn >= turnorder.length) {
		currentturn = 0;
		var div = jQuery("#description-text");
		div.html(backlog2 + backlog);
		div.scrollTop(div.prop('scrollHeight'));
		backlog2 = backlog;
		backlog = "";
	}	
	drawOrder();
	if (turnorder[currentturn]['type'] == 'player') {
		if (players[turnorder[currentturn]['name']]['stats']['incapacitated'] > 0 || players[turnorder[currentturn]['name']]['stats']['helpless'] > 0) {
			clearActions();
			setTimeout(function(){
				nextTurn();
			},1000);
			return;
		}
		if (victory && !hasBuff(turnorder[currentturn]['name'], 'free-escape')) {
			setTimeout(function(){
				clearActions();
				setState(current_fight['next']);
			},3000);			
			return;
		}
		sendEvent("<span style=\"color:lightgreen\">------" + players[turnorder[currentturn]['name']]['name'] + "'s Turn------</span><br>");
		setMoving(turnorder[currentturn]['name']);
		showActions(turnorder[currentturn]['name']);
		_span = jQuery("#status-title-" + turnorder[currentturn]['name']);
		_span.removeClass('title');
		_span.addClass('title-highlight');				
		_span = jQuery("#bindings-title-" + turnorder[currentturn]['name']);
		_span.removeClass('title');
		_span.addClass('title-highlight');
	} else {
		if (victory) return;
		clearActions();
		setTimeout(function(){
			if (defeat) return;
			sendEvent("<span style=\"color:lightcoral\">------" + enemies[turnorder[currentturn]['name']]['name'] + "'s Turn------</span><br>");
			enemyAI(turnorder[currentturn]['name']);
			nextTurn();
		},1000);
	}
}

function escapeAttempt(item) {
	var _player = selected_player;
	var _item = selected_item;
	if (_item != item)
		return false;
	if (players[current_player]['stats']['stunned'] == 1) {
		showTextResult("You cannot do that while stunned!");
		return true;
	}
	if (_player != current_player && players[current_player]['stats']['bound'] >= 3) {
		showTextResult("You are too bound to help others escape!");
		return true;
	}
	if (hasBuff(current_player,'free-escape')) {
		players[current_player]['buffs']['free-escape']['number']--;
		players[current_player]['buffs']['free-escape']['name']='Free Escape <span style="color:red">x' + players[current_player]['buffs']['free-escape']['number'] + '</span>';
	}

		
	if (!victory && 'escapecheckcustom' in bindings[_item])
		_processed = bindings[_item].escapecheckcustom(_player,_item);
	if (_processed) {
		return true;
	}

	if (!victory && 'trap' in current_fight && !hasBuff(current_player,'standing')) {
		if (current_fight.trap(current_player)) {
			return;
		}
	}

	var tier = "";
	if (players[_player]['bindings'][_item]['level'] <= 1)
		tier = 'easy';
	else if (players[_player]['bindings'][_item]['level'] <= 2)
		tier = 'medium';
	else if (players[_player]['bindings'][_item]['level'] <= 4)
		tier = 'hard';
	else if (players[_player]['bindings'][_item]['level'] <= 7)
		tier = 'extreme';
	else 
		tier = 'impossible';
	var _table = escape_table[tier];
	var _modifier = 0;
	if ('escape' in players[current_player]['stats'])
		_modifier += players[current_player]['stats']['escape'];
	if (_player != current_player) {
		_modifier += 4;
		sendEvent(players[current_player]['name'] + " is attempting to help " + players[_player]['name'] + " escape their " + bindings[_item]['location'] + " binding...");

	} else {
		sendEvent(players[current_player]['name'] + " is attempting escape their " + bindings[_item]['location'] + " binding...", false);
	}
	
	if (players[_player]['bindings'][_item]['autoescape'] === true) {
		sendEvent("and succeeds!<br>", true);
		removeItem(_player,_item);
		nextTurn();
		return true;
	}
	
	var _roll = diceRoll({'d20':1,'base':_modifier}, "Escape Roll [" + bindings[_item]['location'] + "]");
	if (_roll > 20)
		_roll = 20;
	var _processed = false;
	if (!victory && 'escapecustom' in bindings[_item])
		_processed = bindings[_item].escapecustom(_player,_item,_roll,_table);
	if (_processed) {
		nextTurn();
		return true;
	}
	if ('fail' in _table && _roll <= _table['fail']) {
		sendEvent("but fails!<br>", true);
	} else if('auto' in _table && _roll <= _table['auto']) {
		sendEvent("and will succeed automatically on their next attempt.<br>", true);
		players[_player]['bindings'][_item]['autoescape'] = true;
	} else if('-1' in _table && _roll <= _table['-1']) {
		sendEvent("and manages to lower it by one level!<br>", true);
		adjustItem(_player,_item,-1);
	} else if('-2' in _table && _roll <= _table['-2']) {
		sendEvent("and manages to lower it by two levels!<br>", true);
		adjustItem(_player,_item,-2);
	} else if('-3' in _table && _roll <= _table['-3']) {
		sendEvent("and manages to lower it by three levels!<br>", true);
		adjustItem(_player,_item,-3);
	} else if('free' in _table && _roll <= _table['free']) {
		sendEvent("and succeeds!<br>", true);
		removeItem(_player,_item);
	}
	nextTurn();
	return true;
}

function attackAttempt(player) {
	action_state = PICK_ACTION;
	jQuery(".targetted").removeClass('targetted');
	target_picked = [];
	updateNotification();
	var handled = false;
	var attack;	
	var i;
	if (targets_picked[0] in extraactions) {
		attack = extraactions[targets_picked[0]];
	} else {
		attack = classes[players[player]['class']]['attacks'][targets_picked[0]];
	}
	if (attack['type'] == 'spell') {
		if (players[player]['stats']['spellhit'] < -19) {
			showTextResult("You are too bound to cast this spell!");
			return false;
		}
	} else if  (attack['type'] == 'physical') {
		if (players[player]['stats']['physhit'] < -19) {
			showTextResult("You are too bound to use this attack!");
			return false;
		}
	}
	if (attack['target'] == 'enemy') {
		var targetted = {};
		for (i = 1; i <= attack['targets']; i++) {
			if (targets_picked[i] in targetted) {
				showTextResult("Cannot target the same enemy twice.");
				return false;
			}
			targetted[targets_picked[i]] = true;
			if (!(targets_picked[i] in enemies)) {
				showTextResult("This attack only works on enemies.");
				return false;
			}
		}
		if ('damage' in attack) {
			if(attack['damage']['mana'] < 0) {
				if (players[player]['stats']['mana'] < Math.abs(attack['damage']['mana'])) {
					showTextResult("You do not have enough mana to cast this spell!");
					return false;
				} else {
					players[player]['stats']['mana'] += attack['damage']['mana'];
				}
			}
			if(attack['damage']['ribbon'] < 0) {
				if (players[player]['stats']['ribbon'] < Math.abs(attack['damage']['ribbon'])) {
					showTextResult("You do not have enough ribbon power to cast this spell!");
					return false;
				} else {
					players[player]['stats']['ribbon'] += attack['damage']['ribbon'];
				}
			}
		}
		if ('trap' in current_fight && attack['notrap'] !== true && !hasBuff(player,'standing')) {
			if (current_fight.trap(player)) {
				return;
			}
		}
		sendEvent(players[player]['name'] + " uses " + attack['name'] + "!<br>");
		if ('custom' in attack) {
			handled = attack.custom(player);
		}
		if (!handled) {
			for (i = 1; i < targets_picked.length; i++) {
				if (!(targets_picked[i] in enemies))
					continue;
				sendEvent("&nbsp;&nbsp;&nbsp;" + attack['name'] + " attacks " + enemies[targets_picked[i]]['name'] + "...");
				var _roll;
				if (attack['type'] == 'physical') {
					_roll = diceRoll({'base':players[player]['stats']['physhit'] + ('hit' in attack['damage']?attack['damage']['hit'] : 0), 'd20':1}, attack[	'name'] + " [Hit]");
				} else {
					_roll = diceRoll({'base':players[player]['stats']['spellhit'] + ('hit' in attack['damage']?attack['damage']['hit'] : 0), 'd20':1}, attack['name'] + " [Hit]");
				}
				if (_roll >= enemies[targets_picked[i]]['stats']['defense']) {
					var _critical = critical;
					var _damage = diceRoll(attack['damage'], attack['name'] + " [Damage]", _critical);
					if (_critical)
						sendEvent("and <span style=\"color:red\">CRITS</span>, dealing <span style=\"color:red\">" + _damage + "</span> damage!<br>", true);
					else
						sendEvent("and hits, dealing <span style=\"color:red\">" + _damage + "</span> damage!<br>", true);
					if ('hitcustom' in attack) {
						attack.hitcustom(player, targets_picked[i]);
					}
					damageEnemy(targets_picked[i], _damage);
				} else {
					sendEvent("but misses!<br>", true);
				}	
			}
		}
	} else if (attack['target'] == 'ally') {
		for (i = 1; i <= attack['targets']; i++) {
			if (!(targets_picked[i] in players)) {
				showTextResult("This attack only works on allies");
				return false;
			}
		}
		if ('damage' in attack) {
			if(attack['damage']['mana'] < 0) {
				if (players[player]['stats']['mana'] < Math.abs(attack['damage']['mana'])) {
					showTextResult("You do not have enough mana to cast this spell!");
					return false;
				} else {
					players[player]['stats']['mana'] += attack['damage']['mana'];
				}
			}
			if(attack['damage']['ribbon'] < 0) {
				if (players[player]['stats']['ribbon'] < Math.abs(attack['damage']['ribbon'])) {
					showTextResult("You do not have enough ribbon power to cast this spell!");
					return false;
				} else {
					players[player]['stats']['ribbon'] += attack['damage']['ribbon'];
				}
			}
		}
		if ('trap' in current_fight && attack['notrap'] !== true && !hasBuff(player,'standing')) {
			if (current_fight.trap(player)) {
				return;
			}
		}
		sendEvent(players[player]['name'] + " uses " + attack['name'] + "!<br>");
		if ('custom' in attack) {
			handled = attack.custom(player);
		}
	} else if (attack['target'] == 'binding') {
		for (i = 1; i <= attack['targets']; i++) {
			if (!(hasItem(selected_player, selected_item, 0))) {
				showTextResult("This attack only works on bindings");
				return false;
			}
		}
		if ('damage' in attack) {
			if(attack['damage']['mana'] < 0) {
				if (players[player]['stats']['mana'] < Math.abs(attack['damage']['mana'])) {
					showTextResult("You do not have enough mana to cast this spell!");
					return false;
				} else {
					players[player]['stats']['mana'] += attack['damage']['mana'];
				}
			}
			if(attack['damage']['ribbon'] < 0) {
				if (players[player]['stats']['ribbon'] < Math.abs(attack['damage']['ribbon'])) {
					showTextResult("You do not have enough ribbon power to cast this spell!");
					return false;
				} else {
					players[player]['stats']['ribbon'] += attack['damage']['ribbon'];
				}
			}
		}
		if ('trap' in current_fight && attack['notrap'] !== true && !hasBuff(player,'standing')) {
			if (current_fight.trap(player)) {
				return;
			}
		}
		if ('custom' in attack) {
			handled = attack.custom(player);
		}
	}
	if (!handled)
		nextTurn();
}

function damageEnemy(enemy, damage) {
	var handled = false;
	if ('damagecustom' in enemytypes[enemies[enemy]['type']]) {
		handled = enemytypes[enemies[enemy]['type']].damagecustom(enemy, damage);
	}
	if (!handled) {
		enemies[enemy]['hp'] -= damage;
		if (enemies[enemy]['hp'] < 0)
			enemies[enemy]['hp'] = 0;

		if (enemies[enemy]['hp'] === 0) {
			if('deathcustom' in enemytypes[enemies[enemy]['type']]) {
				enemytypes[enemies[enemy]['type']].deathcustom(enemy);
			} else {
				sendEvent(enemies[enemy]['name'] + " is defeated!<br>", true);
			}
			delete enemies[enemy];
			for (var i = 0; i < turnorder.length; i++) {
				if (turnorder[i]['name'] == enemy) {
					if (currentturn >= i)
						currentturn--;
					turnorder.splice(i, 1);
				}
			}
			if (Object.keys(enemies).length === 0) {
				sendEvent("------------------------------------------------------------------------------------<br>", true);
				sendEvent("---------------------------The party is victorious!----------------------------<br>", true);
				if ('reward' in current_fight)
					sendEvent("------------------As a reward, your bindings are reduced.----------------<br>",true);
				sendEvent("------------------------------------------------------------------------------------<br>", true);
				victory = true;
				if ('reward' in current_fight)
					for (var _player in players) 
						for (var _binding in players[_player]['bindings'])
							adjustItem(_player,_binding,-1 * current_fight['reward']);
			}
		}
	}
}

function enemyAI(enemy) {
	if (defeat) return;
	if ('ai' in enemytypes[enemies[enemy]['type']])
		enemytypes[enemies[enemy]['type']].ai(enemy);
}

function enemyAttack(enemy, target, attack) {
	var _critical = false;
	var _player;
	var _roll;
	var _effect;
	var _damage;
	var _type;
	var i;
	var handled = false;
	if ('custom' in attack) {
		handled = attack.custom(enemy, target);
	}
	if (!handled) {
		if (attack['targets'] == 'single') {
			sendEvent(enemies[enemy]['name'] + " attacks " + players[target]['name'] + " with " + attack['name'] + "...");
			_roll = diceRoll({'base':enemies[enemy]['stats']['hit'], 'd20':1}, attack['name'] + " [Hit]");
			if (critical) _critical = true;
			if (_roll >= players[target]['stats']['defense']) {
				_effect = diceRoll({'base':enemies[enemy]['stats']['effect'] + players[target]['stats']['enemyeffect'], 'd20':1}, attack['name'] + " [Effect]");
				if (_effect > 20)
					_effect = 20;
				_damage = 0;
				for (i = 0; i < attack['effects'].length; i++) {
					if (_effect <= attack['effects'][i]['roll']) {
						if (_critical) {
							if (i < attack['effects'].length - 1)
								_damage = attack['effects'][i+1]['damage'];
							else
								_damage = attack['effects'][i]['damage'] + 1;
						} else {
							_damage = attack['effects'][i]['damage'];
						}
						break;
					}
				}
				var _targets = [];
				for (var i = 0; i < attack['effectstypes'].length; i++) {
					if (!(attack['effectstypes'][i] in players[target]['bindings']) || players[target]['bindings'][attack['effectstypes'][i]]['level'] < 8)
						_targets.push(attack['effectstypes'][i]);
				}
				if (_targets.length > 0) {
					_type = _targets[Math.floor(_targets.length * Math.random())];
				} else {
					_type = attack['effectstypes'][Math.floor(attack['effectstypes'].length * Math.random())];
				}
				if (_critical)
					sendEvent("and <span style=\"color:red\">CRITs</span>, applying " + _damage + " levels of " + bindings[_type]['location'] + " bondage!<br>", true);
				else
					sendEvent("and hits, applying <span style=\"color:red\">" + _damage + "</span> levels of " + bindings[_type]['location'] + " bondage!<br>", true);
				
				if (players[target]['stats']['ribbon'] > 3 && _damage > 1) {
					players[target]['stats']['ribbon'] -= 3;
					sendEvent("<span style=\"color:pink\">Your ribbon power reduces the power of the enemy attack, lowering it by one level!</span><br>");
					_damage--;
				}
				adjustItem(target, _type, _damage);
			} else {
				sendEvent("but misses!<br>", true);
			}	
		} else {
			for (_player in players) {
				sendEvent(attack['name'] + " attacks " + players[_player]['name'] + "...");
				_roll = diceRoll({'base':enemies[enemy]['stats']['hit'], 'd20':1}, attack['name'] + " [Hit]");
				if (critical) _critical = true;
				if (_roll >= players[_player]['stats']['defense']) {
					_effect = diceRoll({'base':enemies[enemy]['stats']['effect'] + players[_player]['stats']['enemyeffect'], 'd20':1}, attack['name'] + " [Effect]");
					if (_effect > 20)
						_effect = 20;
					_damage = 0;
					for (i = 0; i < attack['effects'].length; i++) {
						if (_effect <= attack['effects'][i]['roll']) {
							if (_critical) {
								if (i < attack['effects'].length - 1)
									_damage = attack['effects'][i+1]['damage'];
								else
									_damage = attack['effects'][i]['damage'] + 1;
							} else {
								_damage = attack['effects'][i]['damage'];
							}
							break;
						}
					}
					_type = attack['effectstypes'][Math.floor(attack['effectstypes'].length * Math.random())];
					if (_critical)
						sendEvent("and <span style=\"color:red\">CRITs, applying " + _damage + " levels of " + bindings[_type]['location'] + " bondage!</span><br>", true);
					else
						sendEvent("and hits, applying <span style=\"color:red\">" + _damage + "</span> levels of " + bindings[_type]['location'] + " bondage!<br>", true);
					adjustItem(_player, _type, _damage);
				} else {
					sendEvent("but misses!<br>", true);
				}	
			}
		}
	}
}	

function attackPicked(target_code) {
	if (action_state == PICK_TARGET && action_picked['code'] != 'attack') {
		targetPicked(target_code);
	} else {
		actionPicked('attack');
		jQuery("#object-" + target_code).addClass('targetted');
		targetPicked(target_code);
	}
}
function extraPicked(target_code) {
	if (action_state == PICK_TARGET) {
		targetPicked(target_code);
	} else {
		actionPicked('extra');
		jQuery("#object-" + target_code).addClass('targetted');
		targetPicked(target_code);
	}
}
/** Clicked on an action, if action is not already picked pick it
 * and expect a target. Otherwise reset action picking with new one. */
function actionPicked(action_code) {
	if (currentturn >= turnorder.length)
		return;
	if (turnorder[currentturn]['name'] != current_player)
		return;
	var my_action = null;
	var action;
	// Get action object from action code
	for (var i = 0; i < actions.length; i++) {
		action = actions[i];
		if (action['code'] == action_code) {
			my_action = action;
			break;
		}
	}
	if (my_action !== null) {
		// No state check as picking resets the automat
		action_picked = my_action;
		jQuery(".targetted").removeClass('targetted');
		targets_picked = [];
		if (my_action['targets'] === 0) {
			// Action is not expecting target, proceed it
			var _actions = default_actions.concat(current_state['actions']);
			for (i = 0; i < _actions.length; i++) {
				action = _actions[i]['action'];
				if (action.length == 1 && action[0] == my_action['code'])
					proceedAction(_actions[i]);
			}
		} else {
			// Expect target
			action_state = PICK_TARGET;
			updateNotification();
		}
	}
}

/** Clicked on an action, if action is not already picked pick it
 * and expect a target. Otherwise reset action picking with new one. */
function decisionPicked(index) {
	closeResult();
	action_picked = ACTION_DECISION;
	target_picked = index;
	var key = current_state_index + "+" + index;
	if (!(key in flags)) 
		flags[key]= false;
	proceedResult(current_state['decisions'][index]['result']);
	// Reset action command completely (no state on map action)
	action_state = PICK_ACTION;
	jQuery(".targetted").removeClass('targetted');
	action_picked = null;
	updateNotification();
}

/** Clicked on a target */
function targetPicked(target_code) {
	if (action_state == PICK_TARGET) {	
		// Add the selected target to action
		

		targets_picked.push(target_code);
		// Look for an available action (even for incomplete action)
		var actions = default_actions.concat(current_state['actions']);
		if(action_picked['code'] == 'attack' && targets_picked.length > 0) {
			var num_targets = classes[players[current_player]['class']]['attacks'][targets_picked[0]]['targets'];
			if (targets_picked.length == num_targets + 1)
				attackAttempt(current_player);
			else {
				if (target_code in enemies)
					jQuery("#enemy-" + target_code).addClass('targetted');
					
				updateNotification();
			}
			return;
		}
		if(action_picked['code'] == 'extra' && targets_picked.length > 0) {
			var num_targets = extraactions[targets_picked[0]]['targets'];
			if (targets_picked.length == num_targets + 1)
				attackAttempt(current_player);
			else {
				if (target_code in enemies)
					jQuery("#enemy-" + target_code).addClass('targetted');
				updateNotification();
			} return;
		}
		var selected_action = [action_picked['code']];
		for (var i = 0; i < targets_picked.length; i++) {
			selected_action.push(targets_picked[i]);
		}
		var my_action = null;
		for (i = 0; i < actions.length; i++) {
			// Check if action is the same length as current action
			var action = actions[i]['action'];
			if (action.length != selected_action.length) {
				continue;
			}
			// Check if the action is the same or wildcard and assign it
			var ok = 1;
			for (var j = 0; j < selected_action.length; j++) {
				if (selected_action[j] != action[j]	&& action[j] != WILDCARD) {
					ok = 0;
					break;
				}
			}
			if (ok == 1) {
				my_action = actions[i];
				break;
			}
		}
		// If action is fully selected or action found, show result
		if (action_picked['targets'] == targets_picked.length || my_action !== null) {
			proceedAction(my_action);
		} else {
			updateNotification();
		}
	}
}

/** Clicked on an inventory item */
function bindingPicked(player, item) {
	selected_player = player;
	selected_item = item;
	targetPicked(item);
}

/** Update notification area with current action state */
function updateNotification() {
	switch (action_state) {
	case PICK_ACTION:
		// No action picked
		jQuery("#notification div").html(translate("_pick_action"));
		break;
	case PICK_TARGET:
		// Action picked, expecting targets
		var picked_count = targets_picked.length;
		var targets_count = action_picked['targets'];
		if (picked_count >= targets_count)
			picked_count = targets_count - 1;
		var i18n = "_pick_target_" + picked_count + "_of_" + targets_count;
		var i18n_args = [];
		i18n_args.push(translate(action_picked['code']));
		for (var i = 0; i < picked_count; i++) {
			i18n_args.push(translate(targets_picked[i]));
		}
		// Look for alternate linker word in picked action
		if ('linker' in action_picked) {
			i18n_args.push(translate(action_picked['linker']));
		} else {
			// Put default linker word
			i18n_args.push(translate('_pick_target_linker'));
		}
		html = translate(i18n, i18n_args);
		jQuery("#notification div").html(html);
		break;
	}
}

/** Process a set of conditions using either 'and' or 'or' logic. **/
function processConditions(player, conditions, type) {
	var _stat;
	var i;
	var item;
	if ('has_item' in conditions) {
		if (Array.isArray(conditions['has_item'])) {
			for (i = 0; i < conditions['has_item'].length; i++) {
				if (hasObject(conditions['has_item'][i])) {
					if (type == 'or') {
						return true;
					}
				} else {
					if (type == 'and') {
						return false;
					} else if (type == 'nand') {
						return true;
					}
				}
			}
		} else {
			if (hasObject(conditions['has_item'])) {
				if (type == 'or') {
					return true;
				}
			} else {
				if (type == 'and') {
					return false;
				} else if (type == 'nand') {
					return true;
				}
			}
		}
	}
	if ('has_binding' in conditions) {
		for (item in conditions['has_binding']) {
			if (Array.isArray(conditions['has_binding'][item])) {
				for (i = 0; i < conditions['has_binding'][item].length; i++) {
					if (hasItem(player, item, conditions['has_binding'][item][i])) {
						if (type == 'or') {
							return true;
						}
					} else {
						if (type == 'and') {
							return false;
						} else if (type == 'nand') {
							return true;
						}
					}
				}
			} else {
				if (hasItem(player, item, conditions['has_binding'][item])) {
					if (type == 'or') {
						return true;
					}
				} else {
					if (type == 'and') {
						return false;
					} else if (type == 'nand') {
						return true;
					}
				}
			}
		}
	}
	if ('has_buff' in conditions) {
		if (Array.isArray(conditions['has_buff'])) {
			for (i = 0; i < conditions['has_buff'].length; i++) {
				if (hasBuff(player, conditions['has_buff'][i])) {
					if (type == 'or') {
						return true;
					}
				} else {
					if (type == 'and') {
						return false;
					} else if (type == 'nand') {
						return true;
					}
				}
			}
		} else {
			if (hasBuff(player, conditions['has_buff'])) {
				if (type == 'or') {
					return true;
				}
			} else {
				if (type == 'and') {
					return false;
				} else if (type == 'nand') {
					return true;
				}
			}
		}
	}
	
	if ('check' in conditions) {
		for (var variable in conditions['check']) {
			if (!(variable in flags)) {
				flags[variable] = false;
			}
			
			if (flags[variable] == conditions['check'][variable]) {
				if (type == 'or') {
					return true;
				}
			} else {
				if (type == 'and') {
					return false;
				} else if (type == 'nand') {
					return true;
				}
			}
		}
	}
	if ('random' in conditions) {
			if (Math.random() * 100 < conditions['random']) {
				if (type == 'or') {
					return true;
				}
			} else {
				if (type == 'and') {
					return false;
				} else if (type == 'nand') {
					return true;
				}
			}
	}
	if ('has_stat' in conditions) {
		for (_stat in conditions['has_stat']) {
			if (players[player]['stats'][_stat] >= conditions['has_stat'][_stat]) {
				if (type == 'or') {
					return true;
				}
			} else {
				if (type == 'and') {
					return false;
				} else if (type == 'nand') {
					return true;
				}
			}
		}
	}
	if (type == 'or' || type == 'nand') {
		return false;
	} else {
		return true;
	}
}	

/** Proceed an action result. If null show default impossible action. */
function proceedAction(action) {
	// Reset action command and update
	action_state = PICK_ACTION;
	jQuery(".targetted").removeClass('targetted');
	target_picked = [];
	updateNotification();
	current_action = action;
	// If no transition show default result
	if (action === null) {
		showTextResult(translate("_you_cant_do_that"));
		return;
	}
	// Proceed transition if any
	if (!proceedResult(action['result'])) {
		showTextResult(translate("_you_cant_do_that"));
		return;
	}
}

/** Get action from map and proceed it's result. Called on map click. */
function proceedMapResult(index) {
	// Reset action command to map action
	action_picked = ACTION_MAP;
	target_picked = [];
	proceedResult(current_state['map-items'][index]['result']);
	// Reset action command completely (no state on map action)
	action_state = PICK_ACTION;
	jQuery(".targetted").removeClass('targetted');
	action_picked = null;
	updateNotification();
}

/** Parse and proceed a result object. Returns true if it makes
 * the game progress. */
function proceedResult(result) {
	var player = current_player;
	var i;
	var item;
	var progressed = false;
	if ('if' in result) {
		var valid = true;
		if ('and' in result['if']) {
			if (!processConditions(result['if']['and'],'and'))
				valid = false;
		}
		if ('or' in result['if']) {
			if (!processConditions(result['if']['or'],'or'))
				valid = false;
		}
		if ('nand' in result['if']) {
			if (!processConditions(result['if']['nand'],'nand'))
				valid = false;
		}
		if (valid) {
			if (proceedResult(result['if']['then'])) {
				progressed = true;
			}
		} else {
			if (proceedResult(result['if']['else'])) {
				progressed = true;
			}
		}
	}
	if ('text' in result) {
		showTextResult(result['text']);
		progressed = true;
	}
	if ('swap_movement' in result) {
		swapMovement(player);
		progressed = true;
	}
	if ('end_turn' in result) {
		removeBuff(player,'free-escape');
		nextTurn();
		progressed = true;
	}
	if ('examine' in result) {
		examine(targets_picked[0]);
		progressed = true;
	}
	if ('reset_fight' in result) {
		resetFight(result['reset_fight']);
		progressed = true;
	}
	if ('add_enemy' in result) {
		addEnemy(result['add_enemy']);
		progressed = true;
	}
	if ('add_player' in result) {
		addPlayer(result['add_player']['name'],result['add_player']['class']);
		progressed = true;
	}
	if ('binding' in result) {
		for (item in result['binding']) {
			adjustItem(player, item, result['binding'][item]);
		}
		progressed = true;
	}
	if ('remove_binding' in result) {
		for (item in result['remove_binding']) {
			removeItem(player, item);
		}
		progressed = true;
	}
	if ('escape' in result) {
		escapeAttempt(targets_picked[0]);
		progressed = true;
	}	
	if ('set' in result) {
		for (var variable in result['set']) {
			flags[variable] = result['set'][variable];
		}
		progressed = true;
	}
	if ('add' in result) {
		for (var variable in result['add']) {
			if (variable in flags)
				flags[variable] += result['add'][variable];
			else 
				flags[variable] = result['add'][variable];				
		}
		progressed = true;
	}
	if ('story' in result) {
		current_state['story'] = result['story'];
		setStory(current_state);
		progressed = true;
	}
	if ('game_over' in result) {
		badAction();
		badAction();
		game_over(result['game_over']);
		progressed = true;
	}
	if ('congratulations' in result) {
		game_end(result['congratulations']);
		progressed = true;
	}
	if ('move_to' in result) {
		if (result['move_to'] in states) {
			setState(result['move_to']);
		}		
		progressed = true;
	}
	if ('random_move' in result) {
		var new_state = Math.floor(Math.random() * result['random_move'].length);
		setState(result['random_move'][new_state]);
		progressed = true;
	}
	return progressed;
}

// State function
/////////////////

function setState(index) {
	current_state_index = index;
	current_state = states[index];
	setStatePicture(current_state);
	setStory(current_state);
	setMap(current_state);
	setDecisions(current_state);
	action_state = PICK_ACTION;
	jQuery(".targetted").removeClass('targetted');
	updateNotification();
	startFight(current_state);
}

function resetFight(state_index) {
	defeat = false;
	enemies = {};
	players = {};
	turnorder = [];
	jQuery("#order-list").html("");
	jQuery("#bindings").html("");
	jQuery("#stats").html("");
	jQuery("#description-text").html("");
	jQuery("#rolls-text").html("");
	jQuery("#environment ul").html("");
	clearActions();
	setState(state_index);
}

function startFight(state) {
	if ('fight' in state) {
		current_fight = fights[state['fight']];
		backlog = "";
		backlog2 = "";
		jQuery("#description-text").html("");
		jQuery("#rolls-text").html("");
		turnorder = [];
		setStory(state);
		for (var _player in players) {
			players[_player]['buffs'] = {};
			addBuff(_player, 'basedefense', {'name':'Base Defense','defense':classes[players[_player]['class']]['defense'],'hidden':true});
			if ('setupcustom' in classes[players[_player]['class']])
				classes[players[_player]['class']].setupcustom(_player);
			recalculateStats(_player);
		}
		current_fight.start();
		rollInit();
		currentturn = -1;
		
		sendEvent("------------------------------------------------------------------------------------<br>", true);
		sendEvent("--------------------" + current_fight['name'] + " has started!--------------------<br>", true);
		sendEvent("------------------------------------------------------------------------------------<br>", true);
		victory = false;
		nextTurn();
	}
}


function setStatePicture(state) {
	if ('picture' in state) {
		if ('big_picture' in state) {
			jQuery("#picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['big_picture']));
		} else {
			jQuery("#picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
		}
		jQuery("#picture img").attr("src", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
	}
}

function setStory(state) {
	showResult(state['story'], "Story: " + state['title']);
	
}

function setMap(state) {
	jQuery("#map img").attr("src", "./games/" + escUrl(game) + "/" + escUrl(state['map']));
	jQuery("#map map").html("");
	jQuery("#caption").html("");
	if ('title' in state) 
		jQuery("#caption").append(escHtml(translate(state['title'])));
	var html = "";
	for (var i = 0; i < state['map-items'].length; i++) {
		var item = state['map-items'][i];
		var area = "<area coords=\"" + escAttr(item['area']) + "\" shape=\"" + escAttr(item['shape']) + "\" onclick=\"javascript:proceedMapResult(" + i + ");\" />";
		html += area;
	}
	jQuery("#map map").html(html);
}

function checkDecisionVisibility(condition) {
	var valid = true;
	if ('and' in condition) {
		if (!processConditions(condition['and'],'and'))
			valid = false;
	}
	if ('or' in condition) {
		if (!processConditions(condition['or'],'or'))
			valid = false;
	}
	if ('nand' in condition) {
		if (!processConditions(condition['nand'],'nand'))
			valid = false;
	}
	return valid;
}

function setDecisions(state) {
	jQuery("#decisions ul").html("");
	jQuery("#decisiontitle").html("");
	if ('decisions' in state) {
		jQuery("#decisiontitle").append('<div class="title">Dialog Choices</div>');
		for (var i = 0; i < state['decisions'].length; i++) {
			if (!('condition' in state['decisions'][i]) || checkDecisionVisibility(state['decisions'][i]['condition'])) {
				var key = current_state_index + "+" + i;
				if (key in flags || ('hidden' in state['decisions'][i]['result']) && (state['decisions'][i]['result']['hidden'] === false)) {
					if (flags[key] === true && !('no_fade' in state['decisions'][i]['result'])) {
						jQuery("#decisions ul").append("<li onclick=\"javascript:decisionPicked('" + i + "');\">" + "<span style=\"color: silver\">" + translate(state['decisions'][i]['decision']) + "</span></li>");
					} else {
						jQuery("#decisions ul").append("<li onclick=\"javascript:decisionPicked('" + i + "');\">" + translate(state['decisions'][i]['decision']) + "</li>");
					}					
				} else {
					jQuery("#decisions ul").append("<li onclick=\"javascript:decisionPicked('" + i + "');\">" + escHtml(translate(state['decisions'][i]['decision'])) + "</li>");
				}
			}
		}
	}
}

function clearActions() {
	objects = [];
	jQuery("#attacks").html("");
}

function showActions(player) {
	var _attack;
	var _buff;
	var i;
	current_player = player;
	objects = [];
	jQuery("#attacks").html("");
	var _class = classes[players[player]['class']];
	
	if (!hasBuff(player, 'free-escape')) {
		for (i = 0; i < _class['categories'].length; i++) {
			var _title = false;
			for (_attack in _class['attacks']) {
				if (_class['attacks'][_attack]['category'] == _class['categories'][i]) {
					if (players[player]['stats']['stunned'] === 0 || _class['attacks'][_attack]['stunned'] === true) {
						if (!('condition' in _class['attacks'][_attack]) || _class['attacks'][_attack].condition(player)) {
							if (!_title) {
								_title = true;
								addObject(player, _class['categories'][i], _class['categories'][i] +' Attacks', 'title');
							}
							addObject(player, _attack, _class['attacks'][_attack]['name'], 'attack');
						}
					}
				}
			}	
		}
		_title = false;
		for (_attack in extraactions) {
			if (processConditions(player, extraactions[_attack]['condition'], 'and')) {
				if (!_title) {
					_title = true;
					addObject(player, 'extra', 'Extra Attacks', 'title');
				}
				addObject(player, _attack, extraactions[_attack]['name'], 'extra');
			}
		}
	}
	
	_title = false;
	if (Object.keys(players[player]['buffs']).length > 0) {
		for (_buff in players[player]['buffs']) {
			if (players[player]['buffs'][_buff]['hidden'] !== true) {
				if (!_title) {
					_title = true;
					addObject(player, 'buffs', 'Buffs/Debuffs', 'title');
				}
				addObject(player, _buff, players[player]['buffs'][_buff]['name'], 'buff');
			}
		}	
	}
}

function addEnvStats(_stat, _amount) {
	gamestats[_stat]['value'] += _amount;
	if (gamestats[_stat]['value'] > gamestats[_stat]['max'])
		gamestats[_stat]['value'] = gamestats[_stat]['max'];
	if (gamestats[_stat]['value'] < gamestats[_stat]['min'])
		gamestats[_stat]['value'] = gamestats[_stat]['min'];
	recalculateEnvironment();
}

function recalculateEnvironment() {
	jQuery("#environment ul").html("");
	for (var _stat in gamestats) {
		if (gamestats[_stat]['value'] !== 0) {
			var _src;
			if (gamestats[_stat]['value'] > 0) {
				_src = "./games/" + escUrl(game) + "/" + escUrl(gamestats[_stat]['bar']);
			} else if (gamestats[_stat]['value'] < -19) {
				_src = "./games/" + escUrl(game) + "/" + escUrl(gamestats[_stat]['bar_extreme']);
			} else {
				_src = "./games/" + escUrl(game) + "/" + escUrl(gamestats[_stat]['bar_negative']);
			}
			jQuery("#environment ul").append("<li id=\"env-" + escAttr(_stat) + "\"><span class=\"statname\">" + escHtml(gamestats[_stat]['name']) + "</span><span class=\"stat\"></span>");
				
			jQuery("#env-" + escAttr(_stat) + " span.stat").html("<div style=\"z-index:1;  position: absolute; top: 0; left: 0; height:18px; width:" + Math.min(101,Math.abs(gamestats[_stat]['value'])*gamestats[_stat]['width']+1) + "px; background:url('" + _src + "') 0 0;\"></div>");
		}
	}
}

function recalculateStats(player) {
	var _stat;
	var _item;
	var _effect;
	var _buff;
	var _tempstats = {};
	for (_stat in stats) {
		if (stats[_stat]['reset'] !== false) {
			_tempstats[_stat] = players[player]['stats'][_stat];
			players[player]['stats'][_stat] = 0;
		}
	}
	for (_item in players[player]['bindings']) {
		if (_item in bindings) {
			var level = "";
			if (players[player]['bindings'][_item]['level'] <= 1)
				level = 'easy';
			else if (players[player]['bindings'][_item]['level'] <= 2)
				level = 'medium';
			else if (players[player]['bindings'][_item]['level'] <= 4)
				level = 'hard';
			else if (players[player]['bindings'][_item]['level'] <= 7)
				level = 'extreme';
			else 
				level = 'impossible';
			if (level in bindings[_item]) {
				for (_stat in stats) {
					if (_stat in bindings[_item][level]) {
						if (stats[_stat]['additive']) {
							players[player]['stats'][_stat] += bindings[_item][_stat];
						} else {
							if (bindings[_item][level][_stat] > players[player]['stats'][_stat])
								players[player]['stats'][_stat] = bindings[_item][level][_stat];
						}
					}
				}
			}
		}
	}
	for (_stat in stats) {
		if ('effects' in stats[_stat]) {	
			if (stats[_stat]['effects'].length > players[player]['stats'][_stat]) {
				var effects = stats[_stat]['effects'][players[player]['stats'][_stat]];
				for (_effect in effects) {
					if (_effect in stats) {
						if (stats[_effect]['additive']) {
							players[player]['stats'][_effect] += effects[_effect];
						} else {
							if (effects[_effect] > players[player]['stats'][_stat])
								players[player]['stats'][_effect] = effects[_effect];
						}
					}
				}
			}
		}
	}
	for (_buff in players[player]['buffs']) {
		for (_stat in stats) {
			if (_stat in players[player]['buffs'][_buff]) {
				if (stats[_stat]['additive']) {
					players[player]['stats'][_stat] += players[player]['buffs'][_buff][_stat];
				} else {
					if (players[player]['buffs'][_buff][_stat] > players[player]['stats'][_stat])
						players[player]['stats'][_stat] = players[player]['buffs'][_buff][_stat];
				}
			}
		}
	}
	for (_stat in stats) {
		if ('add_to' in stats[_stat]) {
			for (var i = 0; i < stats[_stat]['add_to'].length; i++) {
				players[player]['stats'][stats[_stat]['add_to'][i]] += players[player]['stats'][_stat];
			}
		}
	}
		
	for (_stat in stats) {
		if (players[player]['stats'][_stat] !== 0 && stats[_stat]['hidden'] !== true) {
			var _src;
			if (players[player]['stats'][_stat] > 0) {
				_src = "./core/images/" + escUrl(stats[_stat]['bar']);
			} else if (players[player]['stats'][_stat] < -19) {
				_src = "./core/images/" + escUrl(stats[_stat]['bar_extreme']);
			} else {
				_src = "./core/images/" + escUrl(stats[_stat]['bar_negative']);
			}
			jQuery("#stats-" + escAttr(player + "-" + _stat)).show();
			jQuery("#stats-" + escAttr(player + "-" + _stat) + " span.stat").html("<div style=\"z-index:1;  position: absolute; top: 0; left: 0; height:18px; width:" + Math.min(101,Math.abs(players[player]['stats'][_stat])*stats[_stat]['width']+1) + "px; background:url('" + _src + "') 0 0;\"></div>");
			if (players[player]['stats'][_stat] != _tempstats[_stat]) {
				jQuery("#stats-" + escAttr(player + "-" + _stat) + " span.statname").addClass('glowing');
				setTimeout(_glowing,500,player,_stat);
			}

		} else {
			jQuery("#stats-" + escAttr(player + "-" + _stat)).hide();
		}
	}
}	

function _glowing(player,_stat) {
	var tempspan = jQuery("#stats-" + escAttr(player + "-" + _stat) + " span.statname.glowing");
	tempspan.removeClass('glowing');
	tempspan.addClass('notglowing');				
	setTimeout(function(){
		var tempspan = jQuery("#stats-" + escAttr(player + "-" + _stat) + " span.statname.notglowing");
		tempspan.removeClass('notglowing');
	},3000);
}

function recalculateEnemy(enemy) {
	var _stat;
	var _buff;
	for (_stat in stats) {
		if ('enemy' in stats[_stat] && stats[_stat]['enemy'] === true)
			enemies[enemy]['stats'][_stat] = 0;
	}
	for (_buff in enemies[enemy]['buffs']) {
		for (_stat in stats) {
			if (_stat in enemies[enemy]['buffs'][_buff]) {
				if (stats[_stat]['additive']) {
					enemies[enemy]['stats'][_stat] += enemies[enemy]['buffs'][_buff][_stat];
				} else {
					if (enemies[enemy]['buffs'][_buff][_stat] > enemies[enemy]['stats'][_stat])
						enemies[enemy]['stats'][_stat] = enemies[enemy]['buffs'][_buff][_stat];
				}
			}
		}
	}
}	

function examine(item) {
	if (item in players)
		examineClass(classes[players[item]['class']]);
	else if (item in enemies)
		examineEnemy(item);
	else if (item in bindings)
		examineBinding(bindings[item]);
	else {
		for (var _class in classes)
			if (item in classes[_class]['attacks'])
				examineClass(classes[_class]);
	}
}

function examineLevel(_level, _tier) {
	var _text = "";
	var _src = "./core/images/bindings.png";
	_text +=("<div style=\"height:18px; width:" + Math.min(101,Math.abs(_level*10+1)) + "px; background:url('" + _src + "') 0 0;\"></div>");
	for (var _stat in stats) {
		if (_stat in _tier) {
			if (stats[_stat]['nomod'] === true)
				_text += "<span style=\"font-weight: bold;\"> (<span style=\"color: #ED1C34\">" + stats[_stat]['name'] + "</span>)</span>";
			else
				_text += "<span style=\"font-weight: bold;\"> (<span style=\"color: #22B14C\">" + stats[_stat]['name'] + " " + _tier[_stat] + "</span>)</span>";
			_text += " = ";
			if ('effects' in stats[_stat]) {
				for (var _stat2 in stats) {
					if (_stat2 in stats[_stat]['effects'][_tier[_stat]]) {
						if (stats[_stat]['effects'][_tier[_stat]][_stat2] < 0)
							_text += "<span style=\"font-weight: bold;\"> (<span style=\"color: #ED1C34\">" + stats[_stat2]['name'] + stats[_stat]['effects'][_tier[_stat]][_stat2] + "</span>)</span>";
						else
							_text += "<span style=\"font-weight: bold;\"> (<span style=\"color: #22B14C\">" + stats[_stat2]['name'] + "+" + stats[_stat]['effects'][_tier[_stat]][_stat2] + "</span>)</span>";
					}
				}
			}
			_text += "<br>";
		}
	}
	return _text;
}



function examineBinding(_binding) {
	var _text = [];
	if ('description' in _binding)
		_text.push(_binding['description']);
	_text.push("<span style=\"font-weight: bold;\">Effects:</span>");

	_text.push(examineLevel(1, _binding['easy']));
	_text.push(examineLevel(2, _binding['medium']));
	_text.push(examineLevel(4, _binding['hard']));
	_text.push(examineLevel(7, _binding['extreme']));
	_text.push(examineLevel(10, _binding['impossible']));
	showResult(_text, _binding['name']);
}

function examineEnemy(_enemy) {
	var _enemytype = enemytypes[enemies[_enemy]['type']];
	var _text = [];
	var _line;
	var _first = false;
	if ('description' in _enemytype)
		_text.push(_enemytype['description']);
	_text.push("<span style=\"font-weight: bold;\">Base HP: </span>" + _enemytype['hp'])
	_text.push("<span style=\"font-weight: bold;\">Base Defense: </span>" + _enemytype['defense'])
	_text.push("<span style=\"font-weight: bold; text-align:center;\">===Attacks===</span><br>");
	for (var _attack in _enemytype['attacks']) {
		_text.push("<span style=\"font-weight: bold;\">" + _enemytype['attacks'][_attack]['name'] + ": </span>" + _enemytype['attacks'][_attack]['description']);
	}
	showResult(_text, _enemytype['name']);
}

function examineClass(_class) {
	var _text = [];
	var _line;
	var _first = false;
	if ('description' in _class)
		_text.push(_class['description']);
	_text.push("<span style=\"font-weight: bold;\">Base Defense: </span>" + _class['defense'])
	for (var i = 0; i < _class['categories'].length; i++) {
		_line = "<span style=\"font-weight: bold; text-align:center;\">===" + _class['categories'][i] + " Attacks===</span><br>";
		_first = true;
		for (var _attack in _class['attacks']) {
			if (_class['attacks'][_attack]['category'] == _class['categories'][i] && 'description' in _class['attacks'][_attack]) {
				if (_first)
					_first = false;
				else 
					_line += "<br>";
				if (_class['attacks'][_attack]['type'] == 'spell')
					_line += "<span style=\"font-weight: bold; color: skyblue;\">" + _class['attacks'][_attack]['name'] + ": </span>" + _class['attacks'][_attack]['description'];
				if (_class['attacks'][_attack]['type'] == 'physical')
					_line += "<span style=\"font-weight: bold; color: lightcoral;\">" + _class['attacks'][_attack]['name'] + ": </span>" + _class['attacks'][_attack]['description'];
				if (_class['attacks'][_attack]['type'] == 'other')
					_line += "<span style=\"font-weight: bold;\">" + _class['attacks'][_attack]['name'] + ": </span>" + _class['attacks'][_attack]['description'];
			}
		}
		_text.push(_line);
	}
	showResult(_text, _class['name']);
}


function swapMovement(player) {
	if (players[player]['stats']['immobilized'] == 1) {
		showTextResult("You are immobilized and cannot start moving!");
		return;
	}
	if (players[player]['stats']['stunned'] == 1) {
		showTextResult("You are stunned and cannot change your movement state!");
		return;
	}
	if (players[player]['move'] == 'moving') { 
		setStanding(player);
	} else {
		setMoving(player);
	}
	drawOrder();
	showActions(player);
}

function setMoving(player) {
	if (players[player]['stats']['immobilized'] == 0 && players[player]['stats']['stunned'] == 0) {
		players[player]['move'] = 'moving';
		removeBuff(player, 'standing');
		drawOrder();
	}
}

function setStanding(player) {	
	players[player]['move'] = 'standing';
	addBuff(player, 'standing', {'name':'Standing Still','defense':-2});
}

function drawPlayer(player, current) {
	if (players[player]['stats']['incapacitated'] !== 0)
		return;
	var span = jQuery("#order ul");
	var movement = "";
	if (players[player]['move'] == 'moving') 
		movement = "Moving";
	else if (players[player]['move'] == 'standing') 
		movement = "Standing";
	if (current)
		span.append("\n<li class=\"current\" id=\"player-" + escAttr(player) + "\" onclick=\"javascript:targetPicked('" + escJs(player) + "');\"><span style=\"color:lightgreen\">" + escHtml(players[player]['name'] + "</span> the <span style=\"color:" + classes[players[player]['class']]['color'] + "\">" + classes[players[player]['class']]['name'] + "</span> (" + movement + ")") + "</li>");
	else
		span.append("\n<li id=\"player-" + escAttr(player) + "\" onclick=\"javascript:targetPicked('" + escJs(player) + "');\"><span style=\"color:lightgreen\">" + escHtml(players[player]['name'] + "</span> the <span style=\"color:" + classes[players[player]['class']]['color'] + "\">" + classes[players[player]['class']]['name'] + "</span> (" + movement + ")") + "</li>");
	for (var _buff in players[player]['buffs']) {
		if (players[player]['buffs'][_buff]['helpless'] > 0 || ('show' in players[player]['buffs'][_buff] && players[player]['buffs'][_buff]['show'] === true)) {
			span.append("\n<div class='enebuff'>" + escHtml(players[player]['buffs'][_buff]['name']) + escHtml(statString(player, _buff, 'buff')) + "</div>");
		}
	}
	
}

function drawEnemy(enemy, current) {
	var _src;
	var _buff;
	recalculateEnemy(enemy);
	if (current)
		jQuery("#order ul").append("\n<li class=\"current\" id=\"enemy-" + escAttr(enemy) + "\" onclick=\"javascript:targetPicked('" + escJs(enemy) + "');\"></li>");
	else
		jQuery("#order ul").append("\n<li id=\"enemy-" + escAttr(enemy) + "\" onclick=\"javascript:targetPicked('" + escJs(enemy) + "');\"></li>");	
	var span = jQuery("#order ul li#enemy-" + escAttr(enemy));
	span.append("<div><span style=\"color:lightcoral\">" + escHtml(enemies[enemy]['name']) + "</span><span style=\"font-weight: bold;\"> HP: </span></div>");
	span.append("<div class='bar'>&nbsp;</div>");
	barspan = jQuery("#order ul li#enemy-" + escAttr(enemy) + " .bar");
	var remaining = enemies[enemy]['hp']/enemytypes[enemies[enemy]['type']]['hp']*100;
	if (remaining > 50)
		_src = "./core/images/health.png";
	else if (remaining > 25)
		_src = "./core/images/health_low.png";
	else
		_src = "./core/images/health_critical.png";
	barspan.append("<div style=\"z-index:1; position: absolute; top: 0; left: 0; height:18px; width:" + Math.min(101,Math.abs(remaining+1)) + "px; background:url('" + _src + "') 0 0;\"></div>");
	_src = "./core/images/health_background.png";
	barspan.append("<div style=\"z-index:0; position: absolute; top: 0; left: 0; height:18px; width:101px; background:url('" + _src + "') 0 0;\"></div>");
	span.append("<div><span style=\"font-weight: bold;\"> Def: </span></div>");
	_src = "./core/images/defense.png";
	
	span.append("<div style=\"height:18px; width:" + Math.min(101,Math.abs(enemies[enemy]['stats']['defense'])*5+1) + "px; background:url('" + _src + "') 0 0;\"></div>");
	for (_buff in enemies[enemy]['buffs']) {
		if (enemies[enemy]['buffs'][_buff]['hidden'] !== true) {
			span.append("\n<div class='enebuff'>" + escHtml(enemies[enemy]['buffs'][_buff]['name']) + escHtml(statString(enemy, _buff, 'enebuff')) + "</div>");
		}
	}

}


function drawOrder() {
	jQuery("#order ul").html("");
	for (var i = 0; i < turnorder.length; i++) {
		if (turnorder[i]['type'] == 'player') {
			if (currentturn == i)
				drawPlayer(turnorder[i]['name'], true);
			else
				drawPlayer(turnorder[i]['name'], false);
		} else if (turnorder[i]['type'] == 'enemy') {
			if (currentturn == i)
				drawEnemy(turnorder[i]['name'], true);
			else
				drawEnemy(turnorder[i]['name'], false);
		}

	}
}
	
// Initializing functions
/////////////////////////



function setupUI() {
	// Translate UI labels
	jQuery("#bindings .title").html(escHtml(translate("_inventory")));
	jQuery("#objects .title").html(escHtml(translate("_objects")));
	jQuery("#start-button").html(escHtml(translate("_start_game")));
	jQuery("#load-button").html(escHtml(translate("_load_game")));
	jQuery("#try-again button").html(escHtml(translate("_try_again")));
	// Check for loading?
	if (localStorage.length === 0) {
		jQuery("#load-button").hide();
	}
	
	// Set game title
	if (isDefined('title')) {
		jQuery("title").html(escHtml(translate(title)));
	}
	// Set game footer (can contain html)
	if (isDefined('footer')) {
		jQuery("#footer").html(translate(footer));
	}
}

function setupIntro() {
	if (!isDefined('intro')) {
		return;
	}
	if (!Array.isArray(intro)) {
		intro = [intro];
	}
	if (intro.length === 0) {
		return false;
	}
	var html = "";
	for (var i = 0; i < intro.length; i++) {
		var step = intro[i];
		if ('story' in step) {
			if (Array.isArray(step['story'])) {
				for (var j = 0; j < step['story'].length; j++) {
					html += "<p>" + escHtml(translate(step['story'][j])) + "</p>";
				}
			} else {
				html += "<p>" + escHtml(translate(step['story'])) + "</p>";
			}
		}
		if ('picture' in step) {
			html += "<div class=\"intro-picture\">";
			if ('big_picture' in step) {
				html += "<a href=\"./games/" + escUrl(game) + "/" + escUrl(step['big_picture']) + "\">";
			}
			html += "<img src=\"./games/" + escUrl(game) + "/" + escUrl(step['picture']) + "\" />";
			if ('big_picture' in step) {
				html += "</a>";
			}
			html += "</div>";
		}
	}
	jQuery("#intro-screen").prepend(html);
	return true;
}

function setupActions() {
	for (var i = 0; i < actions.length; i++) {
		if (!('hidden' in actions[i] && actions[i]['hidden'] === true))
			jQuery("#actions ul").append("<li id=\"" + escJs(actions[i]['code']) + "\" onclick=\"javascript:actionPicked('" + escJs(actions[i]['code']) + "');\">" + escHtml(translate(actions[i]['code'])) + "</li>");
	}
}

// Starting/ending functions
////////////////////////////
function loadGame() {
	// Get game from g param
	game = _get('g');
	if (game === null) {
		return false;
	}
	// Add scripts and style

	jQuery.getScript("./games/" + escUrl(game) + "/game.js")
		.done(function() { 
			jQuery.getScript("./games/" + escUrl(game) + "/language.js")
				.done(function() {	
					continueLoad();
				})
				.fail(function() {
					jQuery("head").append("<script type=\"text/javascript\" src=\"./games/" + escUrl(game) + "/language.js\"></script>");
				failLoad();
				});

		})
		.fail(function() {
			jQuery("head").append("<script type=\"text/javascript\" src=\"./games/" + escUrl(game) + "/game.js\"></script>");
			failLoad();
		});
		
}

function loadI18n() {
	for (var key in default_core_language) {
		i18n[key] = default_core_language[key];
	}
	for (key in default_language) {
		i18n[key] = default_language[key];
	}
	for (var _class in classes) {
		for (key in classes[_class]['attacks'])
			i18n[key] = classes[_class]['attacks'][key]['name'];
	}
	for (key in bindings)
		i18n[key] = bindings[key]['name'];
	for (key in extraactions)
		i18n[key] = extraactions[key]['name'];
}

function sortOrder() {
	if (currentturn >= turnorder.length)
		currentturn = 0;
	var tempname = turnorder[currentturn]['name'];
	turnorder.sort(function(a, b) {
        var x = a['initiative']; var y = b['initiative'];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
	for (var i = 0; i < turnorder.length; i++)
		if (turnorder[i]['name'] == tempname)
			currentturn = i;
    drawOrder();
}

function addEnemy(_type) {
	var enemy = {};
	enemy['name'] = enemytypes[_type]['name'];
	enemy['type'] = _type;
	enemy['hp'] = enemytypes[_type]['hp'];
	enemy['defense'] = enemytypes[_type]['defense'];	
	enemy['stats'] = {};
	enemy['buffs'] = {};
	var _key = 'enemy'+ nextenemy;
	nextenemy++;
	enemies[_key] = enemy;
	enemyBuff(_key, 'basedefense', {'defense':enemy['defense'], 'hidden':true});
	if ('setupcustom' in enemytypes[_type])
		enemytypes[_type].setupcustom(_key);
	i18n[_key] = enemytypes[_type]['name'];
	var _init = diceRoll({'d20':1}, "Initiative for " + enemy['name']);
	turnorder.push({'initiative':_init, 'type':'enemy', 'name':_key});
	sortOrder();
	return _key;
}

function addPlayer(_name, _class) {
	var player = {};
	player['name'] = _name;
	player['class'] = _class;
	player['bindings'] = {};
	player['move'] = 'moving';
	player['stats'] = {};
	for (var _stat in stats)
		player['stats'][_stat] = 0;
	player['buffs'] = {};
	var _key = 'player'+(Object.keys(players).length + 1);
	players[_key] = player;
	jQuery("#stats").append("<div id=\"status-title-" + escAttr(_key)  + "\" class=\"title\">" + escHtml(player['name'] + "'s Status") + "</div><ul id=\"status-" + escAttr(_key)  + "\"></ul><ul id=\"combat-" + escAttr(_key)  + "\"></ul>");
	for (_stat in stats) {
		if (stats[_stat]['column'] == 'status')
			jQuery("#status-" + escAttr(_key)).append("<li id=\"stats-" + escAttr(_key + "-" + _stat) + "\"><span class=\"statname\">" + escHtml(stats[_stat]['name']) + "</span><span class=\"stat\"></span>").hide();
		else if (stats[_stat]['column'] == 'combat')
			jQuery("#combat-" + escAttr(_key)).append("<li id=\"stats-" + escAttr(_key + "-" + _stat) + "\"><span class=\"statname\">" + escHtml(stats[_stat]['name']) + "</span><span class=\"stat\"></span>").hide();
	}
	jQuery("#combat-" + escAttr(_key)).show();
	jQuery("#status-" + escAttr(_key)).show();
	addBuff(_key, 'basedefense', {'name':'Base Defense','defense':classes[_class]['defense'],'hidden':true});
	if ('setupcustom' in classes[_class])
		classes[_class].setupcustom(_key);
	i18n[_key] = _name;
	jQuery("#bindings").append("<div id=\"bindings-title-" + escAttr(_key)  + "\" class=\"title\">" + escHtml(players[_key]['name'] + "'s " + translate('bindings')) + "</div><ul id=\"bindings-" + escAttr(_key)  + "\"><div id=\"none-" + escAttr(_key) + "\">None!</div></ul>");
	recalculateStats(_key);
	return _key;
}

function rollInit() {
	for (var _player in players) {
		var _init = diceRoll({'d20':1}, "Initiative for " + players[_player]['name']);
		turnorder.push({'initiative':_init, 'type':'player', 'name':_player});
	}
	sortOrder();
}

function start(numplayers) {
	jQuery("#intro-screen").hide();
	jQuery("#game-screen").show();
}

/** Init and show a game over screen by bad_ends index */
function game_over(end_index) {
	jQuery("#game-screen").hide();
	var state = bad_ends[end_index];
	if ('picture' in state) {
		if ('big_picture' in state) {
			jQuery("#game-over-picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['big_picture']));
		} else {
			jQuery("#game-over-picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
		}
		jQuery("#game-over-picture img").attr("src", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
	}
	lines = state['story'];
	jQuery("#game-over-situation").html("");
	for (var i = 0; i < lines.length; i++) {
		jQuery("#game-over-situation").append("<p>" + escHtml(translate(lines[i])) + "</p>");
	}
	jQuery("#game-over-screen").show();
}

/** Return to previous game state */
function retry() {
	jQuery("#game-over-screen").hide();
	jQuery("#game-screen").show();
}

/** Init and show an ending screen by good_ends index */
function game_end(end_index) {
	jQuery("#game-screen").hide();
	var state = good_ends[end_index];
	if ('picture' in state) {
		if ('big_picture' in state) {
			jQuery("#game-end-picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['big_picture']));
		} else {
			jQuery("#game-end-picture a").attr("href", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
		}
		jQuery("#game-end-picture img").attr("src", "./games/" + escUrl(game) + "/" + escUrl(state['picture']));
	}
	lines = state['story'];
	jQuery("#game-end-situation").html("");
	for (var i = 0; i < lines.length; i++) {
		jQuery("#game-end-situation").append("<p>" + escHtml(translate(lines[i])) + "</p>");
	}
	jQuery("#game-end-screen").show();	
}

jQuery().ready(function() {
	loadGame();
});

function failLoad() {
	jQuery("#game-screen").hide();
	jQuery("#error-screen").html("Game not loaded");
	jQuery("#error-screen").show();
}

function continueLoad() {
	jQuery("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\"./games/" + escUrl(game) + "/game.css\"/>");
	// Check for game data
	if (!isDefined('states')) {
		failLoad();
		return;
	}
	loadI18n();
	setupUI();
	setupActions();
	if (setupIntro()) {
		jQuery("#game-screen").hide();
		jQuery("#intro-screen").show();
	}
	setState('start');
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}