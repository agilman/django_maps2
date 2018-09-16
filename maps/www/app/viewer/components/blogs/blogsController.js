myApp.controller("blogsController",['$scope','$log','$http','$stateParams','$state',function($scope,$log,$http,$stateParams,$state){
    $scope.$emit("setViewer", {'page':'blogs','advId':$stateParams.advId});
    
    $log.log("hello from Blogs controller");
}]);
