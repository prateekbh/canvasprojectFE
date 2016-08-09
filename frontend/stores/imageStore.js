function ImageStore() {
  var self = this;
  var currPic=null;
  //Register for actions
  this.Dispatcher.register("img:save:success", (data)=>{
    currPic = data;
    this.emit("img:save:success");
  });

  this.Dispatcher.register("img:save:failed", (data)=>{
    this.emit("img:save:failed");
  });

  this.getCurrentPicId=function(){
    return currPic;
  }
}

//creating an store 
veronica.flux.Stores.createStore("ImageStore", ImageStore);
