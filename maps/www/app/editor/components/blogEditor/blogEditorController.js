myApp.controller("blogEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentMapId = $stateParams.mapId;
    $scope.blogs=[];
    
    $scope.blogTitle="";
    $scope.blogHTML="";

    $http.get('/api/rest/blogs/' + $scope.currentMapId+"/").then(function(data){
	$scope.blogs = data.data;
	
    });
    
    $scope.saveBlog = function (){
	var newBlog = {'adv': $scope.currentAdvId,
		       'map' : $scope.currentMapId,
		       'title' : $scope.blogTitle,
		       'entry' : $scope.blogHTML};
	
	$http.post('/api/rest/blogs/'+$scope.currentMapId+"/",JSON.stringify(newBlog)).then(function(data){
	    $scope.blogs.push(data.data);

	    //clear fields
	    $scope.blogTitle="";
	    $scope.blogHTML="";
	   
	});

	$log.log("Send data back to server");
    };

    $scope.extractContent = function(index){
	var span= document.createElement('span');
	span.innerHTML= $scope.blogs[index].entry;
	return span.textContent || span.innerText;
	
    };
    
    $log.log("Hello from Blog editor controller");
}]);
