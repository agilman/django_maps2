myApp.controller("blogEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setBlogEditorActive");

    $log.log("Hello from Blog editor controller");
}]);
