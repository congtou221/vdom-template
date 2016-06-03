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