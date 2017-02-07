myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $scope.userId = document.getElementById("userId").value;

    $scope.adventures = [];
    $scope.currentAdvId = null;
    $scope.currentAdvName = null ;
    $scope.currentAdvIndex = null


    $scope.$on('advChangeEvent',function(event,index){
	$scope.currentAdvId = $scope.adventures[index].id;
	$scope.currentAdvName = $scope.adventure
	$scope.currentAdvIndex = index;
    });
    
    $log.log("Hello from main controller");
}]);

