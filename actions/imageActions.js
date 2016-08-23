function ImageActions(){
    this.saveImage = function(imgId, img,tags,description,sessionId){
        fetch(window.apiBase+"/image/save",{
            headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
            method: "POST",
            mode: 'cors',
            credentials: 'include',
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
        .then(handleErrors)
        .then(res=>res.json())
        .then(data=>{
          this.Dispatcher.trigger("img:save:success",data);  
        }).catch(e=>{
          this.Dispatcher.trigger("img:save:failed",{});  
        });
    }

    this.likeImage = function(imageId, liked, sessionId){
      fetch(window.apiBase+'/image/'+imageId+'/like',{
        headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
        method: "POST",
        mode: 'cors',
        credentials: 'include',
        body:''
      })
      .then(handleErrors)
      .then(res=>res.json())
      .then(data=>{
        console.log(data);
      });
    }

    this.cloneImage = function(imageId, sessionId){
      var fetchPromise = fetch(window.apiBase+'/image/clone',{
        headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
        method: "POST",
        mode: 'cors',
        credentials: 'include',
        body:JSON.stringify({ image_id: imageId})
      })
      .then(res=>{
        if(res.status!==200){
          throw newError('Image Cloning failed');
        }
        return res.json()
      })
      .then(data=>{
        this.Dispatcher.trigger("img:clone:success",data);
      })
      .catch(e=>{
        this.Dispatcher.trigger("img:clone:failed",e);
      })
    }

    this.publishImage = function(imageId){
      //implement fetch here
    }

    this.fetchImage = function (imageId){
      fetch(apiBase+"/image/details/"+imageId,{
        mode: 'cors',
        credentials: 'include'
      })
      .then(handleErrors)
      .then(res=>res.json())
      .then(data=>{
        this.Dispatcher.trigger("img:detailsfetch:success",data);  
      }).catch(e=>{
        this.Dispatcher.trigger("img:detailsfetch:failed",{});  
      });
      
    }
}

veronica.flux.Actions.createAction("ImageActions",ImageActions); 
 