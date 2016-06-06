var t2h = vt.t2h;

var data = {
			'name': 'Mary', 
			'age': 21,
			'sex': 'girl', 
			'home': 'Beijing',
			'tags':['文艺','美术爱好者','内敛','务实','进取心','吃货','修炼中']
			};
var tpl = document.getElementById("template-id").innerHTML;	

var container = document.getElementById("container");

var virTemplate = t2h(tpl, container, data);

virTemplate.init();

// var count = 10;
// var cancel = setInterval(function(){
// 	while(count === 0){
// 		clearInterval(cancel);
// 	}
// 	count--;

	// var data = virTemplate.data.tags.push(Math.random());
	var data = {'tags':[]};
	virTemplate.setState(data);
// }, 1000);

