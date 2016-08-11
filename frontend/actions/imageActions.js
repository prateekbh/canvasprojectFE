function ImageActions(){
    this.saveImage=function(img,tags,description,sessionId){
        fetch(window.apiBase+"/image/save",{
            headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
            method: "POST",
            body: JSON.stringify({
              "image": LZW.encode(img),
              "tags": [
                "string"
              ],
              "description": "string",
              "title": "string"
            })
        })
        .then(res=>res.json())
        .then(data=>{
          this.Dispatcher.trigger("img:save:success",data);  
        }).catch(e=>{
          this.Dispatcher.trigger("img:save:failed",{});  
        });
    }

    this.getImage = function (imageId){
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
 