riot.tag2('gp-draw', '<canvas id="canvas" width="800" height="800"></canvas><div class="controls {isControlsOpen?\'controlsshown\':\'\'}"><button class="btn-control colors" onclick="{showColors}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></button><button class="btn-control brush" onclick="{showBrushes}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"></path></svg></button><button class="btn-control save"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></svg></button><button class="btn-control options {isControlsOpen?\'controlsshown\':\'\'}" onclick="{openControls}"><svg class="firstleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg><svg class="secondleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></button></div><div class="bottomsheet {isBottomsheetShown?\'shown\':\'\'}"><button class="btn-control closesheet" onclick="{closeSheet}"><svg class="firstleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg><svg class="secondleg leg" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></button><div class="title">{sheetTitle}</div><div class="sheetcontent"><div class="colorlist" if="{currentControl===⁗PALLETE⁗}"><div class="color" each="{color in colorList}" riot-style="background-color:{color}"></div></div></div></div>', '', '', function(opts) {
		var self=this;

		this.colorList=['#F44336','#FFEBEE','#FFCDD2','#EF9A9A','#E57373','#EF5350','#F44336','#E53935','#D32F2F','#C62828','#B71C1C','#FF8A80','#FF5252','#FF1744','#D50000','#E91E63','#FCE4EC','#F8BBD0','#F48FB1','#F06292','#EC407A','#E91E63','#D81B60','#C2185B','#AD1457','#880E4F','#FF80AB','#FF4081','#F50057','#C51162','#9C27B0','#F3E5F5','#E1BEE7','#CE93D8','#BA68C8','#AB47BC','#9C27B0','#8E24AA','#7B1FA2','#6A1B9A','#4A148C','#EA80FC','#E040FB','#D500F9','#AA00FF','#673AB7','#EDE7F6','#D1C4E9','#B39DDB','#9575CD','#7E57C2','#673AB7','#5E35B1','#512DA8','#4527A0','#311B92','#B388FF','#7C4DFF','#651FFF','#6200EA','#3F51B5','#E8EAF6','#C5CAE9','#9FA8DA','#7986CB','#5C6BC0','#3F51B5','#3949AB','#303F9F','#283593','#1A237E','#8C9EFF','#536DFE','#3D5AFE','#304FFE','#2196F3','#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1','#82B1FF','#448AFF','#2979FF','#2962FF','#03A9F4','#E1F5FE','#B3E5FC','#81D4FA','#4FC3F7','#29B6F6','#03A9F4','#039BE5','#0288D1','#0277BD','#01579B','#80D8FF','#40C4FF','#00B0FF','#0091EA','#00BCD4','#E0F7FA','#B2EBF2','#80DEEA','#4DD0E1','#26C6DA','#00BCD4','#00ACC1','#0097A7','#00838F','#006064','#84FFFF','#18FFFF','#00E5FF','#00B8D4','#009688','#E0F2F1','#B2DFDB','#80CBC4','#4DB6AC','#26A69A','#009688','#00897B','#00796B','#00695C','#004D40','#A7FFEB','#64FFDA','#1DE9B6','#00BFA5','#4CAF50','#E8F5E9','#C8E6C9','#A5D6A7','#81C784','#66BB6A','#4CAF50','#43A047','#388E3C','#2E7D32','#1B5E20','#B9F6CA','#69F0AE','#00E676','#00C853','#8BC34A','#F1F8E9','#DCEDC8','#C5E1A5','#AED581','#9CCC65','#8BC34A','#7CB342','#689F38','#558B2F','#33691E','#CCFF90','#B2FF59','#76FF03','#64DD17','#CDDC39','#F9FBE7','#F0F4C3','#E6EE9C','#DCE775','#D4E157','#CDDC39','#C0CA33','#AFB42B','#9E9D24','#827717','#F4FF81','#EEFF41','#C6FF00','#AEEA00','#FFEB3B','#FFFDE7','#FFF9C4','#FFF59D','#FFF176','#FFEE58','#FFEB3B','#FDD835','#FBC02D','#F9A825','#F57F17','#FFFF8D','#FFFF00','#FFEA00','#FFD600','#FFC107','#FFF8E1','#FFECB3','#FFE082','#FFD54F','#FFCA28','#FFC107','#FFB300','#FFA000','#FF8F00','#FF6F00','#FFE57F','#FFD740','#FFC400','#FFAB00','#FF9800','#FFF3E0','#FFE0B2','#FFCC80','#FFB74D','#FFA726','#FF9800','#FB8C00','#F57C00','#EF6C00','#E65100','#FFD180','#FFAB40','#FF9100','#FF6D00','#FF5722','#FBE9E7','#FFCCBC','#FFAB91','#FF8A65','#FF7043','#FF5722','#F4511E','#E64A19','#D84315','#BF360C','#FF9E80','#FF6E40','#FF3D00','#DD2C00','#795548','#EFEBE9','#D7CCC8','#BCAAA4','#A1887F','#8D6E63','#795548','#6D4C41','#5D4037','#4E342E','#3E2723','#9E9E9E','#FAFAFA','#F5F5F5','#EEEEEE','#E0E0E0','#BDBDBD','#9E9E9E','#757575','#616161','#424242','#212121','#607D8B','#ECEFF1','#CFD8DC','#B0BEC5','#90A4AE','#78909C','#607D8B','#546E7A','#455A64','#37474F','#263238','#000000','#FFFFFF'];
		this.burshesList=[
			""
		];

		this.isControlsOpen=false;
		this.isBottomsheetShown=false;
		this.currentControl="";
		this.sheetTitle="";

		this.openControls=function(e){
			e.preventDefault();
			self.update({
				isControlsOpen:!this.isControlsOpen
			});
		}

		this.closeSheet=function(e){
			e.preventDefault();
			self.update({
				isBottomsheetShown:false,
				currentControl:"",
				sheetTitle:"",
			});
		}

		this.showColors=function(e){
			e.preventDefault();
			self.update({
				isControlsOpen:!this.isControlsOpen,
				isBottomsheetShown:true,
				currentControl:"PALLETE",
				sheetTitle:"choose color"
			});
		}

		this.showBrushes=function(e){
			e.preventDefault();
			self.update({
				isControlsOpen:!this.isControlsOpen,
				isBottomsheetShown:true,
				currentControl:"BRUSHES",
				sheetTitle:"choose brush"
			});
		}

		this.on("mount",function(){
			document.body.classList.add("noscroll");
		});

		this.on("unmount",function(){
			document.body.classList.remove("noscroll");
		});

});
riot.tag2('gp-header', '<div class="nav"><button class="menu {isBackEnabled?\'back\':\'\'}" onclick="{menuClick}"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path class="line line-first" d="M3 18h18v-2H3v2zm0-5h18v"></path><path class="line line-second" d="M3 18h18v-2H3v2zm0-5h18v"></path><path class="line line-third" d="M3 18h18v-2H3v2zm0-5h18v"></path></svg></button></div><div class="title"><h1 class="titlefont">kanvasProject</h1></div><div class="search"><svg fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24" onclick="{goToSearch}"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg></div>', '', '', function(opts) {
		var self=this;

		var navActions=veronica.flux.Actions.getAction("NavigationActions");
		var routeStore=veronica.flux.Stores.getStore("RouteStore");

		function checkBackButton(){
			var currState=(routeStore.getCurrentRoute()||veronica.getCurrentState()).state;
			if(window.history.state.state==="home"){
				self.update({isBackEnabled:false});
			}
			else{
				self.update({isBackEnabled:true});
			}
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
riot.tag2('gp-home', '<h1>KrowdKanvas</h1>', '', '', function(opts) {
		var userStore=veronica.flux.Stores.getStore("UserStore");

		this.on("mount",function(){
			if(userStore.getUserProfile()===null)
			{
				veronica.loc("/login",true);
			}else{
				window.scrollTo(0,0);
			}
		});
});
riot.tag2('gp-login', '<div class="title titlefont"> KanvasProject </div><div class="fblogin" if="{!userProfile}"><img if="{!loading}" src="https://www.takingwings.in/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom/facebook.png" width="200" onclick="{startLoading}"><material-spinner if="{loading}"></material-spinner></div>', '', '', function(opts) {
		var self=this;
		var userStore=veronica.flux.Stores.getStore("UserStore");
		var userActions=veronica.flux.Actions.getAction("UserActions");

		this.userProfile=userStore.getUserProfile();
		this.loading=false;

		this.startLoading=function(){
			self.update({loading:true});
			FB.login(function(res){
				if(res.status==="connected"){
					userActions.setAuthCredentials(res);
					var url = '/me?fields=name,email,picture';
					FB.api('/me/picture?type=large',function(imgRes){
						var imgCaching=new Image();
						imgCaching.src=imgRes.data.url;
						userActions.setBigPic(imgRes.data.url);
					})
	                FB.api(url, function (response) {
	                	userActions.setUserProfile(response);
	                	veronica.loc("/",true);
	                });
				}
			});
		}

		this.on("mount",()=>{
			if(this.userProfile){
				veronica.loc("/",true);
			}

		});

		this.on("unmount",()=>{

		})
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
riot.tag2('gp-navbar', '<nav class="{isNavBarOpen?\'opened\':\'closed\'}" onswipeleft="{closeNavBar}"><div class="userinfo"><img class="pic" width="60" height="60" riot-src="{userProfile.picture.data.url}"></img><div class="name">{userProfile.name}</div></div><div class="navcontents"><div class="navlinks"><a class="navlink" href="/search"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg><span class="text">Search</span></a><a class="navlink" href="/user/me"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"></path></svg><span class="text">Profile</span></a><a class="navlink" href="/draw"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"></path></svg><span class="text">New Canvas</span></a></div><div class="others"><div class="othercontainers"><a class="navlink" href="/search"><svg class="icon" fill="#FFFFFF" height="24" viewbox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"></path></svg><span class="text">Logout</span></a></div></div></div></nav>', '', '', function(opts) {
		var self=this;

		this.isNavBarOpen=false;

		var navActions=veronica.flux.Actions.getAction("NavigationActions");
		var navStore=veronica.flux.Stores.getStore("NavigationStore");
		var userStore=veronica.flux.Stores.getStore("UserStore");

		this.userProfile=userStore.getUserProfile();

		function changeNavBarStatus(){
			self.update({
				isNavBarOpen:navStore.getNavBarStatus()&&navStore.getModalStatus()
			});
		}

		this.closeNavBar=function(e){
			navActions.closeNavBar();
			navActions.hideModal();
		}

		this.on("mount",function(){
			navStore.subscribe("nav:statuschange",changeNavBarStatus);
			navStore.subscribe("nav:modalchange",changeNavBarStatus);
		});

		this.on("usmount",function(){
			navStore.unsubscribe("nav:statuschange",changeNavBarStatus);
			navStore.unsubscribe("nav:modalchange",changeNavBarStatus);
		});
});
riot.tag2('gp-picunit', '<div class="userinfo"></div><div class="container-pic"></div><div class="stats"></div>', '', '', function(opts) {
});
riot.tag2('gp-profile', '<div class="cover" riot-style="background-image:url(\'{userProfile.picture.data.url}\')"></div><div class="userinfo"><img class="userpic" riot-src="{userBigPic}" height="100" width="100"></img><div class="userdetails"><div class="username">Prateek Bhatnagar</div><div class="stats"><a class="stat"><span class="count">22</span><span class="label"> posts</span></a><a class="stat"><span class="count">22</span><span class="label"> following</span></a><a class="stat"><span class="count">38</span><span class="label"> followers</span></a></div></div></div><div class="usercontent"><material-tabs useline="true" tabs="[\\{title:\'OWNED\'\\},\\{title:\'CLONED\'\\}]"></material-tabs></div>', '', '', function(opts) {
		var self = this;
		var userStore = veronica.flux.Stores.getStore("UserStore");

		this.userProfile = userStore.getUserProfile();
		this.userBigPic = userStore.getUserBigPic();

		this.on("mount",function(){

		});
});

function UserAction(){
    this.setUserProfile=function(profile){
        this.Dispatcher.trigger("user:setprofile",{profile:profile});
    }

    this.setAuthCredentials=function(authcredentials){
        this.Dispatcher.trigger("user:setcredentials",{credentials:authcredentials});
    }

	this.setBigPic=function(bigpicurl){
	    this.Dispatcher.trigger("user:bigpic",{bigpic:bigpicurl});
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
 
function UserStore(){
    var user={
        oAuthCredentials:null,
        userProfile:null,
        bigPic:null,
    };

    user=localStorage.user&&JSON.parse(localStorage.user)||user;

    //Register for actions
    this.Dispatcher.register("user:setprofile",setUserProfile);
    this.Dispatcher.register("user:setcredentials",setOAuthCredentials);
    this.Dispatcher.register("user:bigpic",setUserBigPic);

    function setOAuthCredentials(data){
        user.oAuthCredentials = data.credentials;
        localStorage.user = JSON.stringify(user);
    }

    function setUserProfile(data){
        user.userProfile = data.profile;
        localStorage.user = JSON.stringify(user);
    }

    function setUserBigPic(data){
        user.bigPic=data.bigpic;
        localStorage.user = JSON.stringify(user);
    }

    this.getOAuthCredentials=function(){
    	return user.oAuthCredentials;
    }

    this.getUserProfile=function(){
        return user.userProfile;
    }

    this.getUserBigPic=function(){
        return user.bigPic;
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
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") {
                history.onpushstate({state: state});
            }
            pushState.apply(history, arguments);
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