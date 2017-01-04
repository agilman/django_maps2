var myApp = angular.module("myApp",['ui.router','ui.bootstrap']);

myApp.config(function($stateProvider){
    $stateProvider
	.state('advEditor',{
	    url:'',
	    templateUrl:'/www/partials/editor-adventures.html',
	    controller:'advEditorController',
	});
});

myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from main controller");
}]);


myApp.controller("advEditorController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from adv editor controller");
}]);
