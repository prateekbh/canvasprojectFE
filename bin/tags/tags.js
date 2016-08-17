riot.tag2('gp-colorpicker', '<div class="colorlist"><div class="color" each="{color in colorList.concat(customColors)}"><div class="colordot" riot-style="background-color:{color}" onclick="{selectColor}"></div></div><div class="color"><div class="colordot new" onclick="{showColorWheel}"></div></div></div><div class="picker {ispickerShown?\'shown\':\'\'}"><div class="bg"></div><div class="wheelcontainer"><canvas id="picker" if="{showWheel}" height="300" width="{window.innerWidth}" ontouchmove="{getColor}" ontouchstart="{getColor}"></canvas><div class="selector" riot-style="background-color:{selectedColor}" onclick="{colorSelectionDone}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg></div></div></div>', '', '', function(opts) {
		var self=this;
		var context;
		var heightFactor=window.innerHeight-300;

		this.customColors=[];

		if(localStorage.customColors){
			self.update({customColors:JSON.parse(localStorage.customColors)});
		}

		this.colorList =["rgb(255,255,255)", "rgb(0,0,0)", "rgb(148,0,211)", "rgb(75,0,130)", "rgb(0,0,255)", "rgb(0,255,0)", "rgb(255,255,0)", "rgb(255,127,0)"];
		this.ispickerShown=false;
		this.pickerLeft=0;
		this.pickerTop=0;
		this.showWheel=false;
		this.selectedColor="tomato";

		function makeColorWheel(){
			var canvas = document.getElementById("picker");
			context = canvas.getContext("2d");
			var x = canvas.width / 2;
			var y = canvas.height / 2;
			var radius = 100;
			var counterClockwise = false;

			for(var angle=0; angle<=360; angle+=1){
			    var startAngle = (angle-2)*Math.PI/180;
			    var endAngle = angle * Math.PI/180;
			    context.beginPath();
			    context.moveTo(x, y);
			    context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
			    context.closePath();
			    var gradient = context.createRadialGradient(x, y, 0, x, y, radius);
				gradient.addColorStop(0,'hsl('+angle+', 10%, 100%)');
				gradient.addColorStop(1,'hsl('+angle+', 100%, 50%)');
			    context.fillStyle = gradient;
			    context.fill();
			}
			context.beginPath();
			context.moveTo(x, y);
			context.arc(x, y, radius/1.5, 0, 2*Math.PI);
			context.closePath();
			context.fillStyle = '#263238';
			context.fill();
		}

		this.on("mount",(e)=>{
			self.update({ispickerShown:false});
			setTimeout(function(){
				self.update({showWheel:true});
				makeColorWheel();
			},800);
		});

		this.selectColor=function(e){
			self.opts.onselectchange&&self.opts.onselectchange(e.target.style.backgroundColor);
		}

		this.showColorWheel=function(e){
			self.update({ispickerShown:true});
		}

		this.colorSelectionDone=function(e){
			var tempArr=self.customColors;
			tempArr.push(self.selectedColor);

			self.update({
				customColors:tempArr,
				ispickerShown:false
			});

			setTimeout(function(){
				localStorage.customColors=JSON.stringify(tempArr);
			},1);
		}

		this.getColor=function(e){
			var data=context.getImageData(e.touches[0].clientX, e.touches[0].clientY-heightFactor, 1, 1).data;
			if(!(data[0]===255&&data[1]===255&&data[2]===255)&&!(data[0]===38&&data[1]===50&&data[2]===56)&&!(data[0]===0&&data[1]===0&&data[2]===0)){
				self.update({selectedColor:'rgb('+data[0]+','+data[1]+','+data[2]+')'});
			}
		}
});
riot.tag2('gp-contriimage', '<img if="{loadedImagesCount===2}" riot-src="{opts.bgImage}" class="foreground" height="{opts.height}"></img><img if="{loadedImagesCount===2}" riot-src="{opts.editImage}" class="background" height="{opts.height}"></img><icon-pic></icon-pic>', '', '', function(opts) {
		this.loadedImagesCount=0;
		this.imgLoaded=function(e){
			self.update({loadedImagesCount:loadedImagesCount+1});
		}
});
riot.tag2('gp-draw', '<div class="canvascontainer"><canvas if="{showCanvas}" id="canvas" width="800" height="800"></canvas></div><div class="pbar" if="{isSaving}"><material-progressbar progress="{0.5}" moving="{true}"></material-progressbar></div><div if="{!isSaving}" class="controls {isControlsOpen?\'controlsshown\':\'\'}"><button class="btn-control colors" onclick="{showColors}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></button><button class="btn-control brush" onclick="{showBrushes}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"></path></svg></button><button class="btn-control save" onclick="{save}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></svg></button><button class="btn-control save" onclick="{save}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></svg></button><button class="btn-control publish" onclick="{publish}"><icon-publish></icon-publish></button><button class="btn-control options {isControlsOpen?\'controlsshown\':\'\'}" onclick="{openControls}"><svg class="firstleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg><svg class="secondleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></button></div><div class="bottomsheet {isBottomsheetShown?\'shown\':\'\'}"><button class="btn-control closesheet" onclick="{closeSheet}"><svg class="firstleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg><svg class="secondleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></button><div class="title">{sheetTitle}</div><div class="sheetcontent"><gp-colorpicker if="{currentControl===⁗PALLETE⁗}" onselectchange="{selectColor}"></gp-colorpicker><div class="brushlist" if="{currentControl===⁗BRUSHES⁗}"><div class="brushcontrol" each="{brush in brushesList}" onclick="{selectBrush}"> {brush} </div></div></div><material-dialog title="Publish image" shown="{isPublishPopupShown}" actions="{[\'CANCEL\',\'PUBLISH\']}" onaction="{popupaction}"><div><material-input placeholder="enter title" required valuechanged="{this.parent.changeTitle}"></material-input><material-input placeholder="enter description" required valuechanged="{this.parent.changeDesc}"></material-input></div></material-dialog></div>', '', '', function(opts) {
    var self = this;
    var imageActions = veronica.flux.Actions.getAction("ImageActions");
    var userStore = veronica.flux.Stores.getStore("UserStore");
    var imgStore = veronica.flux.Stores.getStore("ImageStore");

    this.brushesList = [
        "Simple Pencil",
        "Simple Brush",
        "Air Brush",
        "Slice Brush",
        "Radial Brush",
        "Pen Multi Stroke Brush",
        "Spray"
    ];

    this.isSaving = false;
    this.isControlsOpen = false;
    this.isBottomsheetShown = false;
    this.currentControl = "";
    this.sheetTitle = "";
    this.showingTitleInput = false;
    this.isPublishPopupShown = false;
    this.imgId = null;

    this.title="";
    this.description="";

    var el, ctx;
    var factor = 800 / window.innerWidth;
    var selectedBrush = "Simple Pencil";
    var currentColor = "rgb(0,0,0)";
    var lastPoint;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function startDraw(e) {
        e.clientX = e.touches[0].clientX * factor;
        e.clientY = (e.touches[0].clientY - 66) * factor;
        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.moveTo(e.clientX, e.clientY);
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 1;
        switch (selectedBrush) {
            case "Simple Pencil":
                ctx.lineWidth = 1;
                break;
            case "Simple Brush":
                ctx.lineWidth = 10;
                break;
            case "Air Brush":
                ctx.lineWidth = 10;
                ctx.shadowBlur = 10;
                ctx.shadowColor = currentColor;
                break;
            case "Pen Multi Stroke Brush":
            case "Slice Brush":
                ctx.lineWidth = 4;
                lastPoint = {
                    x: e.clientX,
                    y: e.clientY
                };
                break;
        }
    }

    function draw(e) {
        e.clientX = e.touches[0].clientX * factor;
        e.clientY = (e.touches[0].clientY - 66) * factor;
        switch (selectedBrush) {
            case "Radial Brush":
                var radgrad = ctx.createRadialGradient(e.clientX, e.clientY, 10, e.clientX, e.clientY, 20);
                radgrad.addColorStop(0, currentColor);
                radgrad.addColorStop(0.5, 'rgba(' + currentColor.substring(currentColor.indexOf('(') + 1, currentColor.indexOf(')')) + ',0.5)');
                radgrad.addColorStop(1, 'transparent');
                ctx.fillStyle = radgrad;
                ctx.fillRect(e.clientX - 20, e.clientY - 20, 40, 40);
                break;
            case "Pen Multi Stroke Brush":
                ctx.beginPath();
                ctx.moveTo(lastPoint.x - getRandomInt(0, 2), lastPoint.y - getRandomInt(0, 2));
                ctx.lineTo(e.clientX - getRandomInt(0, 2), e.clientY - getRandomInt(0, 2));
                ctx.stroke();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(e.clientX, e.clientY);
                ctx.stroke();
                ctx.moveTo(lastPoint.x + getRandomInt(0, 2), lastPoint.y + getRandomInt(0, 2));
                ctx.lineTo(e.clientX + getRandomInt(0, 2), e.clientY + getRandomInt(0, 2));
                ctx.stroke();
                lastPoint = {
                    x: e.clientX,
                    y: e.clientY
                };
                break;
            case "Slice Brush":
                ctx.beginPath();
                ctx.globalAlpha = 1;
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(e.clientX, e.clientY);
                ctx.stroke();
                ctx.moveTo(lastPoint.x - 4, lastPoint.y - 4);
                ctx.lineTo(e.clientX - 4, e.clientY - 4);
                ctx.stroke();
                ctx.moveTo(lastPoint.x - 2, lastPoint.y - 2);
                ctx.lineTo(e.clientX - 2, e.clientY - 2);
                ctx.stroke();
                ctx.moveTo(lastPoint.x + 2, lastPoint.y + 2);
                ctx.lineTo(e.clientX + 2, e.clientY + 2);
                ctx.stroke();
                ctx.moveTo(lastPoint.x + 4, lastPoint.y + 4);
                ctx.lineTo(e.clientX + 4, e.clientY + 4);
                ctx.stroke();
                lastPoint = {
                    x: e.clientX,
                    y: e.clientY
                };
                break;
            default:
                ctx.lineTo(e.touches[0].clientX * factor, (e.touches[0].clientY - 66) * factor);
                ctx.stroke();
        }
    }

    function endDraw(e) {
        ctx.closePath();
    }

    function imageSaved() {
        var imgId = imgStore.getCurrentPicId();
        self.update({
            isSaving: false,
            imgId: imgId.image_id
        });

    }

    function imageSaveFailed() {
        self.update({
            isSaving: false
        });

    }

    function saveImage(){
      imageActions.saveImage(self.imgId, el.toDataURL(), self.title, self.description, userStore.getSessionId());
    }

    this.openControls = function(e) {
        e.preventDefault();
        self.update({
            isControlsOpen: !this.isControlsOpen
        });
    }

    this.closeSheet = function(e) {
        e && e.preventDefault();
        self.update({
            isBottomsheetShown: false,
            currentControl: "",
            sheetTitle: "",
        });
    }

    this.showColors = function(e) {
        e.preventDefault();
        self.update({
            isControlsOpen: !this.isControlsOpen,
            isBottomsheetShown: true,
            currentControl: "PALLETE",
            sheetTitle: "choose color"
        });
    }

    this.showBrushes = function(e) {
        e.preventDefault();
        self.update({
            isControlsOpen: !this.isControlsOpen,
            isBottomsheetShown: true,
            currentControl: "BRUSHES",
            sheetTitle: "choose brush"
        });
    }

    this.selectBrush = function(e) {
        selectedBrush = e.target.innerText;
        this.closeSheet(e);
    }

    this.selectColor = function(e) {
        currentColor = e;
        self.closeSheet();
    }

    this.save = function(e) {
        e.preventDefault();
        this.closeSheet(e);
        self.update({
            isSaving: true,
            isControlsOpen: false
        });
        saveImage();
    }

    this.publish = function(e){
      e.preventDefault();
      this.closeSheet(e);
      self.update({
          isPublishPopupShown: true,
          isControlsOpen: false
      });
      saveImage();
    }

    this.changeTitle=function(e){
      self.update({
        title:e
      });
    }

    this.changeDesc=function(e){
      self.update({
        description:e
      });
    }

    this.popupaction=function(btnText){
      switch(btnText){
        case "CANCEL":
          self.update({isPublishPopupShown: false});
        case "PUBLISH":
          saveImage();
          imageActions.publishImage();
      }
    }

    this.on("mount", function() {
        imgStore.subscribe("img:save:success", imageSaved);
        imgStore.subscribe("img:save:failed", imageSaveFailed);

        setTimeout(function() {
            self.update({
                showCanvas: true
            });
            selectedBrush = "Simple Pencil";
            document.body.classList.add("noscroll");
            el = document.getElementById('canvas');
            ctx = el.getContext('2d');
            el.addEventListener("touchstart", startDraw, false);
            el.addEventListener("touchmove", draw, false);
            el.addEventListener("touchend", endDraw, false);
        }, 400);

    });

    this.on("unmount", function() {
        document.body.classList.remove("noscroll");
        imgStore.unsubscribe("img:save:success", imageSaved);
        imgStore.unsubscribe("img:save:failed", imageSaveFailed);
    });
});

