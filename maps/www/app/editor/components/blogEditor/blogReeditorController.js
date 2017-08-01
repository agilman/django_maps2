myApp.controller("blogReeditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentBlogId = $stateParams.blogId;
        
    $scope.blogTitle="";
    $scope.blogHTML="";

    $http.get('/api/rest/blogs/' + $scope.currentMapId+"/"+$scope.currentBlogId+"/").then(function(data){
	$log.log(data.data);
	
    });

    /*
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

    $scope.formatTime = function(index){
	var ts = $scope.blogs[index].saveTime;
	//$log.log(ts);
	return moment(ts).format("MMMM Do, YYYY");
    };
    */
    
    $log.log("Hello from Blog Reeditor controller");
}]);
