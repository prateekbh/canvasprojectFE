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