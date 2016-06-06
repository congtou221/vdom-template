var svd = require('s-virtual-dom');
var tmp = require('mini-template');
var _ = require('./util');

function init(){
	// init view
	var htmlStr = t2s(this.tpl);
	var htmlNode = s2h(htmlStr);

	// save virtualDom
	this.virtualDom = h2v(htmlNode, htmlStr);

}
function setState(data){
	_.extend(this.data, data);

	var newHtmlStr = t2s(this.tpl);

	var newHtmlNode = s2h(newHtmlStr, true);

	var newVirtualDom = h2v(newHtmlNode, newHtmlStr);

	vDiff(this.virtualDom, newVirtualDom);

}

// conver template to string
function t2s(tpl){
	return tmp(tpl, this.data);
}	
// convert string to htmlNode
function s2h(str, isUpdate){

	var root = isUpdate ?
				document.createElement('div') :
				this.container;
	


	root.innerHTML = str;

	return root.children;
}

// convert htmlNode to vritualDom
function h2v(htmlNode, htmlStr){

	// firstly, choose a root node
	var root = document.createElement('div');
	root.innerHTML = htmlStr;

	if(htmlNode.length === 1){
		var root = htmlNode[0]; 
	}else{
		var root = root;
	}

	// secondly, convert the next
	return toVirtualDom(root);


}

function toVirtualDom(node){
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
			var virtualChild = toVirtualDom(child);
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

