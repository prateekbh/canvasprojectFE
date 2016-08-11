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
