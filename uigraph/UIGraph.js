/**
 * UIGraph is a mootools class that renders a linear graph on a canvas, 
 * using cubic spline calculation to render smooth curves.
 * 
 * UIGraph requires Mootools Class, Events etc
 * 
 * @author Nick Blackwell - https://people.ok.ubc.ca/nblackwe
 * 
 */

var UIGraph=new Class({
	Implements:Events,
	initialize:function(element,data,options){
		var me=this;
		me.options=Object.merge({},{
			
			classNamePrefix:'Graph_',
			title:"Pie Chart",
			graphTemplate:UIGraph.DefaultGraphTemplate,
			pointsTemplate:UIGraph.DefaultPointsTemplate,
			titleTemplate:UIGraph.DefaultTitleTemplate,
			width:1500,
			height:700,
			padding:50,
			lineColor:"blue",
			pointColors:[function(data){
				var me=this;
				return "rgba("+Math.round((256*(me.data.indexOf(data)/me.data.length)))+",16,16,0.4)";
			}]
			
		},options);
		if(me.options.onAddedPoint){
			me.addEvent('onAddedPoint',me.options.onAddedPoint);
		}
		me.data=[];
		me.element=element;
		
		me.options.titleTemplate.bind(me)(me.options.title);
		
		me.maxValue=0;
		if(data&&data.length){
			Array.each(data,function(v){
				var d=parseFloat(v);
				if(me.maxValue<(d.value||d.y||d))me.maxValue=(d.value||d.y||d);
				me.data.push(d);
			});
	
			
			
		}
		
		
		if(me.options.graphTemplate)me.options.graphTemplate.bind(me)(element);
		
		
		if(data&&data.length){
			me.drawPoints(me.data);
		}
		
		me.isLoaded=true;
		
		
	},
	drawPoints:function(data){
		var me=this;
		me.options.pointsTemplate.bind(me)(data,{});
	},
	getWidth:function(padding){
		return (this.options.width||400)-(padding?0:2*(this.options.padding||0));
	},
	getHeight:function(padding){
		return (this.options.height||300)-(padding?0:2*(this.options.padding||0));
	},
	getYPixel:function(y){
		var me=this;
		if((y==null)){
			console.trace(); throw 'Invalid Y';
			}
		var value=me.getHeight()*(1-y/me.maxValue)+(this.options.padding||0);
		//JSConsole(['Y pixel', y, value]);
		return value;

	},
	getXPixel:function(x){
		var me=this;
		if((x==null)){
			console.trace(); throw 'Invalid X';
		}
		var value=me.getWidth()/(me.data.length-1)*x+(me.options.padding||0);
		//JSConsole(['X pixel', x, value]);
		return value;
	},
	drawLinearLine:function(from, to, options){
		var me=this;
		var context=me.context;
		context.beginPath();
		context.moveTo(from[0],from[1]);
		context.lineTo(to[0],to[1]);
		context.strokeStyle = options.strokeStyle||me.options.lineColor||"#441d1d";
		
		context.stroke();		
	},
	drawCurve:function(from, to, Fx, options){
		var me=this;
		var config=Object.append({context:me.context, beginPath:true, stroke:true},options);
		var context=config.context;
		if(config.beginPath)context.beginPath();
		
		context.moveTo(from[0],from[1]);
		
		//var count=Math.round((to[0]-from[0])/(options.step||1.0)); //pixel steps
	
		var c=from[0]+(options.step||1.0);
		while(c<to[0]){
			var v=Fx(c);
			//JSConsole([c,v]);
			context.lineTo(c,v);
			c+=(options.step||1.0);
		}
		
		context.lineTo(to[0],to[1]);
		if(config.stroke){
		context.strokeStyle = options.strokeStyle||me.options.lineColor||"#441d1d";
		context.stroke();		
		}
	}
	
	
	
});

UIGraph.DefaultGraphTemplate=function(element){
	
	var me=this;
	//var height=me.options.height||250;
	//var width=me.options.width||400;
	var canvas=new Element('canvas',{width:me.getWidth(true), height:me.getHeight(true)});
	canvas.innerHTML="<p>your browser sucks.</p>";
	element.appendChild(canvas);
	var context = canvas.getContext('2d');

	me.context=context;
	

};


UIGraph.HorizontalBarsGraphTemplate=function(element){
	
	var me=this;
	//var height=me.options.height||250;
	//var width=me.options.width||400;
	var canvas=new Element('canvas',{width:me.getWidth(true), height:me.getHeight(true)});
	canvas.innerHTML="<p>your browser sucks.</p>";
	element.appendChild(canvas);
	var context = canvas.getContext('2d');
/*	context.strokeStyle = "#000000";
	context.beginPath();
	context.arc(center,center,rad,startAngle,startAngle+Math.PI*2,!clockwise);
	
	context.closePath();
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 6;
	context.shadowColor = "#555555";
	var grd = context.createLinearGradient(0, 0, 0, length);
	grd.addColorStop(0, "white"); // light blue
    grd.addColorStop(1, "lightGray"); // dark blue
    context.fillStyle = grd;
	
    context.stroke();
	context.fill(); */
	
	me.context=context;
	
	
	context.beginPath();
	context.strokeStyle = "rgba(255,255,255,1)";
	//context.lineWidth = 1;
	
	context.moveTo(me.getXPixel(0),me.getYPixel(0));
	context.lineTo(me.getXPixel(0),me.getYPixel(me.maxValue));
	context.lineTo(me.getXPixel(me.data.length-1),me.getYPixel(me.maxValue));
	context.lineTo(me.getXPixel(me.data.length-1),me.getYPixel(0));
	context.lineTo(me.getXPixel(0),me.getYPixel(0));
	context.stroke();
	
	if(me.maxValue){
		
		//basically want to get the best unit 1, 10, 100 etc that divides the graph
		var unit=me.maxValue/5;
		//var x=Math.round(Math.log(1.0/unit)/Math.log(10));
		
		//var ru=Math.round(unit*Math.pow(10,x))/Math.pow(10, x);
		//JSConsole([unit,x,ru]);
		
	
		var u=(unit);
		var v=u;
		while (v<me.maxValue){
			context.beginPath();
			context.moveTo(me.getXPixel(0),me.getYPixel(v));
			context.lineTo(me.getXPixel(me.data.length-1),me.getYPixel(v));
			context.stroke();
			
			v+=u;
		}
	
	
	
	}
	
	
	
};


