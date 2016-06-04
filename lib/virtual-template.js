var svd = require('s-virtual-dom');
var tmp = require('mini-template');
var _ = require('./util');

function render(){
	// var htmlStr = tmp(this.tpl, this.data);

	var htmlNode = t2h(this.tpl, this.container);

	this.virtualDom = h2v(htmlNode);
}
function setState(data){
	_.extend(this.data, data);

	// var newHtmlStr = tmp(this.tpl, this.data);

	var newHtmlNode = t2h(this.tpl, this.container);

	var newVirtualDom = h2v(newHtmlNode);

	vDiff(this.virtualDom, newVirtualDom);

}

function t2h(tpl, root){
	var str = tmp(tpl, this.data);

	root.innerHTML = str;
	return root.children;
}
function h2v(htmlNode){
	var root = document.createElement('div');

	if(htmlNode.length === 1){
		var root = htmlNode[0]; 
	}else{
		var root = root;
	}

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
			// var virtualChild = node.nodeValue ?
			// 					node.nodeValue :
			// 					node.textContent;
			
		}else{
			var virtualChild = toVirtualDom(child);
		}
		
		virtualChildArr.push(virtualChild);
	})
	var children = virtualChildArr;
	
	return new el(tagName, props, children);
}
function setPropObj(attrArr){
	var attrObj = {};
	_.each(attrArr, function(attr, i){
		var attrName = attr.name;
		var attrValue = attr.value;
		attrObj[attrName] = attrValue;
	})
	return attrObj;
}
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
		render: render,
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