riot.tag2('gp-header', '<div class="header {currState} {forceShow?\'forceshow\':\'\'}"><div class="nav"><button class="menu {isBackEnabled?\'back\':\'\'}" onclick="{menuClick}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path class="line line-first" d="M3 18h18v-2H3v2zm0-5h18v"></path><path class="line line-second" d="M3 18h18v-2H3v2zm0-5h18v"></path><path class="line line-third" d="M3 18h18v-2H3v2zm0-5h18v"></path></svg></button></div><div class="title"><h1 class="titlefont">kanvasProject</h1></div><div class="search"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24" onclick="{goToSearch}"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg></div></div>', '', '', function(opts) {
		var self=this;

		var navActions=veronica.flux.Actions.getAction("NavigationActions");
		var routeStore=veronica.flux.Stores.getStore("RouteStore");
		var scrollThrottler=null;

		this.forceShow=false;
		this.currState="NA";

		function scrollListener(){
			if(window.scrollY>420){
				self.update({ forceShow: true});
			}else{
				self.update({ forceShow: false});
			}
		}

		function checkBackButton(){
			var currState=(routeStore.getCurrentRoute()||veronica.getCurrentState()).state;
			if(window.history.state.state==="home"){
				self.update({
					isBackEnabled:false,
					currState:currState
				});
			}
			else{
				self.update({
					isBackEnabled:true,
					currState:currState
				});
			}

			window.addEventListener('scroll',(e)=>{
				if(self.currState==='profile'){
					if(scrollThrottler){
						clearTimeout(scrollThrottler);
					}
					scrollThrottler = setTimeout(scrollListener,300);
				}
			},false);
		}

		this.isBackEnabled=false;

		this.goToSearch=function(){
			if(veronica.getCurrentState().state!=="search"){
				veronica.loc("/search");
			}

		}

		this.menuClick=function(e){
			e.preventDefault();
			if(this.isBackEnabled){
				history.go(-1);
			}else{
				navActions.showModal();
				navActions.openNavbar();
			}
		}

		this.on("mount",function(){
			setTimeout(checkBackButton,300);
			routeStore.subscribe("route:changed",checkBackButton);
		});

});
riot.tag2('gp-home', '<h1>home</h1>', '', '', function(opts) {
		var userStore=veronica.flux.Stores.getStore("UserStore");

		this.on("mount",function(){
			if(!userStore.getUserProfile("me"))
			{
				veronica.loc("/login",true);
			}else{
				window.scrollTo(0,0);
			}
		});
});
riot.tag2('icon-add', '<svg class="icon-add" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-chat', '<svg class="icon-chat" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-copy', '<svg class="icon-copy" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-heart', '<svg class="icon-heart" height="24" viewbox="0 0 24 24" width="24" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-pic', '<svg class="icon-pic" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-publish', '<svg class="icon-publish" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z"></path></svg>', '', '', function(opts) {
});
riot.tag2('icon-tick', '<svg class="icon-tick" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg>', '', '', function(opts) {
});
riot.tag2('gp-imagedetails', '<gp-pictureunit isloading="{isLoading}" img="{image}"></gp-pictureunit>', '', '', function(opts) {
		var self=this;
		var imgActions = veronica.flux.Actions.getAction("ImageActions");
		var imgStore = veronica.flux.Stores.getStore("ImageStore");

		this.isLoading = true;
		this.image=null;

		function imageFetchSuccess(){
			var imgDetails=imgStore.getPicDetails(veronica.getCurrentState().data[':imageid']);
			self.update({
				isLoading: false,
				image: imgDetails
			});
		}

		this.on('mount',(e)=>{
			imgStore.subscribe("img:detailsfetch:success",imageFetchSuccess);
			imgActions.fetchImage(veronica.getCurrentState().data[':imageid']);
		});

		this.on('unmount',(e)=>{
			imgStore.unsubscribe("img:detailsfetch:success",imageFetchSuccess);
		})
});
riot.tag2('gp-login', '<div class="title titlefont"> KanvasProject </div><div class="fblogin" if="{!userProfile}"><img if="{!loading}" src="https://www.takingwings.in/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom/facebook.png" width="200" onclick="{startLoading}"><material-spinner if="{loading}"></material-spinner></div>', '', '', function(opts) {
		var self=this;
		var userStore=veronica.flux.Stores.getStore("UserStore");
		var userActions=veronica.flux.Actions.getAction("UserActions");

		this.userProfile=userStore.getUserProfile("me");
		this.loading=false;

		this.startLoading=function(){
			self.update({loading:true});
			window.FB&&FB.login(function(res){
				if(res.status==="connected"){
					var url = '/me?fields=name,email,picture';
	                FB.api(url, function (response) {
	                	userActions.loginUser(response,res);
	                });
				}
			});
		}

		function logInSuccess(){

			veronica.loc("/",true);
		}

		this.on("mount",()=>{
			if(this.userProfile){
				veronica.loc("/",true);
			}else{
				userStore.subscribe("user:login:success", logInSuccess);
			}
		});

		this.on("unmount",()=>{
			userStore.unsubscribe("user:login:success", logInSuccess);
		});
});
riot.tag2('gp-modal', '<div class="modal {isModalShown?\'opened\':\'\'}" onclick="{closeModal}"></div>', '', '', function(opts) {
		var self=this;

		var navActions=veronica.flux.Actions.getAction("NavigationActions");
		var navStore=veronica.flux.Stores.getStore("NavigationStore");

		this.isModalShown=false;

		this.closeModal=function(e){
			navActions.hideModal();
		}

		this.on("mount",function(e){
			navStore.subscribe("nav:modalchange",function(){
				self.update({isModalShown:navStore.getModalStatus()});
			});
		});

		this.on("unmount",function(e){

		});
});
riot.tag2('gp-nav', '<nav></nav>', '', '', function(opts) {
});
riot.tag2('gp-navbar', '<nav class="{isNavBarOpen?\'opened\':\'closed\'}" onswipeleft="{closeNavBar}"><div class="userinfo"><img class="pic" width="60" height="60" riot-src="{userProfile.user.avatar_url}"></img><div class="name">{userProfile.user.name}</div></div><div class="navcontents"><div class="navlinks"><a class="navlink" onclick="{closeNavBar}" href="/search"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg><span class="text">Search</span></a><a class="navlink" onclick="{closeNavBar}" href="/profile/{userProfile.user.account_id}"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"></path></svg><span class="text">Profile</span></a><a class="navlink" onclick="{closeNavBar}" href="/draw"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"></path></svg><span class="text">New Canvas</span></a></div></div><div class="settings"><a class="navlink" href="/search"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"></path></svg><span class="text">Logout</span></a></div></nav>', '', '', function(opts) {
		var self=this;

		this.isNavBarOpen=false;

		var navActions=veronica.flux.Actions.getAction("NavigationActions");
		var navStore=veronica.flux.Stores.getStore("NavigationStore");
		var userStore=veronica.flux.Stores.getStore("UserStore");

		this.userProfile=userStore.getUserProfile("me");

		function changeNavBarStatus(){
			self.update({
				isNavBarOpen:navStore.getNavBarStatus()&&navStore.getModalStatus()
			});
			if(self.isNavBarOpen){
				document.body.classList.add("noscroll");
			} else {
				document.body.classList.remove("noscroll");
			}
		}

		function getUserProfile(){
			self.update({userProfile: userStore.getUserProfile("me")});
		}

		this.closeNavBar=function(e){
			navActions.closeNavBar();
			navActions.hideModal();
		}

		this.on("mount",function(){
			navStore.subscribe("nav:statuschange",changeNavBarStatus);
			navStore.subscribe("nav:modalchange",changeNavBarStatus);
			userStore.subscribe("user:login:success",getUserProfile);

		});

		this.on("unmount",function(){
			navStore.unsubscribe("nav:statuschange",changeNavBarStatus);
			navStore.unsubscribe("nav:modalchange",changeNavBarStatus);
			userStore.unsubscribe("user:login:success",getUserProfile);
		});
});
riot.tag2('gp-picture', '<img onclick="{showContribute}" class="pic {isloading?\'loading\':\'\'}" height="{window.innerWidth}" riot-src="{opts.img}" onload="{loaded}"></img><icon-pic class="loader"></icon-pic><material-button waves-color="#000" class="clone {shown:(usedAccountId !== opts.owner.account_id)&&isShowingClone}" onclick="{startClone}"><span if="{isCloning}">CLONING</span><span if="{isCloned}">CLONED</span><span if="{!isCloned&&!isCloning}">CONTRIBUTE</span></material-button>', '', '', function(opts) {
		var self = this;
		var imgActions = veronica.flux.Actions.getAction('ImageActions');
		var userStore = veronica.flux.Stores.getStore('UserStore');
		var imageStore = veronica.flux.Stores.getStore('ImageStore');

		this.usedAccountId = userStore.getUserProfile().user.account_id;
		this.isloading = true;
		this.isShowingClone = false;
		this.isCloning = false;
		this.isCloned = false;
		this.isSelfPic = false;

		function imgCloneSuccess(){
			self.update({
				isCloning: false,
				isCloned: true
			});
		}

		function imgCloneFailure(){
			self.update({
				isCloning: false,
				isCloned: false
			});
		}

		this.loaded=function(){
			self.update({isloading: false});
		}

		this.showContribute=function(){
			self.update({isShowingClone: !self.isShowingClone});
		}

		this.startClone=function(){
			self.update({isCloning: true});
			imgActions.cloneImage(veronica.getCurrentState().data[':imageid'], userStore.getSessionId())
		}

		this.on('mount',e=>{
			console.log(opts.img);
			imageStore.subscribe("img:clone:success",imgCloneSuccess);
			imageStore.subscribe("img:clone:failed",imgCloneFailure);
		});

		this.on('unmount',e=>{
			imageStore.unsubscribe("img:clone:success",imgCloneSuccess);
			imageStore.unsubscribe("img:clone:failed",imgCloneFailure);
		});
});
riot.tag2('gp-pictureunit', '<gp-picunitheader details="{opts.img}" isloading="{opts.isloading}"></gp-picunitheader><gp-picture img="{opts.img.image}" owner="{opts.img}"></gp-picture><div class="desc" if="{!opts.isloading}"> {opts.img.description} </div><a class="taglink" each="{tag in opts.img.tags}" href="/tag/{tag.tag}">#{tag.tag}</a><gp-stats details="{opts.img}" if="{!opts.isloading}"></gp-stats>', '', '', function(opts) {
});
riot.tag2('gp-picunitheader', '<div class="picsection"><img if="{!opts.isloading}" class="pic" src="" height="40" width="40"></img><span if="{opts.isloading}" class="picloader"></span></div><div class="namesection"><a if="{!opts.isloading}" href="/profile/{opts.details.account_id}">prateek</a><span if="{!opts.isloading}" class="event-desc"> owns this image</span><span class="nameloader animated-background" if="{opts.isloading}"></span></div><div class="timesection" if="{!opts.isloading}"> {prettyDate(new Date(),new Date(opts.details.updated_at||opts.details.created_at))} </div>', '', '', function(opts) {
});
riot.tag2('gp-stats', '<div class="stats"><div class="commentstat stat"><button class="btn-action comment"><icon-chat class="icon icon-comment"></icon-chat><span class="comment-count count">{opts.details.num_of_comments}</span></button></div><div class="likestat stat"><button class="btn-action like" onclick="{likePic}"><icon-heart class="icon icon-like {isPicLiked?\'liked\':\'\'}"></icon-heart><span class="like-count count">{likeCount}</span></button><div class="likers me"><img class="liker me" src="https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/13669817_1117113145017292_4920305262041128067_n.jpg?oh=32783654cad84190711280a5c377221d&oe=582970EA" riot-style="transform:{isPicLiked?\'scale(1) translateX(10px)\':\'scale(0) translateX(0px)\'}; z-index:{5} "></div><div class="likers others {isPicLiked?\'liked\':\'\'}"><img class="liker" each="{img,index in likers}" riot-src="{img}" riot-style="transform:translateX({(-10*index)-10}px) {isPicLiked&&index===3?\'scale(0)\':\'\'}; z-index:{4-index}"></div></div></div>', '', '', function(opts) {
		var self = this;
		var imgActions = veronica.flux.Actions.getAction('ImageActions');
		var userStore = veronica.flux.Stores.getStore('UserStore');

		this.isPicLiked = false;
		this.likers = [
			"https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/13669817_1117113145017292_4920305262041128067_n.jpg?oh=32783654cad84190711280a5c377221d&oe=582970EA",
			"https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/13669817_1117113145017292_4920305262041128067_n.jpg?oh=32783654cad84190711280a5c377221d&oe=582970EA",
			"https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/13669817_1117113145017292_4920305262041128067_n.jpg?oh=32783654cad84190711280a5c377221d&oe=582970EA",
			"https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/13669817_1117113145017292_4920305262041128067_n.jpg?oh=32783654cad84190711280a5c377221d&oe=582970EA"];
		this.likeCount = opts.details&&parseInt(opts.details.num_of_likes)||0;

		this.likePic = function(e){
			e.preventDefault();
			self.update({
				isPicLiked:!self.isPicLiked,
				likeCount:!self.isPicLiked?self.likeCount+1:self.likeCount-1
			});

			imgActions.likeImage(opts.details.id,self.isPicLiked,userStore.getSessionId());
		}

		this.on('mount',e=>{
			self.update({likeCount : opts.details&&parseInt(opts.details.num_of_likes)||0});
		})
});
riot.tag2('gp-picunit', '<div class="userinfo"></div><div class="container-pic"></div><div class="stats"></div>', '', '', function(opts) {
});
riot.tag2('gp-followbutton', '<button class="follow {opts.following?\'following\':\'\'}"><icon-add if="{!opts.following}"></icon-add><icon-tick if="{opts.following}"></icon-tick><span class="text">{opts.following?\'following\':\'follow\'}</span></button>', '', '', function(opts) {
});

