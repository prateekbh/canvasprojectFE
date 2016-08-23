function ToastStore(){
    var self=this;

    var toastData=null;

    this.Dispatcher.register('toast:show',(data)=>{
    	toastData = data;
    	this.emit('toast:show');
    });

    this.getToastData = function(){
    	return toastData;
    }
}
 
//creating an store 
veronica.flux.Stores.createStore("ToastStore",ToastStore);  