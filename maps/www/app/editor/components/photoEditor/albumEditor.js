myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams','$timeout',function($scope,$log,$http,$stateParams,$timeout){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);
    $scope.albumId = $stateParams.albumId;
    $scope.slickLoaded = false;
    $scope.pictures = [];
    $scope.sliderIndex = null;
    $http.get('/api/rest/pictures/' + $scope.albumId+"/").then(function(data){
	$scope.pictures = data.data;
	$timeout(function () {
	    $scope.slickLoaded = true;
	}, 10);

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
		
		$timeout(function () {
		    $scope.slickLoaded = true;
		}, 10);
		
		$timeout(function () {
		    $scope.slideConfig.method.slickGoTo($scope.pictures.length-1);
		},100);
	    });
	}	
    };
    
    $scope.slideConfig = {
	lazyLoad: 'ondemand',
	rows: 1,
	dots:true,
	autoplay: false,
	infinite: true,
	slidesToShow:6,
	slidesToScroll:5,
	centerMode: true,
	method:{},
	event: {
	    init: function (event, slick) {
		//
	    },
	    afterChange: function (event, slick, currentSlide, nextSlide) {
		//track index on change.
		$scope.sliderIndex=currentSlide;
	    },
	    swipe: function(event,slick,direction){
		$log.log("swipe",direction);
		if(direction=="right"){
		    $log.log("going right");
		    slick.slickGoTo(-5);
		}else if (direction=="left"){
		    $log.log("going left");
		}
	    }   
	},
	responsive: [
	    {
		breakpoint: 1024,
		settings: {
		    slidesToShow: 5,
		    slidesToScroll: 5,
		    infinite: true,
		    dots: true
		}
	    },
	    {
		breakpoint: 600,
		settings: {
		    slidesToShow: 4,
		    slidesToScroll: 2
		}
	    }
	]
    };
    
    $scope.sliderGoLeft = function(){
	if($scope.sliderIndex<5){
	    $scope.slideConfig.method.slickGoTo($scope.pictures.length-1-(5-$scope.sliderIndex));
	}

	$scope.slideConfig.method.slickGoTo($scope.sliderIndex-5);	
    };

    $scope.sliderGoRight = function(){
	$scope.slideConfig.method.slickGoTo($scope.sliderIndex+5);
    };
    
    $log.log("Hello from photoAlbumController");    
}]);