riot.tag2('gp-profile', '<div class="profilepic {userPic?\'loaded\':\'\'}" riot-style="{userPic?\'background-image:url(\\\'\'+userPic+\'\\\')\':\'\'}"><div class="username">{userProfile.user.name}</div><gp-followbutton following="{userProfile.is_follower}" if="{userProfile&&ownerProfile&&ownerProfile.user.user_id!==userProfile.user.user_id}"></gp-followbutton></div><div class="usercontent" if="{userProfile}"><material-tabs useline="true" tabs="{tabs}" __selected="{selectedTab}" tabchanged="{tabChanged}"></material-tabs><div class="tabcontent tab{selectedTab}" onswipeleft="{incTabsIndex}" onswiperight="{decTabsIndex}"><div class="tab tab-owned"><div class="ownedcontainer"><a class="piclink" each="{pic, index in userProfile.owned_images}" href="/image/{pic.id}"><img height="{(window.innerWidth/3)-2}" class="ownedpic" riot-src="{pic.url}"></img></a></div></div><div class="tab tab-contri"> Tab2 </div></div></div><div class="usercontent" if="{!userProfile}"><div class="loader"><material-spinner></material-spinner></div></div>', '', '', function(opts) {
		var self = this;
		var userStore = veronica.flux.Stores.getStore("UserStore");
		var userAction = veronica.flux.Actions.getAction("UserActions");
		var pid=veronica.getCurrentState().data[':pid'];
		var userProfileEventSubscribed=false;
		var $tabs=null;

		this.userProfile = userStore.getUserProfile(pid);
		this.ownerProfile = userStore.getUserProfile("me");
		this.userPic = null;
		this.selectedTab=0;
		this.tabs=[
			{title:'OWNED'},
			{title:'CONTRIBUTIONS'}
		];

		function setUserPic(profile){
			var img = new Image();
			img.onload=function(){
				self.update({userPic : img.src});
			}
			img.src=profile.user.full_profile_url;
		}

		function setUserProfile(){
			var userProfile = userStore.getUserProfile(pid);
			self.update({
				userProfile:userProfile,
				tabs:[{title:'OWNED (' + userProfile.owned_images.length + ')'},{title:'CONTRIBUTIONS (' + userProfile.cloned_images.length + ')'}]
			});
			setUserPic(userStore.getUserProfile(pid));
			$tabs=self.root.querySelector("material-tabs");
		}

		this.incTabsIndex=function(e){
			if(this.selectedTab<1){
				self.update({selectedTab:this.selectedTab+1});
				$tabs._tag.changeTab(this.selectedTab);
			}
		}
		this.decTabsIndex=function(e){
			if(this.selectedTab>0){
				self.update({selectedTab:this.selectedTab-1});
				$tabs._tag.changeTab(this.selectedTab);
			}
		}

		this.tabChanged=function(){
			self.update({selectedTab:$tabs._tag.selected});
		}

		this.on("mount",()=>{
			userAction.fetchUserProfile(pid, userStore.getSessionId());
			$tabs=this.root.querySelector("material-tabs");
			if(!this.userProfile){
				userProfileEventSubscribed=true;
				userStore.subscribe("user:profile:fetched",setUserProfile);
			}else{
				setUserPic(this.userProfile);
			}

		});

		this.on("unmount",(e)=>{
			if(userProfileEventSubscribed){
				userStore.unsubscribe("user:profile:fetched",setUserProfile);
			}
		})
});

