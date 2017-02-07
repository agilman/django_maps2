myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $scope.userId = document.getElementById("userId").value;

    $scope.currentAdvId = null;
    $scope.currentAdvName = null ;

    
    
    $log.log("Hello from main controller");
}]);

