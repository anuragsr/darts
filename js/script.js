var DartMaker = function(){
	return {
		init: function(opts){
			var el = opts.el;
			var height = el.height();
			var width = el.width();
			var app = new PIXI.Application(width, height);
			el.append(app.view);

		    var bgEl = {url: "img/bg1.jpg"}
		    ,pic = PIXI.Sprite.fromImage(bgEl.url)
		    ;

		    pic.anchor.set(0.5);
		    pic.width = app.renderer.width;
		    pic.height = app.renderer.height;
		    pic.x = app.renderer.width / 2;
		    pic.y = app.renderer.height / 2;
		    // pic.interactive = true;
		    // pic.cursor = "crosshair"
		    app.stage.addChild(pic);
			this.stage = app.stage;
			this.renderer = app.renderer;
			this.drawDarts(width, height, opts.noDarts);
			this.addDart({x:100, y:100});
			// this.animate();

			// var self = this;						    
		 //    pic.mousedown = function(mouseData){     
		 //        self.addDart(mouseData.data.global);
		 //    }
		},
		drawDarts: function(width, height, no){
			console.log("Drawing : " + width + ", "+ height + ", No : " + no)
		},
		addDart: function(coords){
    	    console.log(coords)    	    
    	    var graphics = new PIXI.Graphics();
    	    var len = 50;
    	    graphics.lineStyle(2, 0xffffff);
    	    graphics.beginFill(0xffffff, 0);
    	    graphics.drawRect(0, 0, len, len);
    	    graphics.endFill();
    	    graphics.x = coords.x - len/2;
    	    graphics.y = coords.y - len/2;
		    graphics.interactive = true;
		    // graphics.buttonMode = true;
		    graphics.cursor = "move";
			this.stage.addChild(graphics);

		    graphics
		    .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
        	.on('pointerupoutside', onDragEnd)
        	.on('pointermove', onDragMove);
		    // .on('mouseup', onDragEnd)
		    // .on('mouseupoutside', onDragEnd)
		    // .on('touchend', onDragEnd)
		    // .on('touchendoutside', onDragEnd)
		    // .on('mousemove', onDragMove)
		    // .on('touchmove', onDragMove)
		    ;

		    function onDragEnd(event){
	    	    this.alpha = 1;
			    this.dragging = false;
			    // set the interaction data to null
			    this.data = null;
		    }
		    function onDragMove(event){
    	    	if (this.dragging)
			    {
			        var newPosition = this.data.getLocalPosition(this.parent);
			        this.position.x = newPosition.x;
			        this.position.y = newPosition.y;
			    }
		    }
		    function onDragStart(event){
			    // store a reference to the data
			    // the reason for this is because of multitouch
			    // we want to track the movement of this particular touch
			    this.data = event.data;
			    this.alpha = 0.5;
			    this.dragging = true;
			    // console.log(event)
			}
		},
		animate: function(){
			var self = this;
	        var draw = function () {
		    	self.renderer.render(self.stage);
	            window.requestAnimationFrame(draw);
	        }
	        draw();
		}
	}
}
// document.getElementById(sender.id).style.left = (sender.speed++) + 'px';
// var self = this;
// requestAnimationFrame( this.animate );
// $(function(){
// 	console.log("ready")
// 			console.log("init")


// })