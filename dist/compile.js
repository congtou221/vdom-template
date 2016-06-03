(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.t2h = require('./lib/virtual-template.js');
},{"./lib/virtual-template.js":3}],2:[function(require,module,exports){
var _ = {};

_.extend = function(dest, src){
	for(var key in src){
		if(src.hasOwnProperty(key)){
			dest[key] = src[key];
		}
	}
	return dest;
}

module.exports = _;
},{}],3:[function(require,module,exports){
var svd = require('s-virtual-dom');
var tmp = require('mini-template');
var _ = require('./util');

function initDom(){
	this.container.innerHTML = tmp(this.tpl, this.data);
}
function setState(data){
	_.extend(this.data, data);

}
function vDiff(){
	var htmlStr = tmp(this.tpl, this.data);
	console.log(typeof htmlStr);
}
function makeVirTemplateClass(){
	function virTemplateClass(tpl, container, data){
		this.data = data;
		this.tpl = tpl;
		this.container = container;		
	
	}
	_.extend(virTemplateClass.prototype, {
		initDom: initDom,
		setState: setState
	});	

	return virTemplateClass;
}

var virTemplate = makeVirTemplateClass();

module.exports = function(tpl, container, data){
	return data ?
			new virTemplate(tpl, container, data) :
			virTemplate;
}
},{"./util":2,"mini-template":4,"s-virtual-dom":5}],4:[function(require,module,exports){

var tplEngine = function(tpl, data){

	var regTemp = /<%([^%>]+)?%>/g;

	// ^( )? 确保正则表达式只匹配一行，回车后的字符不匹配
	var regControl = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;

	var code = "var r = [];\n";

	function Add(str, js){
		code += js ? 
				(
					regControl.exec(str) ? 
					str+'\n' : 
					'r.push('+str+');\n'
				) : 
				(
					str ? 
					'r.push("'+str.replace(/"/g, '\\"')+'");\n' :
					''
				);
		return Add;
	}

	var index = 0;
	while(match = regTemp.exec(tpl)){

		Add(tpl.slice(index, match.index))(match[1], true);
		index = match.index + match[0].length;
	}
	code += 'return r.join("");';

	var generateHtmlStr = new Function('data', code.replace(/[\r\t\n]/g, ''));

	var htmlStr = generateHtmlStr(data);

	return htmlStr;
};

module.exports = tplEngine;
},{}],5:[function(require,module,exports){
exports.el = require('./lib/element');
exports.diff = require('./lib/diff');
exports.patch = require('./lib/patch');
},{"./lib/diff":6,"./lib/element":7,"./lib/patch":8}],6:[function(require,module,exports){
var _ = require('./util');
var patch = require('./patch');
var listDiff = require('list-diff2');

// reorder 节点重新排列 
// replace  节点替换
// text 文本更新
// props 属性更新
function diff(oldNode, newNode){

	var index = 0;
	var patches = [];

	dfsWalk(oldNode, newNode, index, patches);

	return patches;
}

var dfsWalk = function(oldNode, newNode, index, patches){
	var currentPatches = [];

	if(!newNode){

	}else if(_.isString(oldNode) && _.isString(newNode)){
		// update text node
		currentPatches.push({type: 'TEXT', content: newNode});
	}else if(oldNode.tagName === newNode.tagName && oldNode.key === newNode.key){
		// update props

		var propPatches = diffProps(oldNode.props, newNode.props);
		if(propPatches){
			currentPatches.push({type: 'PROPS', prop: propPatches});
		}
		// compare child node
		if (!(oldNode.count === 0 || newNode.count === 0)){
			diffChildren(
				oldNode.children, 
				newNode.children,
				index,
				currentPatches,
				patches
				);
		}
	}else{
		// replace oldNode
		currentPatches.push({type: 'REPLACE', content: newNode});
	}
	patches[index] = currentPatches;

};

var diffChildren = function(oldChildren, newChildren, index, currentPatches, patches){
	// reorder child node
	var diffs = listDiff(oldChildren, newChildren, 'key');
	newChildren = diffs.children;  //?

	if(diffs.moves.length){
		var reorderPatch = {type: 'REORDER', moves: diffs.moves};
		currentPatches.push(reorderPatch);
	}

	var leftNode = null;
	var currentNodeIndex = index;

	_.each(oldChildren, function(oldChild, index){

		var newChild = newChildren[index];

		currentNodeIndex = (leftNode && leftNode.count)
							? currentNodeIndex + leftNode.count + 1
							: currentNodeIndex + 1;


		dfsWalk(oldChild, newChild, currentNodeIndex, patches);
		leftNode = oldChild;
	})
	

};

var diffProps = function(oldProps, newProps){
	var count = 0;
	var propName;
	var propPatches = {};

	// update properties
	for(propName in oldProps){
		var value = oldProps[propName];
		if(value !== newProps[propName]){
			propPatches[propName] = newProps[propName];
			count++;
		}
	}
	// add properties
	for(propName in newProps){
		if(!oldProps.hasOwnProperty(propName)){
			propPatches[propName] = newProps[propName];
			count++;
		}
	}
	if(count === 0){
		return null;
	}
	return propPatches;
};

module.exports = diff;
},{"./patch":8,"./util":9,"list-diff2":10}],7:[function(require,module,exports){
var _ = require('./util');


function Element(tagName, props, children){

	if(!this instanceof Element){
		return new Element(tagName, props, children);
	}

	if(_.isArray(props)){
		children = props;
		props = {};
	}

	this.tagName = tagName;
	this.props = props || {};
	this.children = children || [];
	this.key = props ? props.key : void 666; 

	var count = 0;
	_.each(children, function(child, i){
		if(child instanceof Element){
			count += child.count;
		}else{
			children[i] = '' + child;
		}
		count++;
	});

	this.count = count;

}

Element.prototype.render = function(){

	var tagName = this.tagName;
	if(!tagName){
		return false;
	}
	var el = document.createElement(tagName);

	var props = this.props;
	for(var propName in props){
		var propsValue = props[propName];
		_.setAttr(el, propName, propsValue);
	}

	_.each(this.children, function(child){
		var childNode = child instanceof Element 
		? child.render()
		: document.createTextNode(child);

		el.appendChild(childNode);
	});

	return el;
}

module.exports = Element;
},{"./util":9}],8:[function(require,module,exports){
var _ = require('./util');

function patch(root, patches){

	var walker = {index:0};

	patchWalk(root, walker, patches);

}

var patchWalk = function(node, walker, patches){
	var currentPatch = patches[walker.index];

	var len = node.children ? node.children.length : 0;

	for(var i = 0 ; i < len ; i++){
		var child = node.childNodes[i];
		walker.index++;
		patchWalk(child, walker, patches);
	}
	if(currentPatch){
		applyPatches(node, currentPatch);
	}
	
};
var applyPatches = function(node, currentPatch){
	_.each(currentPatch, function(currentPatchItem, index){

		switch (currentPatchItem.type){
			case 'TEXT':
				var textContent = currentPatchItem.content;
				if(node.textContent){
					node.textContent = textContent;
				}else{
					// ie
					node.nodeValue = textContent;
				}

				break;
			case 'PROPS':
				setProps(node, currentPatchItem.prop);
				break;
			case 'REORDER':
				reorderChildren(node, currentPatchItem.moves);
				break;
			case 'REPLACE':
				var newNode = currentPatchItem.content;
				var newDom = _.isString(content) ? document.createTextNode(content) : node.render();
				node.parentNode.replaceChild(newDom);
				break;
			default:
				throw new Error('Unknown patch type '+ currentPatchItem.type);
		}
	});	
}
var setProps = function(node, prop){

	for(var propName in prop){
		if(prop[propName] === void 0){
			node.removeAttribute(propName);
		}else{
			var value = prop[propName];
			_.setAttr(node, propName, value);
		}
		
	}	
};

var reorderChildren = function(node, moves){
	var staticNodeList = _.toArray(node.children);
	var maps = {};
	
	_.each(staticNodeList, function(staticNodeItem){
		if(node.nodeType === 1){
			var staticNodeItemKey = staticNodeItem.key;
			if(staticNodeItemKey){
				maps[staticNodeItemKey] = staticNodeItem;
			}
					
		}

	});

	_.each(moves, function(move){
		var index = move.index;
		if(move.type === 0){
			// remove item
			if(staticNodeList[index] === node.childNodes[index]){
				node.removeChild(node.childNodes[index]);
			}
			staticNodeList.splice(index, 1);

		}else if(move.type === 1){
			// insert item
			var insertItem = maps[move.item.key] ?
								maps[move.item.key] :
								(typeof move.item === 'object') ?
								move.item.render() :
								document.createTextNode(move.item);
			staticNodeList.splice(index, 0, insertNode);
			node.insertBefore(insertNode, node.childNodes[index]||null);

		}
	});
};

module.exports = patch;
},{"./util":9}],9:[function(require,module,exports){
var _ = exports;

_.type = function(obj){
	return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '');
};

_.isArray = function(list){
	return _.type(list) === 'Array';
};

_.isString = function(list){
	return _.type(list) === 'String';
};

_.each = function(array, fn){
	for(var i = 0, len = array.length; i < len ; i++){
		fn(array[i], i);
	}
};

_.toArray = function(listLike){

};

_.setAttr = function(node, key, value){
	switch(key){
		case "style":
			node.style = value;
			break;
		case "value":
			var tagName = node.tagName || '';
			tagName = tagName.toLowerCase();

			if(tagName === 'input' || tagName === 'textarea'){
				node.value = value;
			}else{
				node.setAttribute(key, value);
			}
			break;
		default:
		node.setAttribute(key, value);
		break;
	}
};
},{}],10:[function(require,module,exports){
module.exports = require('./lib/diff').diff

},{"./lib/diff":11}],11:[function(require,module,exports){
/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 */
function diff (oldList, newList, key) {
  var oldMap = makeKeyIndexAndFree(oldList, key)
  var newMap = makeKeyIndexAndFree(newList, key)

  var newFree = newMap.free

  var oldKeyIndex = oldMap.keyIndex
  var newKeyIndex = newMap.keyIndex

  var moves = []

  // a simulate list to manipulate
  var children = []
  var i = 0
  var item
  var itemKey
  var freeIndex = 0

  // fist pass to check item in old list: if it's removed or not
  while (i < oldList.length) {
    item = oldList[i]
    itemKey = getItemKey(item, key)
    if (itemKey) {
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null)
      } else {
        var newItemIndex = newKeyIndex[itemKey]
        children.push(newList[newItemIndex])
      }
    } else {
      var freeItem = newFree[freeIndex++]
      children.push(freeItem || null)
    }
    i++
  }

  var simulateList = children.slice(0)

  // remove items no longer exist
  i = 0
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i)
      removeSimulate(i)
    } else {
      i++
    }
  }

  // i is cursor pointing to a item in new list
  // j is cursor pointing to a item in simulateList
  var j = i = 0
  while (i < newList.length) {
    item = newList[i]
    itemKey = getItemKey(item, key)

    var simulateItem = simulateList[j]
    var simulateItemKey = getItemKey(simulateItem, key)

    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++
      } else {
        // new item, just inesrt it
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          insert(i, item)
        } else {
          // if remove current simulateItem make item in right place
          // then just remove it
          var nextItemKey = getItemKey(simulateList[j + 1], key)
          if (nextItemKey === itemKey) {
            remove(i)
            removeSimulate(j)
            j++ // after removing, current j is right, just jump to next one
          } else {
            // else insert item
            insert(i, item)
          }
        }
      }
    } else {
      insert(i, item)
    }

    i++
  }

  function remove (index) {
    var move = {index: index, type: 0}
    moves.push(move)
  }

  function insert (index, item) {
    var move = {index: index, item: item, type: 1}
    moves.push(move)
  }

  function removeSimulate (index) {
    simulateList.splice(index, 1)
  }

  return {
    moves: moves,
    children: children
  }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree (list, key) {
  var keyIndex = {}
  var free = []
  for (var i = 0, len = list.length; i < len; i++) {
    var item = list[i]
    var itemKey = getItemKey(item, key)
    if (itemKey) {
      keyIndex[itemKey] = i
    } else {
      free.push(item)
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  }
}

function getItemKey (item, key) {
  if (!item || !key) return void 666
  return typeof key === 'string'
    ? item[key]
    : key(item)
}

exports.makeKeyIndexAndFree = makeKeyIndexAndFree // exports for test
exports.diff = diff

},{}],12:[function(require,module,exports){
window.vt = require('./index.js');
},{"./index.js":1}]},{},[12]);
