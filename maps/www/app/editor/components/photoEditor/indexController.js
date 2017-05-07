myApp.controller("photoEditorController",['$scope','$log','$http','$stateParams','$state',function($scope,$log,$http,$stateParams,$state){    
    $scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);

    $scope.albums = [];
    $scope.currentAlbumId=null;
    $scope.currentAlbumIndex=null;
    
    $http.get('/api/rest/advAlbums/' + $scope.currentAdvId+"/").then(function(data){
	$scope.albums= data.data;

	if($scope.albums.length){
	    if(!$scope.currentAlbumId){ //if there is no albumId, use last
		$scope.currentAlbumId=$scope.albums[$scope.albums.length-1].id;
		$scope.currentAlbumIndex=$scope.albums.length-1;
		
		$state.go('photosEditor.album',{albumId:$scope.currentAlbumId});
	    }else{
		//got albumId from URL... set it up as current selected.
		for(var i =0;i<$scope.albums.length;i++){
		    if($scope.albums[i].id==$scope.currentAlbumId){
			
			$scope.currentAlbumIndex = i;
		    }
		}
	    }
	}
	
	$log.log(data.data);
    });

    $scope.getAlbumClass = function(index){
	if($scope.currentAlbumIndex==index){
	    return "btn-primary";

	}else{
	    return "btn-default";
	}

    };

    $scope.changeAlbum = function(index){
	$scope.currentAlbumIndex=index;
	$scope.currentAlbumId=$scope.albums[index].id;
	$state.go('photosEditor.album',{albumId:$scope.currentAlbumId});
    };
    
    $log.log("Hello from photoEditorController");    
}]);