riot.tag2('material-dialog', '<div if="{opts.shown}"><div class="bg"></div><div class="dialog {shown:opts.shown}"><div class="title">{opts.title}</div><div class="desc"><yield></yield></div><div class="actions"><material-button class="action" each="{action in opts.actions}" onclick="{actionSelected}">{action}</material-button></div></div></div>', '', '', function(opts) {
		var self=this;

		this.on('mount',(e)=>{

			document.body.appendChild(this.root);
		});

		this.actionSelected=function(e){
			if(self.opts.onaction){
				self.opts.onaction(e.target.parentElement.parentElement.innerText.trim());
			}
		}
});
riot.tag2('material-progressbar', '<div class="bar"><div class="progress {opts.moving?\'moving\':\'\'}" riot-style="width:{opts.progress*100}%"></div></div>', '', '', function(opts) {
});
function UserAction(){

	this.fetchUserProfile=function(uid, sid){
		fetch(apiBase+"/user/profile/details/"+uid,{
			headers: Object.assign({}, defaultHeaders, {'x-session-id': sid, 'x-account-id': sid}),
			mode: 'cors',
			credentials: 'include'
		})
		.then(res=>res.json())
		.then(data=>{
			this.Dispatcher.trigger("user:fetchprofile:success",data);
		}).catch(e=>{
			this.Dispatcher.trigger("user:fetchprofile:failed",e);
		});
	}

	this.loginUser=(fbprofile,oauth)=>{
		var user={};
		fetch(window.apiBase+"/user/signIn",{
			headers:window.defaultHeaders,
			method:"POST",
			mode: 'cors',
			credentials: 'include',
			body:JSON.stringify(
			{
			  "user_details": {
				"avatar_url": fbprofile.picture.data.url,
				"name": fbprofile.name,
				"email": fbprofile.email,
				"id": fbprofile.id
			  },
			  "oauth_credentials": {
				"oauth_response": {
			  	"access_token": oauth.authResponse.accessToken
				}
			  }
			})
		})
		.then(res=>res.json())
		.then(data=>{
			this.Dispatcher.trigger("user:login:success",data);
		}).catch(e=>{
			this.Dispatcher.trigger("user:login:failure",{data:e});
		})
	}

    this.setUserProfile=function(profile){
        this.Dispatcher.trigger("user:setprofile",{profile:profile});
    }

}

