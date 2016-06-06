var svd = require('s-virtual-dom');
var tmp = require('mini-template');
var _ = require('./util');

function init(){
	// init view
	var htmlStr = t2s();
	var htmlNode = s2h(htmlStr);

	// save virtualDom
	this.virtualDom = h2v(htmlNode);

}
function setState(data){
	_.extend(this.data, data);

	var newHtmlStr = t2s();

	var newHtmlNode = s2h(newHtmlStr, true);

	var newVirtualDom = h2v(newHtmlNode);

	vDiff(this.virtualDom, newVirtualDom);

	this.virtualDom = newVirtualDom;

}

// conver template to string
function t2s(){
	return tmp(this.tpl, this.data);
}	
// convert string to htmlNode
function s2h(str, isUpdate){
	var tempContainer = document.createElement('div');
	tempContainer.setAttribute('id','container');

	var root = isUpdate ?
				tempContainer :
				this.container;

	root.innerHTML = str;

	return root;
}

// convert htmlNode to virtualDom
function h2v(node){
	var el = svd.el;
	var tagName = node.tagName.toLowerCase();
	var props = setPropObj(node.attributes);		

	var virtualChildArr = [];
	_.each(node.childNodes, function(child){
		if(child.nodeType === 3){
			// why
			if(child.nodeValue){
				var virtualChild = child.nodeValue;
			}else{
				var virtualChild = child.textContent;
			}
			
		}else{
			var virtualChild = h2v(child);
		}
		
		virtualChildArr.push(virtualChild);
	})
	var children = virtualChildArr;
	
	return new el(tagName, props, children);
}
// convert props array to props obj
function setPropObj(attrArr){
	var attrObj = {};
	_.each(attrArr, function(attr, i){
		var attrName = attr.name;
		var attrValue = attr.value;
		attrObj[attrName] = attrValue;
	})
	return attrObj;
}

// update view with new virtualDom
function vDiff(virtualDom, newVirtualDom){
	var diff = svd.diff;
	var patch = svd.patch;


	var patches = diff(virtualDom, newVirtualDom);
	patch(this.container, patches);

}

function makeVirTemplateClass(){
	function virTemplateClass(tpl, container, data){
		this.data = data;
		this.tpl = tpl;
		this.container = container;		
	
	}
	_.extend(virTemplateClass.prototype, {
		init: init,
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

