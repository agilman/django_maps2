myApp.controller("photoEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http,$stateParams){
    $scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);
    $log.log("Hello from photoEditorController");    
}]);
