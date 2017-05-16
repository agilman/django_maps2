myApp.controller("photoEditorAlbumController",['$scope','$log','$http','$stateParams','$timeout','leafletData',function($scope,$log,$http,$stateParams,$timeout,leafletData){
    //$scope.$emit("setPhotoEditorActive",$stateParams.currentAdvId);
    $scope.albumId = $stateParams.albumId;
    $scope.slickLoaded = false;
    $scope.pictures = [];
    $scope.selectedPictures = [];
    $scope.sliderIndex = null;
    
    $scope.newTag = false;

    //after leaflet loads, create layers
    leafletData.getMap().then(function(map){
	newTag = new L.LayerGroup();
	newTag.addTo(map);
	
	establishedTags = new L.LayerGroup();
	establishedTags.addTo(map);
        
    highlightedTags  = new L.LayerGroup();  
    highlightedTags.addTo(map);
    });
    
    function addEstablishedTags(){
	   establishedTags.clearLayers();
	   for (var i =0;i<$scope.pictures.length;i++){
           if ($scope.pictures[i].picMeta!=null){
		      var lat = $scope.pictures[i].picMeta.lat;
		      var lng = $scope.pictures[i].picMeta.lng;
		      
               //draw circle
		      var circleOptions = {'color':'#5980ff'};
		      var newLatLng = new L.latLng(lat,lng);
		      var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(2);

		      marker.addTo(establishedTags);
	       }
	   }
    };
    
    $http.get('/api/rest/pictures/' + $scope.albumId+"/").then(function(data){
	$scope.pictures = data.data;
	$timeout(function () {
	    $scope.slickLoaded = true;
	}, 10);

	addEstablishedTags();
    });


    function drawNewTagCircle(lat,lng){
	newTag.clearLayers();

	//draw circle
	var circleOptions = {'color':'#940f17'};
	var newLatLng = new L.latLng(lat,lng);
	var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);

	marker.addTo(newTag);
    };
    
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
	var lat = wrap.leafletEvent.latlng.lat;
	var lng = wrap.leafletEvent.latlng.lng;

	drawNewTagCircle(lat,lng);
	$scope.newTag = {'lat':lat,'lng':lng};
    });
    
    
    function mapPath(path){
	leafletData.getMap().then(function(map){
	    var line_options = {
		color: '#342d91',
		weight: '2'
	    }
	    
	    geoJsonLayer = new L.geoJson(path,line_options);
	    geoJsonLayer.addTo(map);
	    
	    map.fitBounds(geoJsonLayer.getBounds());
	});
    };
    
    //get map
    $scope.$watch("currentAlbumIndex",function(){
	if($scope.albums.length){ //if loaded at parent level...
	    var mapId = $scope.albums[$scope.$parent.currentAlbumIndex].advMap;
	    $http.get('/api/rest/map/' + mapId).then(function(data){
		mapPath(data.data);
	    });
	}
    });
    
    $scope.uploadClick = function(){
	var domElement = document.getElementById("file");
	domElement.click();
    };

    $scope.fileSelectChange = function(files){
	for(var i=0;i<files.length;i++){
	    $scope.slickLoaded = false;
	    
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
		$scope.pictures.push(data.data);
		
		$timeout(function () { 
		    $scope.slickLoaded = true;
		}, 10);
	    });
	}
    };

    function checkPicSelected(imgId){
	for (var i = 0; i<$scope.selectedPictures.length; i++){
	    if ($scope.selectedPictures[i].id==imgId){
		return i+1;
	    }
	}

	return 0;
    };

    $scope.saveGeotag = function(){
        var picIds = [];
        for (var i=0;i<$scope.selectedPictures.length;i++){
            picIds.push($scope.selectedPictures[i].id);
        }
        var data = {'pictures':picIds,
                    'tag':$scope.newTag};

	$http.post('/api/rest/geotagPictures',JSON.stringify(data)).then(function(data){
	    //add tags to $scope.pictures
	    for(var i = 0; i<data.data.length;i++){
		var tag = data.data[i];
		for(var p =0;p<$scope.pictures.length;p++){
		    if ($scope.pictures[p].id==tag.picture){
			$scope.pictures[p].picMeta = data.data[i];
		    }
		}
	    }
	    $scope.selectedPictures = [];
	    //redraw established circles
	    addEstablishedTags();


	    //clear temp circle	    
	    newTag.clearLayers();

	    //remove button
	    $scope.newTag =false;

	});	
    };
    
    function redrawSelectedTags(){
        //clear previous
        highlightedTags.clearLayers();

        for(var i = 0; i < $scope.selectedPictures.length;i++){
            var pic = $scope.selectedPictures[i];
            //check if has meta
            if(pic.picMeta!=null){
                
                var lat = pic.picMeta.lat;
                var lng = pic.picMeta.lng;

                if ((lat != null )&& (lng != null)){
                    //draw circle
                    var circleOptions = {'color':'#44CC8A'};
                    var borderOptions = {'color':'#000000'};
                    var newLatLng = new L.latLng(lat,lng);
                    var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(4);
                    var border= new L.circleMarker(newLatLng,borderOptions).setRadius(5);

                    border.addTo(highlightedTags);
                    marker.addTo(highlightedTags);
                }
            }
        }
    }
    
    function flyToPic(pic){
        if (pic.picMeta!=null){
            var lat = pic.picMeta.lat;
            var lng = pic.picMeta.lng;
            
            if((lat!=null)&&(lng!==null)){
                var center = new L.LatLng(lat,lng);
                leafletData.getMap().then(function(map){
                    var zoom = map.getZoom();
                    if (zoom>11){
                        map.flyTo(center,10);
                    }else if(zoom<6){
                        map.flyTo(center,10);
                    }else{
                        map.flyTo(center);
                    }
                });
            }
	}
    };

    $scope.imgClick = function(index){
        var img = $scope.pictures[index];
        var picIndex = checkPicSelected(img.id);
	
        //if already selected, deselect.
        if (picIndex){
            $scope.selectedPictures.splice(picIndex-1,1);
            
            redrawSelectedTags();
	}else{
            $scope.selectedPictures.push(img);
            //don't go too close to edges.
	    if(index>3){
		if(index>$scope.pictures.length-3){
                    $scope.slideConfig.method.slickGoTo($scope.pictures.length-3);
		}else{
                    $scope.slideConfig.method.slickGoTo(index);
		}	
	    }else{
		$scope.slideConfig.method.slickGoTo(3);
	    }
            
            redrawSelectedTags();
            flyToPic(img);
	}
    };
    
    $scope.getPictureClass= function(id){
	for (var i =0;i<$scope.selectedPictures.length;i++){
	    if ($scope.selectedPictures[i].id==id){
		return "selected-picture";
	    }
	}
	
	return "normal-picture";
    };
    
    $scope.slideConfig = {
	lazyLoad: 'ondemand',
	rows: 1,
	dots:true,
	speed:400,
	autoplay: false,
	infinite: false,
	slidesToShow:7,
	slidesToScroll:3,
	method:{},
	event: {
	    init: function (event, slick) {
		//No need for center mode.
		/*
		  if($scope.pictures.length>7){ //start slider on the right
		    slick.slickGoTo($scope.pictures.length-4);
		    $scope.slideConfig.slidesToShow=7;
		}else{
		    $scope.slideConfig.slidesToShow=$scope.pictures.length;
		}
		*/

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
	
	//check if need to wrap from end
	if($scope.sliderIndex<picsToSlide){
	    var gotothis=$scope.pictures.length-1-(picsToSlide-$scope.sliderIndex)
	    $scope.slideConfig.method.slickGoTo(gotothis);    
	}else{
	    $scope.slideConfig.method.slickGoTo($scope.sliderIndex-picsToSlide);
	}
    };

    $scope.sliderGoRight = function(){
	var picsToSlide = 5;
	if($scope.pictures.length<=8){
	    picsToSlide = 2;
	}
	
	//check if need to wrap to beginning
	if ($scope.sliderIndex>$scope.pictures.length-1-picsToSlide){ 
	    if ($scope.pictures.length>=3){
		$scope.slideConfig.method.slickGoTo(3);
	    }else{
		var gotothis = picsToSlide - $scope.pictures.length - $scope.sliderIndex;
		$scope.slideConfig.method.slickGoTo(gotothis);
	    }
	}else{
	    $scope.slideConfig.method.slickGoTo($scope.sliderIndex+picsToSlide);
	}
    };

    $scope.deleteSelected = function(){
	//Send list to delete...
    var picIds = [];
    for (var i=0;i<$scope.selectedPictures.length;i++){
        picIds.push($scope.selectedPictures[i].id);
    }
        
	$http.post('/api/rest/deletePictures/'+$scope.albumId+"/",JSON.stringify(picIds)).then(function(data){
	    $scope.slickLoaded = false;
	    
	    for(var i=0;i<$scope.selectedPictures.length;i++){
		//check if picture has been deleted...
		for(var p=0;p<data.data.length;p++){
            // Found selected picture in deleted pictures... remove from gallery
		    if ($scope.selectedPictures[i].id == data.data[i]){
			for(var q=0;q<$scope.pictures.length;q++){
			    if($scope.pictures[q].id==$scope.selectedPictures[i].id){
				$scope.pictures.splice(q,1);
			    }
			}
		    }
		}
	    }
	    //unselect all
	    $scope.selectedPictures = [];
        //clear highlights from map
        highlightedTags.clearLayers();
        
	    //reinit slider
	    $timeout(function () {
		$scope.slickLoaded = true;
	    }, 10);

	    //redraw established tags on map
	    addEstablishedTags();        
	});
    };
    
    $log.log("Hello from photoAlbumController");
}]);




