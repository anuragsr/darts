var DartMaker = function(){	
	return {
		isMobile: function(){
            if(window.innerWidth <= 700){
                return true;
            }
            else {
                return false;
            }
        },
        isTablet: function(){
            if(window.innerWidth <= 1024 && window.innerWidth > 700){
                return true;
            }
            else {
                return false;
            }   
        },
		getFrameHeight: function(){
			if(this.isMobile()){
				return 350;
			}else if(this.isTablet()){
				return 500;
			}else{
				return 768;
			}
		},
		getMarkerSize: function(){
			if(this.isMobile()){
				return 20;
			}else if(this.isTablet()){
				return 10;
			}else{
				return 7;
			}
		},
		getJSON: function(){
			var obj = {
				"image_width": Math.round(this.drawnWidth),
				"image_height": Math.round(this.drawnHeight),
				"points":[]
			}
			var self = this;
			this.grArr.forEach(function(x){
				obj.points.push({
					"X": x.x<0?0:self.getDecimal(x.x + self.len/2),
					"Y": x.y<0?0:self.getDecimal(x.y + self.len/2)
				})
			})

			return obj;
		},
		getDecimal: function(num){
			return Math.round(num * 100) / 100;
		},
		getDistance: function(gr1, gr2){
			return Math.sqrt(Math.pow(gr1.x - gr2.x, 2) + Math.pow(gr1.y - gr2.y, 2))
		},
		toggleAdd: function(val){			
			this.parent.css({
				"cursor" : val?"crosshair":"default"
			});
			this.addEnabled = val;
		},
		toggleDel: function(val){			
			this.grArr.forEach(function(obj){
				obj.cursor = val?"not-allowed":"move";
			})
			// this.parent.css({
			// 	"cursor" : val?"not-allowed":"default"
			// });
			this.delEnabled = val;
		},
		getPoints: function(width, height){
			var radius = Math.min(width, height)/4;				
		    var newarr = [], retArr= [], self = this;

		    // Get n random darts
			// while(newarr.length < this.noDarts){
			//     var randomnumber = Math.random()*2*Math.PI;
			//     if(newarr.indexOf(randomnumber) > -1) continue;
			//     newarr[newarr.length] = randomnumber;
			// }
			// newarr.sort().forEach(function(x){
			// 	retArr.push({
			// 		x: self.getDecimal(width/2 + radius*Math.cos(x)),
			// 		y: self.getDecimal(height/2 + radius*Math.sin(x))
			// 	})
			// })

			//  Get n equidistant darts
			var angle = 2*Math.PI/this.noDarts;
			for(var i = 0; i < this.noDarts; i++){
				var x = angle*i - Math.PI/2;
				retArr.push({
					x: self.getDecimal(width/2 + radius*Math.cos(x)),
					y: self.getDecimal(height/2 + radius*Math.sin(x))
				})
			}
			return retArr;
		},
		getLastPoints: function(){
			var ptArr = JSON.parse(localStorage.getItem("points"));
			var prevWidth = JSON.parse(localStorage.getItem("dimensions")).width;
			var prevHeight = JSON.parse(localStorage.getItem("dimensions")).height;
			var hRat = this.drawnWidth/prevWidth;
			var wRat = this.drawnHeight/prevHeight;
			ptArr.forEach(function(obj){
				obj.x = obj.x*wRat;
				obj.y = obj.y*hRat;
			}) 
			return ptArr;
		},
		init: function(opts){
			this.img = opts.img;
			this.parent = opts.parent;
			this.el = opts.el;
			this.noDarts = opts.noDarts || 20;
			this.lineColor = opts.lineColor || 0xffffff;
			this.addEnabled = opts.addEnabled;
			this.delEnabled = opts.delEnabled;
			var self = this;
			
			(function($,sr){
			 	var debounce = function (func, threshold, execAsap) {
					var timeout;

					return function debounced () {
						var obj = this, args = arguments;
						function delayed () {
						  	if (!execAsap)
						     	func.apply(obj, args);
						  	timeout = null; 
						};

						if (timeout)
						  	clearTimeout(timeout);
						else if (execAsap)
						  	func.apply(obj, args);

						timeout = setTimeout(delayed, threshold || 100); 
					};
			  	}
			    // smartresize 
			    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

			})(jQuery,'smartresize');

			$(window).smartresize(function(){  
			  	var	points = [];
		  		self.grArr.forEach(function(x){
					points.push({
						x: x.x<0?0:self.getDecimal(x.x + self.len/2),
						y: x.y<0?0:self.getDecimal(x.y + self.len/2)
					})
				})
				
				localStorage.setItem("points", JSON.stringify(points));
				localStorage.setItem("dimensions", JSON.stringify({
					width: self.drawnWidth,
					height: self.drawnHeight
				}));

				self.processImg(false)
			});

			this.processImg(true);
		},
		processImg: function(toDraw){

			var frWidth = this.parent.width();
			var frHeight = this.getFrameHeight();
			
			var self = this;			
			var image = new Image();
			image.src = this.img;

			image.onerror = function(err){
				alert('That file was not found. Please try another one.');
			}

			image.onload = function(){
				var natWidth = this.naturalWidth;
				var natHeight = this.naturalHeight;
				self.naturalWidth = natWidth;
				self.naturalHeight = natHeight;
				var ratio = 1;
				if(natWidth > natHeight){
					//Landscape
					if(natWidth >= frWidth){
						ratio = frWidth / natWidth;
						self.ratio = ratio;
					}					
					self.drawBg(this.src, natWidth*ratio, natHeight*ratio);
				}else{
					// Portrait
					if(natHeight >= frHeight){
						ratio = frHeight / natHeight;
						self.ratio = ratio;
					}
					self.drawBg(this.src, natWidth*ratio, natHeight*ratio);
				}
				self.drawnWidth = natWidth*ratio;
				self.drawnHeight = natHeight*ratio;
				if(toDraw)
					self.createPolygon(self.getPoints(self.drawnWidth, self.drawnHeight));
				else{
					self.createPolygon(self.getLastPoints());
				}
			}
		},
		drawBg: function(src, width, height){
			if(typeof this.app !== "undefined"){
				this.app.view.remove();
				this.app.destroy();
			}

			var app = new PIXI.Application(width, height, {
				transparent:true,
				antialias:true
			});

			this.el.width(width);			
			this.el.height(height);
			this.parent.height(height);
			this.el.append(app.view);
			this.el.css("background-image", "url(" + src + ")");
			this.el.css("background-size", "100% 100%");

			// Empty graphic for mousedown events
			var bg = new PIXI.Graphics();
    	    bg.lineStyle(0, this.lineColor);
    	    bg.beginFill(this.lineColor, 0);
    	    bg.drawRect(0, 0, width, height);
    	    bg.endFill();   	   
		    bg.interactive = true;

			this.app = app;
			this.stage = app.stage;			
		    this.stage.addChild(bg);		    
		    
		    var self = this;
		    bg.on('pointerdown', function(mouseData){
		    	if(self.addEnabled){
		    		if(self.grArr.length == 50){
		    			alert('No more than 50 darts can be added!')
		    		}else{		    			
			    		var tmpGr = self.drawDart(mouseData.data.global);
			    		self.addNexttoNearest(tmpGr);
			    		self.moveDarts();
		    		}
		    	}
		    })
		    
		},
		addNexttoNearest: function(dart) {

			this.grArr.splice(this.grArr.length - 1, 1);
			var self = this
			,tempArr = this.grArr.slice()
			,retIdx = 0
			,min = this.getDistance(dart, tempArr[0])
			,nearest1 = tempArr[0]
			,nearest2
			,nearest2
			,idx1
			,idx2
			,dist
			;

			tempArr.forEach(function(point, idx){
				dist = self.getDistance(dart, point);
				if(dist < min){
					min = dist;
					retIdx = idx;
					nearest1 = point;
				}
			})
			idx1 = this.grArr.indexOf(nearest1)
			
			tempArr.splice(retIdx, 1);
			min = this.getDistance(dart, tempArr[0]);
			nearest2 = tempArr[0];
			tempArr.forEach(function(point, idx){
				dist = self.getDistance(dart, point);
				if(dist < min){
					min = dist;					
					nearest2 = point;
				}
			})
			idx2 = this.grArr.indexOf(nearest2)

			// console.log("Nearest1")
			// console.log({x:nearest1.x, y:nearest1.y })
			
			// console.log("Nearest2")
			// console.log({x:nearest2.x, y:nearest2.y })
			
			if(idx1 == 0){
				if(idx2 == this.grArr.length - 1){
					this.grArr.splice(this.grArr.length, 0, dart);					
				}else{
					this.grArr.splice(1, 0, dart);					
				}
			}else if(idx2 == 0){
				if(idx1 == this.grArr.length - 1){
					this.grArr.splice(this.grArr.length, 0, dart);					
				}else{
					this.grArr.splice(1, 0, dart);					
				}
			}else{
				this.grArr.splice(Math.min(idx1, idx2)+1, 0, dart);
			}
		},
		createPolygon: function(points){
			var arr = points;
			var polyGonArr = [];
			this.grArr = [];			

         	for(var i = 0; i < arr.length; i++){
				this.drawDart(arr[i]);
            	polyGonArr.push(arr[i].x, arr[i].y);
            }	
        	polyGonArr.push(arr[0].x, arr[0].y);
        	
        	if(typeof this.poly !== "undefined"){
        		this.poly.destroy();
        	}
			var poly = new PIXI.Graphics();
            poly.lineStyle(2, this.lineColor);
            poly.beginFill(this.lineColor, 0);
            poly.drawPolygon(polyGonArr);
            poly.endFill();
            this.poly = poly;             
            this.stage.addChild(poly);
		},
		drawDart: function(coords){
    	    var len = this.getMarkerSize();
    	    var graphics = new PIXI.Graphics();
    	    graphics.lineStyle(2, this.lineColor);
    	    graphics.beginFill(this.lineColor, 0);
    	    graphics.drawRect(0, 0, len, len);
    	    graphics.endFill();
    	    graphics.x = coords.x - len/2;
    	    graphics.y = coords.y - len/2;
    	    this.len = len;
		    graphics.interactive = true;
		    graphics.cursor = "move";

		    this.grArr.push(graphics);		    
			this.stage.addChild(graphics);

		    graphics
		    .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
        	.on('pointerupoutside', onDragEnd)
        	.on('pointermove', onDragMove)
		    ;

		    var self = this;
		    function onDragEnd(event){
	    	    this.alpha = 1;
			    this.dragging = false;
			    // set the interaction data to null
			    this.data = null;
		    }
		    function onDragMove(event){
    	    	if (this.dragging){
			        var newPosition = this.data.getLocalPosition(this.parent);
			        if(newPosition.x + self.len/2 >= 0 && newPosition.x + self.len/2 <= self.drawnWidth)
			        	this.position.x = newPosition.x;
			        if(newPosition.y + self.len/2 >= 0 && newPosition.y + self.len/2 <= self.drawnHeight)
			        	this.position.y = newPosition.y;
			        self.moveDarts();
			    }
		    }
		    function onDragStart(event){
		    	if(!self.addEnabled && !self.delEnabled){		    		
				    // store a reference to the data
				    // the reason for this is because of multitouch
				    // we want to track the movement of this particular touch
				    this.data = event.data;
				    this.alpha = 0.5;
				    this.dragging = true;
		    	}else {
			    	if(self.addEnabled){
			    		alert('Please disable add darts option to move the darts!');
			    	}

			    	if(self.delEnabled){
			    		if(self.grArr.length == 5){
			    			alert('No less than 5 darts are allowed!')
			    		}else if (confirm('Are you sure you wish to delete this dart?')){			    		
				    		var idx = self.grArr.indexOf(this);
				    		self.grArr.splice(idx, 1);
				    		this.destroy();
				    		self.moveDarts();
			    		}
			    	}
		    	}
			}

			return graphics;
		},
		moveDarts: function(){
    		this.poly.destroy();

            var arr = this.grArr;
            var poly = new PIXI.Graphics();
            var polyGonArr = [];
         	for(var i = 0; i < arr.length; i++){
            	polyGonArr.push(arr[i].x + this.len/2, arr[i].y + this.len/2);
            }	
        	polyGonArr.push(arr[0].x + this.len/2, arr[0].y + this.len/2);

			var poly = new PIXI.Graphics();
            poly.lineStyle(2, this.lineColor);
            poly.beginFill(this.lineColor, 0);
            poly.drawPolygon(polyGonArr);
            poly.endFill();
			
			this.poly = poly;
            this.stage.addChild(poly);
		}
	}
}