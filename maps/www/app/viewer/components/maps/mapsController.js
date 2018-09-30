myApp.controller("mapsController",['$scope','$log','$http','$stateParams','$state','$timeout','leafletData',function($scope,$log,$http,$stateParams,$state,$timeout,leafletData){
    $scope.$emit("setViewer", {'page':'maps', 'advId':$stateParams.advId});

    $scope.maps = [];
    $scope.selectedMap = $stateParams.mapId;
    
    $scope.slickLoaded = false;

    //after leaflet loads, create layers
    leafletData.getMap().then(function(map){
	var backgroundLine_options = {
		    color: '#474849',
		    weight: '2'
	};

	allPathsLayer = new L.geoJson([],{style:backgroundLine_options});
	allPathsLayer.addTo(map);

	var selectedPath_options = {
	    weight:'5',
	};
	
	selectedPathLayer = new L.geoJson([],{style:selectedPath_options});
	selectedPathLayer.addTo(map);
	
	picLocationLayer = new L.LayerGroup();
	picLocationLayer.addTo(map);
    });

    function fitMap(bounds){
	leafletData.getMap().then(function(map) {
	    map.fitBounds(bounds);
	});
    };
    
    function filterPictures(){
	if ($scope.selectedMap!=0){
	    var results = [];
	    for (var i=0;i<allPictures.length;i++){
		if(allPictures[i].album==$scope.selectedMap){
		    results.push(allPictures[i]);
		}
	    }
	    return results;
	}else
	{
	    return allPictures ;
	}
    };
    
    //get map
    $http.get('/api/rest/advMapSegments/' + $scope.currentAdvId).then(function(data){
	$scope.maps = data.data;

	//draw entire path on map
	if ($scope.maps.length){
	    for (var i=0;i<data.data.length;i++){
		allPathsLayer.addData(data.data[i]);
	    }

	    //fit map
	    fitMap(allPathsLayer.getBounds());
	}

	//draw blue path to show selected map.
	drawSelectedMapPath();
	

    });

    function drawSelectedMapPath(){
	for(var i =0;i<$scope.maps.length;i++){
	    if($scope.selectedMap==0){
		selectedPathLayer.addData($scope.maps[i]);
	    }
	    
	    if ($scope.maps[i].properties.mapId==$scope.selectedMap){
		selectedPathLayer.addData($scope.maps[i]);
		
	    }
	}	
    }

    $http.get('/api/rest/advPictures/' + $scope.currentAdvId).then(function(data){	
	allPictures = data.data;

	$scope.pictures = filterPictures();//this filters 

	$timeout(function () {
	    $scope.slickLoaded = true;
	}, 10);	
    });



    $scope.slideConfig = {
	lazyLoad: 'ondemand',
	rows: 1,
	dots:true,
	speed:400,
	autoplay: false,
	infinite: false,
	slidesToShow:7,
	slidesToScroll:3,
	method:{}
    };

    $scope.isAllMapsActive = function(){
	if ($scope.selectedMap==0){
	    return "active"
	}
    }
    
    $scope.mapSelectClick = function(mapId){
	//set stuff, change state?
	$scope.selectedMap=mapId;
	$scope.slickLoaded= false;
	$scope.pictures = filterPictures();

	//reinit slider
	$timeout(function () {
	    $scope.slickLoaded = true;
	}, 20);
	
	
	$state.transitionTo("maps",{advId:$scope.currentAdvId,mapId:mapId },{notify:false}); // transition state changes url but doesn't cause vars to reload
    };
    
    $scope.picClick = function(picId){
	//This function handles click event for slider picture...go to preview state.
	$state.transitionTo("maps.picPreview",{advId:$scope.currentAdvId, mapId:$scope.selectedMap, picId:picId });
    };
    
    $log.log("Hello from Maps controller");
}]);