veronica.flux.Actions.createAction("UserActions",UserAction); 
 
function NavigationActions(){
    this.openNavbar=function(){
        this.Dispatcher.trigger("nav:opennavbar",{});
    }

    this.closeNavBar=function(){
        this.Dispatcher.trigger("nav:closenavbar",{});
    }

    this.showModal=function(){
    	this.Dispatcher.trigger("nav:openmodal",{});	
    }

    this.hideModal=function(){
    	this.Dispatcher.trigger("nav:closemodal",{});	
    }
   
}

veronica.flux.Actions.createAction("NavigationActions",NavigationActions); 
 
function ImageActions(){
    this.saveImage = function(imgId, img,tags,description,sessionId){
        fetch(window.apiBase+"/image/save",{
            headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
            method: "POST",
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
              "image": LZW.encode(img),
              "tags": [
                "string"
              ],
              "description": "string",
              "title": "string",
              "image_id": imgId
            })
        })
        .then(res=>res.json())
        .then(data=>{
          this.Dispatcher.trigger("img:save:success",data);  
        }).catch(e=>{
          this.Dispatcher.trigger("img:save:failed",{});  
        });
    }

    this.likeImage = function(imageId, liked, sessionId){
      fetch(window.apiBase+'/image/'+imageId+'/like',{
        headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
        method: "POST",
        mode: 'cors',
        credentials: 'include',
        body:''
      })
      .then(res=>res.json())
      .then(data=>{
        console.log(data);
      });
    }

    this.cloneImage = function(imageId, sessionId){
      var fetchPromise = fetch(window.apiBase+'/image/clone',{
        headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
        method: "POST",
        mode: 'cors',
        credentials: 'include',
        body:JSON.stringify({ image_id: imageId})
      })
      .then(res=>{
        if(res.status!==200){
          throw newError('Image Cloning failed');
        }
        return res.json()
      })
      .then(data=>{
        this.Dispatcher.trigger("img:clone:success",data);
      })
      .catch(e=>{
        this.Dispatcher.trigger("img:clone:failed",e);
      })
    }

    this.publishImage = function(imageId){
      //implement fetch here
    }

    this.fetchImage = function (imageId){
      fetch(window.apiBase+"/image/details/"+imageId,{
        mode: 'cors',
        credentials: 'include'
      })
      .then(res=>res.json())
      .then(data=>{
        this.Dispatcher.trigger("img:detailsfetch:success",data);  
      }).catch(e=>{
        this.Dispatcher.trigger("img:detailsfetch:failed",{});  
      });
    }
}

