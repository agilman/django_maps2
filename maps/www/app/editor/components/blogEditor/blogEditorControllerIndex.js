myApp.controller("blogEditorControllerIndex",['$scope','$log','$http','$stateParams','$state',function($scope,$log,$http, $stateParams,$state){
    $scope.$emit("setBlogEditorActive",$stateParams.currentAdvId);
    
    $scope.maps = [] ; //blogs are tied to maps....
    $scope.currentMapId = null;
    $scope.currentMapIndex = null;

    $http.get('/api/rest/advMaps/' + $scope.currentAdvId+"/").then(function(data){
	$scope.maps = data.data;
	
	//TODO: figure if there are multiple maps,
	if($scope.maps.length){
	    //if current mapId is NOT set ... set last as current
	    
	    if (!$scope.currentMapId){
		$scope.currentMapId = $scope.maps[$scope.maps.length-1].id;
		$scope.currentMapIndex = $scope.maps.length-1;
		$state.go('blogsEditor.map',{mapId:$scope.currentMapId});
	    }else{
		//Got mapId from URL.. set it up as current.
		for(var i=0;i<$scope.maps.length;i++){
		    if($scope.maps[i].id==$scope.currentMapId){
			$scope.currentMapIndex=i;
		    }
		}
	    }
	}
    });

    $scope.getMapClass = function(index){
	if($scope.currentMapIndex==index){
	    return "btn-primary";
	}else{
	    return "btn-default";
	}
    };

    $scope.changeMap = function(index){
	$scope.currentMapIndex=index;
	$scope.currentMapId=$scope.maps[index].id;
	$state.go('blogsEditor.map',{mapId:$scope.currentMapId});
    };
    
    
    $log.log("Hello from Blog editor index");
}]);
