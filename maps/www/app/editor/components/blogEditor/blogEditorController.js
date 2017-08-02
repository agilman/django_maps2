myApp.controller("newBlogEditorController",['$scope','$log','$http','$stateParams','$state',function($scope,$log,$http, $stateParams,$state){
    $scope.currentMapId = $stateParams.mapId;
    $scope.blogs=[];
    
    $scope.blogTitle="";
    $scope.blogHTML="";
    $scope.currentBlogIndex = -1;

    $http.get('/api/rest/blogs/' + $scope.currentMapId+"/").then(function(data){
	$scope.blogs = data.data;
	
    });

    $scope.blogClass = function(index){
	if($scope.currentBlogIndex==index){
	    return "active";
	}else{
	    return "default";
	}
    };

    $scope.$on("setBlogActive",function(event,blogId){
	for(var i=0;i<$scope.blogs.length;i++){
	    if ($scope.blogs[i].id==blogId){
		$scope.currentBlogIndex=i;
	    }
	}
    });


    ///THIS MIGHT BE USED>... TESTING...
    $scope.newBlogClick = function(){
	if($scope.currentBlogIndex==-1){
	    //Maybe ask if the user wants to start a clear blog... 
	}else{
	    $scope.currentBlogIndex=-1;
	    $state.go('blogsEditor.map',{mapId:$scope.currentMapId});
	}
    };
    
    $scope.extractContent = function(index){
	var span= document.createElement('span');
	span.innerHTML= $scope.blogs[index].entry;
	return span.textContent || span.innerText;
	
    };

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
    };
    
    $scope.formatTime = function(index){
	var ts = $scope.blogs[index].saveTime;
	//$log.log(ts);
	return moment(ts).format("MMMM Do, YYYY");
    };
    
    $log.log("Hello from Blog editor controller");
}]);
