function ToastActions(){
    this.showToast = function(text,opts){
        this.Dispatcher.trigger("toast:show",{text:text,data:opts});
    }

    this.showSnackBar = function(text,opts){
        this.Dispatcher.trigger("snackbar:show",{text:text,data:opts});
    }
   
}

veronica.flux.Actions.createAction("ToastActions",ToastActions); 
 