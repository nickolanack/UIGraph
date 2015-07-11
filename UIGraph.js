/**
 * Canvas based graph rendering class.
 * 
 * new UIGraph(graphBarDetail, data, {
 *    // lineTemplate:UIGraph.UnitStepTemplate,
 *    // lineTemplate:UIGraph.LineTemplate,
 *    height:200,
 *    width:900,
 *    padding:0, //pads the canvas area, the actual graph area will be smaller than 900x200 if set
 *    lineColor: 'black',
 *    // fillColor:'rgb(179, 209, 255)' //default, no fill
 *   });
 * 
 */

var UIGraph=new Class({
	Implements:Events,
	initialize:function(element,data,options){
		var me=this;
		me.options=Object.append({
			
			classNamePrefix:'Graph_',
			title:"",
			graphTemplate:UIGraph.DefaultGraphTemplate,
			lineTemplate:UIGraph.CubicSplineTemplate,
			
			titleTemplate:UIGraph.DefaultTitleTemplate,
			width:1500,
			height:700,
			padding:50,
			lineColor:"blue",
			fillColor:false,
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
			Array.each(data,function(v, x){
				var y=parseFloat(v);
				if(me.maxValue<y)me.maxValue=y;
				me.data.push({x:x, y:y});
			});
	
			
			
		}
		
		
		if(me.options.graphTemplate)me.options.graphTemplate.bind(me)(element);
		
		
		if(data&&data.length){
			me._render(me.data);
		}
		
		me.isLoaded=true;
		
		
	},
	_render:function(data){
		var me=this;
		me._path=new Path2D();
		var start=me.getXYPixels([data[0].x, data[0].y]);
		me._path.moveTo(start[0], start[1]);
		me.options.lineTemplate.bind(me)(data,{});
		
		if(me.options.fillColor){
		
			//can close the box along y=0.
			var area=new Path2D(me._path);
			//var br=me.getXYPixels([data.length-1,-1]);
			//var bl=me.getXYPixels([0,-1]);
			
			//area.lineTo(br[0], br[1]);
			//area.lineTo(bl[0], bl[1]);
			area.closePath()
			
			me.context.fillStyle = me.options.fillColor;
			me.context.fill(area);
		}
		
		me.context.strokeStyle = me.options.lineColor||"#441d1d";
		me.context.stroke(me._path);	
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
	getXYPixels:function(xy){
		var me=this;
		return [me.getXPixel(xy[0]), me.getYPixel(xy[1])];
	},
	
	drawLinearLine:function(from, to, options){
		var me=this;
		
		me._path.lineTo(to[0],to[1]);
			
	},
	drawCurve:function(from, to, Fx){
		var me=this;

		//var count=Math.round((to[0]-from[0])/(options.step||1.0)); //pixel steps
		var step=1.0;
		var c=from[0]+step;
		while(c<to[0]){
			var v=Fx(c);
			//JSConsole([c,v]);
			me._path.lineTo(c,v);
			c+=step;
		}
		
		me._path.lineTo(to[0],to[1]);
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




UIGraph.CubicSplineTemplate=function(data, options){
	var me=this;

	var last=false;
	var cSpline=UIGraph.CalculateNaturalCubicSpline.bind(me)(data);
	Array.each(me.data,function(d, i){
		if(i>0){
			var from=[me.getXPixel(last[0]),me.getYPixel(last[1])];
			var to=[me.getXPixel(d.x),me.getYPixel(d.y)];
			var j=i-1;
			
			me.drawCurve(from,to,
					function(x){
					
					
					var value=cSpline.a[j]+cSpline.b[j]*(x-me.getXPixel(j))+cSpline.c[j]*Math.pow((x-me.getXPixel(j)),2)+cSpline.d[j]*Math.pow((x-me.getXPixel(j)),3);
		
					return value;
					});
			
			
		}
		last=[d.x,d.y];
	});	

};

UIGraph.LineTemplate=function(data, options){
	var me=this;

	var last=false;
	
	Array.each(me.data,function(d,i){
		if(i>1){
			var from=[me.getXPixel(last[0]),me.getYPixel(last[1])];
			var to=[me.getXPixel(d.x),me.getYPixel(d.y)];
			me.drawLinearLine(from,to,{});
			
			
		}
		last=[d.x,d.y];
	});	
	

};

UIGraph.UnitStepTemplate=function(data, options){
	var me=this;

	var last=false;
	
	Array.each(me.data,function(d,i){
		if(i>1){
			
			var yFrom=me.getYPixel(last[1]);
			var yTo=me.getYPixel(d.y);
			var xTo=me.getXPixel(d.x)
			var from=[me.getXPixel(last[0]),yFrom];
			var to=[xTo,yFrom];
			me.drawLinearLine(from,to,{});
			
			if(yFrom!=yTo){
				me.drawLinearLine(to,[xTo, yTo],{});
			}

		}
		last=[d.x,d.y];
	});	
	

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
		var xA=me.getXPixel(d.x); 
		var yA=me.getYPixel(d.y);
		
		
		x.push(xA);  a.push(yA); 
		

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













