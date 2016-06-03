var t2h = vt.t2h;

var data = [
			{'name': 'Mary', 'age': 21},
			{'name': 'Sara', 'age': 33},
			{'name': 'Kate', 'age': 28}
			];
var tpl = document.getElementById("template-id").innerHTML;	

var container = document.getElementById("container");

var virTemplate = t2h(tpl, container, data);

virTemplate.initDom();
