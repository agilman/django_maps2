myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams',function($scope,$log,$http,$stateParams){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);
    $scope.albumId = $stateParams.albumId;
    $scope.slickLoaded = false;
    $scope.pictures = [];
        
    $http.get('/api/rest/pictures/' + $scope.albumId+"/").then(function(data){
	$scope.pictures = data.data;
	$scope.slickLoaded = true;
    });    
    
    $scope.uploadClick = function(){
	var domElement = document.getElementById("file");
	domElement.click();
    };

    $scope.fileSelectChange = function(files){
	for(var i=0;i<files.length;i++){	    
	    var fd = new FormData();
	    //Take the first selected file
	    fd.append("albumId", parseInt($scope.currentAlbumId));
	    fd.append("file", files[i]);

	    var uploadUrl= "/api/rest/pictures/"+$scope.albumId+"/";
	    $http.post(uploadUrl, fd, {
		withCredentials: true,
		headers: {'Content-Type': undefined }
		//transformRequest: angular.identity
	    }).then(function(data){
		$scope.slickLoaded = false;
		$scope.pictures.push(data.data);
		$scope.slickLoaded = true;
	    });
	}
    };
    
    $scope.slickConfig = {
	autoplay: false,
	infinite: true,
	slidesToShow: 5,
	slidesToScroll: 1,
	method: {}
    };
    
    
    $log.log("Hello from photoAlbumController");    
}]);




