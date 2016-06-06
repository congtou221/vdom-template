var t2h = vt.t2h;

var data = {
			'name': 'Mary', 
			'age': 21,
			'sex': 'girl', 
			'home': 'Beijing',
			'tags':['文艺','美术爱好者','内敛','务实','进取','吃货','修炼中']
			};
var tpl = document.getElementById("template-id").innerHTML;	

var container = document.getElementById("container");

var virTemplate = t2h(tpl, container, data);

virTemplate.init();

var count = 0;
var cancle = setInterval(function(){

	if(count > 3){
		clearTimeout(cancle);
	}
	var random = Math.random();
	virTemplate.data.tags[virTemplate.data.tags.length] = random;

	virTemplate.setState(virTemplate.data);

	count++;
},1000)


