myApp.controller("photoEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http,$stateParams){    
    $scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);

    $scope.albums = [];
    $http.get('/api/rest/advAlbums/' + $scope.currentAdvId+"/").then(function(data){
	$log.log(data.data);
    });
    
    
    $log.log("Hello from photoEditorController");    
}]);
