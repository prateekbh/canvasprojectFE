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
 