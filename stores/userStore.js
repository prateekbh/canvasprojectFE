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