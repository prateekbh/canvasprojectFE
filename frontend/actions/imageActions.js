function ImageActions(){
    this.saveImage=function(img,tags,description,sessionId){
        console.log(LZW.encode(img).length,img.length);
        fetch(window.apiBase+"/image/save",{
            headers: Object.assign({},window.defaultHeaders,{'x-session-id': sessionId}),
            method: "POST",
            body: JSON.stringify({
              "image": LZW.encode(img),
              "tags": [
                "string"
              ],
              "account_id": sessionId,
              "description": "string",
              "title": "string"
            })
        })
        //this.Dispatcher.trigger("img:save",{});
    }
   
}

veronica.flux.Actions.createAction("ImageActions",ImageActions); 
 