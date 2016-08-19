function UserAction(){

	this.fetchUserProfile = function(uid, sid){
		fetch(apiBase+"/user/profile/details/"+uid,{
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

	this.loginUser = (fbprofile,oauth)=>{
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

    this.setUserProfile = function(profile){
        this.Dispatcher.trigger("user:setprofile",{profile:profile});
    }

    this.followUser = function(userId){
    	fetch(window.apiBase+"/user/addFollower",{
    		headers:window.defaultHeaders,
    		method:"POST",
    		mode: 'cors',
    		credentials: 'include',
    		body:JSON.stringify(
    		{
    		  'follower_account_id': userId
    		})
    	})
    	.then(res=>res.json())
    	.then(data=>{
    		this.Dispatcher.trigger("user:followed:success",{data:data, id:userId});
    	}).catch(e=>{
    		this.Dispatcher.trigger("user:followed:failure",{data:e});
    	})
    }

}

veronica.flux.Actions.createAction("UserActions",UserAction); 
 