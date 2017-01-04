var myApp = angular.module("myApp",['ui.router','ui.bootstrap']);
myApp.config(function($stateProvider){
    $stateProvider
	.state('advSelect',{
	    url:'',
	    templateUrl:'/www/partials/profile-advSelect.html',
	    controller:'advController',
	});
});

myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from main controller");
}]);

myApp.controller("advController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from adv controller");
}]);
