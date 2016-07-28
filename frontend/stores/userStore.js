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