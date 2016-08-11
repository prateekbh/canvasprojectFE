function ImageActions(){
    this.saveImage=function(imgId, img,tags,description,sessionId){
        fetch(window.apiBase+"/image/save",{
            headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
            method: "POST",
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

    this.publishImage=function(imageId){
      //implement fetch here
    }

    this.fetchImage = function (imageId){
      fetch(window.apiBase+"/image/details/"+imageId)
      .then(res=>res.json())
      .then(data=>{
        this.Dispatcher.trigger("img:detailsfetch:success",data);  
      }).catch(e=>{
        this.Dispatcher.trigger("img:detailsfetch:failed",{});  
      });
    }
}

veronica.flux.Actions.createAction("ImageActions",ImageActions); 
 