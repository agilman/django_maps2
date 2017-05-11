myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams','$timeout','leafletData',function($scope,$log,$http,$stateParams,$timeout,leafletData){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);
    $scope.albumId = $stateParams.albumId;
    $scope.slickLoaded = false;
    $scope.pictures = [];
    $scope.selectedPictures = [];
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
	    fd.append("albumId", parseInt($scope.albumId));
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

	    });
	}	
    };

    function checkPicSelected(imgId){
	for (var i = 0; i<$scope.selectedPictures.length; i++){
	    if ($scope.selectedPictures[i]==imgId){
		return i+1;
	    }
	}

	return 0;
    };
    $scope.imgClick = function(index){
	var img = $scope.pictures[index];

	var picIndex = checkPicSelected(img.id);
	if (picIndex){ //if already selected, deselect.
	    $scope.selectedPictures.splice(picIndex-1,1);
	}else{
	    $scope.selectedPictures.push(img.id);
	    
	    if(index>3){ //don't go too close to edges.
		if(index>$scope.pictures.length-3){
		    $scope.slideConfig.method.slickGoTo($scope.pictures.length-3);
		}else{
		    $scope.slideConfig.method.slickGoTo(index);
		}	
	    }else{
		$scope.slideConfig.method.slickGoTo(3);
	    }		
	}
    };

    $scope.getPictureClass= function(id){
	for (var i =0;i<$scope.selectedPictures.length;i++){
	    if ($scope.selectedPictures[i]==id){
		return "selected-picture";
	    }
	}

	return "normal-picture";
    };
    
    $scope.slideConfig = {
	lazyLoad: 'ondemand',
	rows: 1,
	dots:true,
	speed:600,
	autoplay: false,
	infinite: false,
	slidesToShow:7,
	slidesToScroll:3,
	centerMode: true,
	method:{},
	event: {
	    init: function (event, slick) {
		//There is a known bug with slick carousel, when in centerMode and the number of slides is greater then slidesToShow, few slides are off the edge
		//In this case, I am disabling center mode, and lowering the number of slidesToShow to be just right.
		
		if($scope.pictures.length>7){ //start slider on the right
		    slick.slickGoTo($scope.pictures.length-4);
		    $scope.slideConfig.centerMode=true;
		    $scope.slideConfig.slidesToShow=7;

		}else{
		    $scope.slideConfig.centerMode=false;
		    $scope.slideConfig.slidesToShow=$scope.pictures.length;
		}		    

	    },
	    afterChange: function (event, slick, currentSlide, nextSlide) {
		//track index on change.
		$scope.sliderIndex=currentSlide;
	    },
	    swipe: function(event,slick,direction){
		$log.log("swipe",direction);
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
	var picsToSlide = 5;
	if($scope.pictures.length<=8){
	    picsToSlide = 2;
	}

	if($scope.sliderIndex<picsToSlide){ //check if need to wrap from end
	    var gotothis=$scope.pictures.length-1-(picsToSlide-$scope.sliderIndex)
	    $scope.slideConfig.method.slickGoTo(gotothis);
	}else{
	    $scope.slideConfig.method.slickGoTo($scope.sliderIndex-picsToSlide);
	}
	
    };

    $scope.sliderGoRight = function(){
	var picsToSlide=5;
	if($scope.pictures.length<=8){
	    picsToSlide =2;
	}

	if ($scope.sliderIndex>$scope.pictures.length-1-picsToSlide){ //check if need to wrap to beginning
	    var gotothis = picsToSlide - $scope.pictures.length -$scope.sliderIndex;
	    $scope.slideConfig.method.slickGoTo(gotothis);
	    $log.log("need to wrap");
	    
	}else{
	    $scope.slideConfig.method.slickGoTo($scope.sliderIndex+picsToSlide);
	}
	
    };


    $scope.deleteSelected = function(){
	//Send list to delete...
	$http.post('/api/rest/deletePictures/'+$scope.albumId+"/",JSON.stringify($scope.selectedPictures)).then(function(data){
	    $scope.slickLoaded = false;
	    
	    for(var i=0;i<$scope.selectedPictures.length;i++){
		//check if picture has been deleted...
		for(var p=0;p<data.data.length;p++){
		    if ($scope.selectedPictures[i] == data.data[i]){ // Found selected picture in deleted pictures... remove from gallery
			for(var q=0;q<$scope.pictures.length;q++){
			    if($scope.pictures[q].id==$scope.selectedPictures[i]){
				$scope.pictures.splice(q,1);
			    }
			}
		    }
		}
	    }

	    //unselect all
	    $scope.selectedPictures = [];

	    //reinit slider
	    $timeout(function () { 
		$scope.slickLoaded = true;
	    }, 10);		
	});
	
    };
    
    $log.log("Hello from photoAlbumController");    
}]);