UIGraph.DefaultPointsTemplate=function(data, options){
	var me=this;

	var last=false;
	/*
	Array.each(me.data,function(d,i){
		if(i>1){
			var from=[me.getXPixel(last[0]),me.getYPixel(last[1])];
			var to=[me.getXPixel(i),me.getYPixel(d.value||d.y||d)];
			me.drawLinearLine(from,to,{});
			
			
		}
		last=[i,(d.value||d.y||d)];
	});	
	*/
	var cSpline=UIGraph.CalculateNaturalCubicSpline.bind(me)(data);
	me.context.beginPath;
	Array.each(me.data,function(d,i){
		if(i>0){
			var from=[me.getXPixel(last[0]),me.getYPixel(last[1])];
			var to=[me.getXPixel(i),me.getYPixel(d.value||d.y||d)];
			var j=i-1;
			
			me.drawCurve(from,to,
					function(x){
					
					
					var value=cSpline.a[j]+cSpline.b[j]*(x-me.getXPixel(j))+cSpline.c[j]*Math.pow((x-me.getXPixel(j)),2)+cSpline.d[j]*Math.pow((x-me.getXPixel(j)),3);
					//x will be a pixel position, so make sure Xj is also.
					//JSConsole(['Spline ',value, x, j, me.getXPixel(j),cSpline.a[j], cSpline.b[j]]);
					return value;
					},
					{stroke:false, beginPath:false});
			
			
		}
		last=[i,(d.value||d.y||d)];
	});	
	me.context.strokeStyle = options.strokeStyle||me.options.lineColor||"#441d1d";
	//me.context.fill();
	me.context.stroke();
};



UIGraph.DefaultTitleTemplate=function(title){
	var me=this;
	if(!me.titleEl){
	me.titleEl=new Element('div',{'class':me.options.classNamePrefix+'Title'});
	me.element.appendChild(me.titleEl);
	}
	me.titleEl.innerHTML=title;
};

UIGraph.DefaultLabels=function(){
	
};

UIGraph.CalculateNaturalCubicSpline=function(data){
	//Algorithm 3.4 Numerical Analysis 8th Ed. 
	

	
	var me=this;
	var x=[];
	var a=[];
	var n=data.length-1;
	Array.each(data,function(d,i){
		var xA=me.getXPixel(d.x||i); 
		var aA;
		if(typeOf(d)=='string'){
			aA=parseFloat(me.getYPixel(d));
		}else if(typeOf(d)=='number'){
			aA=me.getYPixel(d);
		}else if(typeOf(d)=='object'){
			aA=me.getYPixel(d.y||d.value);
		}else{
			throw 'Invalid Data Point - Expected [numeric string, number, object{y|value}]';
		}
		
		x.push(xA);  a.push(aA); 
		

		//assume object of [{x:number,y:number},...] values or indexed array of values (and x is arbitrary.) [{value:number, ...},{},...]
	});
	
	//step 1
	var i=0;
	var h=[];
	for(i=0;i<n;i++){
		h[i]=(x[i+1]-x[i]);
	}
	//step 2
	var alpha=[];
	for(i=1;i<n;i++){
		alpha[i]=((3.0/h[i])*(a[i+1]-a[i])   -  (3.0/h[i-1])*(a[i]-a[i-1]));
	}
	
	//step 3
	var l=[1.0];
	var u=[0.0];
	var z=[0.0];
	
	//step 4
	for(i=1;i<n;i++){
		l[i]=2.0*(x[i+1]-x[i-1])   -   h[i-1]*u[i-1];
		u[i]=h[i]/l[i];
		z[i]=(alpha[i]-h[i-1]*z[i-1])/l[i];
	}
	
	//step 5
	var b=[];
	var c=[];
	var d=[];
	
	l[n]=1.0;
	c[n]=0.0;
	z[n]=0.0;
	
	//step 6
	var j=n-1;
	for(j=n-1;j>-1;j--){
		c[j]=z[j]-u[j]*c[j+1];
		b[j]=(a[j+1]-a[j])/h[j]   -   h[j]*(c[j+1]+2.0*c[j])/3.0;
		d[j]=(c[j+1]-c[j])/(3.0*h[j]);
	}
	//JSConsole(['spline',{returns:{a:a,b:b,c:c,d:d},other:{n:n,a:a,x:x,h:h,alpha:alpha,l:l,u:u,z:z}}]);
	return {a:a,b:b,c:c,d:d};
};













