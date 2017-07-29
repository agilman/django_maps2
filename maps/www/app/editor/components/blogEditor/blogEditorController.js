myApp.controller("blogEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setBlogEditorActive");
    
    $scope.maps = [] ; //blogs are tied to maps....
    $scope.currentMapId = null;
    $scope.currentMapIndex = null;

    /*
    $http.get('/api/rest/blogs/' + $scope.currentAdvId+"/").then(function(data){
	$scope.maps = data.data;

	//TODO: figure if there are multiple maps,
	if($scope.maps.length){
	    //if current mapId is NOT set (set last map as current):
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
    */
    
    $scope.saveBlog = function (){
	var data = {'title':$scope.blogTitle,
		    'entry':$scope.blogHTML};

	$http.post('/api/rest/blogs/',JSON.stringify(newAdv)).then(function(data){
	    $scope.adventures.push(data.data);

	});

	$log.log("Send data back to server");
    };
    
    $log.log("Hello from Blog editor controller");
}]);
