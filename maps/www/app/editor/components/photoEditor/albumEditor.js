myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams',function($scope,$log,$http,$stateParams){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);

    $scope.uploadClick = function(){
	var domElement = document.getElementById("file");
	domElement.click();
    };

    $scope.fileSelectChange = function(files){
	$log.log(files.length);
	for(var i=0;i<files.length;i++){

	    
	    var fd = new FormData();
	    //Take the first selected file
	    fd.append("albumId", parseInt($scope.currentAlbumId));
	    fd.append("file", files[i]);
	    $log.log(files[i]);
	    $log.log($scope.currentAlbumId);
	    var uploadUrl= "/api/rest/albumPhoto/";
	    $http.post(uploadUrl, fd, {
		withCredentials: true,
		headers: {'Content-Type': undefined }
		//transformRequest: angular.identity
	    }).then(function(data){
		//$scope.profilePic = "/www/user_media/"+$scope.userId+"/profile_pictures/"+data.data.picId+".png";
		$log.log("photo uploaded succcessfully");
		$log.log(data.data);
	    });
	}
	};
    
    
    $log.log("Hello from photoEditorController");    
}]);