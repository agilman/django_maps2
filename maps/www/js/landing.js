var myApp = angular.module("myApp",['ui.bootstrap']);

myApp.controller("mainController",['$scope','$log',function($scope,$log){
    $log.log("Hello from main controller");
}]);

