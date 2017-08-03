myApp.controller("blogReeditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentBlogId = $stateParams.blogId;
    $scope.$emit("setBlogActive",$stateParams.blogId);    
    
    $scope.blogTitle="";
    $scope.blogHTML="";

    $scope.titleChanged=false;
    $scope.entryChanged=false;
    
    $http.get('/api/rest/blogs/' + $scope.currentMapId+"/"+$scope.currentBlogId+"/").then(function(data){
	$scope.blogTitle= data.data.title;
	$scope.blogHTML = data.data.entry;
    });
    
    $scope.updateBlog = function(){
	var update = {'adv': $scope.currentAdvId,
		       'map' : $scope.currentMapId,
		       'title' : $scope.blogTitle,
		       'entry' : $scope.blogHTML};
	
	$http.put('/api/rest/blogs/'+$scope.currentMapId+"/"+$scope.currentBlogId+"/",JSON.stringify(update)).then(function(data){
	    $scope.blogs[$scope.currentBlogIndex] = data.data;
	    
	    //clear fields
	    $scope.titleChanged=false;
	    $scope.entryChanged=false;
	});
	
    };
    
    $log.log("Hello from Blog Reeditor controller");
}]);
