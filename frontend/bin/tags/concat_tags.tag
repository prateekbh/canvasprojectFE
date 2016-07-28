<gp-header>
	<div class="nav">
		<button class="menu">
			<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24">
			    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
			</svg>
		</button>
	</div>
	<div class="title">
		<h1 class="titlefont">KrowdKanvas</h1>
	</div>
	<div class="search">
		<svg fill="#FFFFFF" height="24" viewBox="0 0 24 24" width="24" onclick={goToSearch}>
		    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
		</svg>
	</div>
	<script>
		this.goToSearch=function(){
			veronica.loc("/search");
		}
	</script>
</gp-header>
<gp-home>
	<h1>KrowdKanvas</h1>
	<script>
		var userStore=veronica.flux.Stores.getStore("UserStore");
		
		this.on("mount",function(){
			if(userStore.getUserProfile()===null)
			{
				veronica.loc("/login",true);
			}
		});
	</script>
</gp-home>
<gp-login>
	<div class="title titlefont">
		KrowdKanvas
	</div>
	<div class="fblogin" if={!userProfile} >
		<img if={!loading}
			src="https://www.takingwings.in/wp-content/plugins/wordpress-social-login/assets/img/32x32/wpzoom/facebook.png"
			width="200"
			onclick={startLoading}>
		<material-spinner if={loading}>
		</material-spinner>
	</div>
	<script>
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
	</script>
</gp-login>
<gp-nav>
	<nav>
	</nav>
</gp-nav>
<gp-picunit>
	<div class="userinfo">
		
	</div>
	<div class="container-pic">
		
	</div>
	<div class="stats">
		
	</div>
</gp-picunit>
<gp-profile>
	<div class="cover" style="background-image:url('{userProfile.picture.data.url}')">
	</div>
	<div class="userinfo">
			<img class="userpic" src="{userBigPic}" height="100" width="100"></img>
			<div class="userdetails">
				<div class="username">Prateek Bhatnagar</div>
				<div class="followers"><span class="count">22</span> followers</div>
			</div>
	</div>
	<script>
		var self = this;
		var userStore = veronica.flux.Stores.getStore("UserStore");
		
		this.userProfile = userStore.getUserProfile();
		this.userBigPic = userStore.getUserBigPic();
		
		this.on("mount",function(){
		});
	</script>
</gp-profile>

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