myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams',function($scope,$log,$http,$stateParams){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);


    $scope.uploadClick = function(){
	var domElement = document.getElementById("file");
	domElement.click();
    };
    
    $log.log("Hello from photoEditorController");    
}]);
