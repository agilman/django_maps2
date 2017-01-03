var myApp = angular.module("myApp",['ui.bootstrap']);

myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from main controller");
}]);
