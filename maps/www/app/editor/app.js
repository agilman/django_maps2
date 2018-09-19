angular.lowercase=function(text){  //this is a workaround to removed function... https://stackoverflow.com/questions/50448326/uncaught-typeerror-angular-lowercase-is-not-a-function
    if (text){
	return text.toLowerCase();
    }else{
	return null;
    }
}

var myApp = angular.module("myApp",['ui.router','ui.bootstrap','ui.bootstrap.datetimepicker','leaflet-directive','slickCarousel','angularSpinner','textAngular','ngJsTree']);