veronica.flux.Actions.createAction("ImageActions",ImageActions); 
 
function UserStore(){

    var sessionId=localStorage.sid||null;
    var users={};

    users["me"]=localStorage.user&&JSON.parse(localStorage.user)||null;
    
    if(users["me"]){
        users[users["me"].account_id]=users["me"];    
    }
    
    //Register for actions

    this.Dispatcher.register("user:login:success",(data)=>{
        //sid for all further requests
        sessionId=data.session_id;
        
        //start caching big image 
        var img=new Image();
        img.src=data.profile_details.user.full_profile_url;
        
        
        users["me"]=data.profile_details;
        users[users["me"].account_id]=users["me"];
        localStorage.sid = sessionId;
        localStorage.user = JSON.stringify(users["me"]);
        this.emit("user:login:success");
    });

    this.Dispatcher.register("user:login:failure",(data)=>{
        this.emit("user:login:failure");
    });

    this.Dispatcher.register("user:fetchprofile:success",(data)=>{
        users[data.user.account_id]=data;
        this.emit("user:profile:fetched");
    });

    this.getUserProfile=function(uid){
        return users[uid];
    }

    this.getSessionId=function(){
        return sessionId;
    }

}
 
//creating an store 
veronica.flux.Stores.createStore("UserStore",UserStore);
function RouteStore(){
    var prevRoute=null;
    var currRoute=null;
    var self=this;

    window.addEventListener("popstate",function(){
        prevRoute=currRoute;
        currRoute=veronica.getCurrentState();
        self.emit("route:changed");
    });


    /* hack for push state */
    (function(history){
        var pushState = history.pushState;
        var replaceState = history.replaceState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") {
                history.onpushstate({state: state});
            }
            pushState.apply(history, arguments);
            prevRoute=currRoute;
            currRoute=state;
            self.emit("route:changed");
        }
        
        history.replaceState = function(state) {
            replaceState.apply(history, arguments);
            prevRoute=currRoute;
            currRoute=state;
            self.emit("route:changed");
        }
    })(window.history);

    this.getPrevoute=function(){
        return prevRoute;
    }

    this.getCurrentRoute=function(){
        return currRoute;
    }

}
 
//creating an store 
veronica.flux.Stores.createStore("RouteStore",RouteStore);  
function NavigationStore(){
    var self=this;
    var isNavBarOpen=false;
    var isModalShow=false;

    //Register for actions
    this.Dispatcher.register("nav:opennavbar",openNavBar);
    this.Dispatcher.register("nav:closenavbar",closeNavBar);
    this.Dispatcher.register("nav:openmodal",openModal);
    this.Dispatcher.register("nav:closemodal",closeModal);

    function openNavBar(){
        isNavBarOpen=true;
        self.emit("nav:statuschange");
    }

    function closeNavBar(){
        isNavBarOpen=false;
        self.emit("nav:statuschange");
    }

    function openModal(){
        isModalShow=true;
        self.emit("nav:modalchange");
    }

    function closeModal(){
        isModalShow=false;
        self.emit("nav:modalchange");
    }

    this.getNavBarStatus=function(){
        return isNavBarOpen;
    }

    this.getModalStatus=function(){
        return isModalShow;
    }

}
 
//creating an store 
veronica.flux.Stores.createStore("NavigationStore",NavigationStore);  
function ImageStore() {
  var self = this;
  var currPic=null;
  var imgs={};
  //Register for actions
  this.Dispatcher.register("img:save:success", (data)=>{
    currPic = data;
    this.emit("img:save:success");
  });

  this.Dispatcher.register("img:save:failed", (data)=>{
    this.emit("img:save:failed");
  });

  this.Dispatcher.register("img:clone:success", (data)=>{
    this.emit("img:clone:success");
  });

  this.Dispatcher.register("img:clone:failed", (data)=>{
    this.emit("img:clone:failed");
  });

  this.Dispatcher.register("img:detailsfetch:success", (data)=>{
    imgs[data.id]=data;
    this.emit("img:detailsfetch:success");
  });

  this.Dispatcher.register("img:detailsfetch:failed", (data)=>{
    this.emit("img:detailsfetch:failed");
  });

  this.getPicDetails=function(imageId){
    return imgs[imageId];
  }

  this.getCurrentPicId=function(){
    return currPic;
  }
}

//creating an store 
veronica.flux.Stores.createStore("ImageStore", ImageStore);
