myApp.controller("mapsController",['$scope','$log','$http','$stateParams','$state','$timeout','leafletData',function($scope,$log,$http,$stateParams,$state,$timeout,leafletData){
    $scope.$emit("setViewer", {'page':'maps', 'advId':$stateParams.advId});

    $scope.maps = [];
    $scope.selectedMap = $stateParams.mapId;
    
    $scope.slickLoaded = false;
    $scope.pictures = [];

    
    
    //after leaflet loads, create layers
    leafletData.getMap().then(function(map){
	geoJsonLayer = new L.geoJson();
	geoJsonLayer.addTo(map);
    });

    function fitMap(bounds){
	leafletData.getMap().then(function(map) {
	    map.fitBounds(bounds);
	});
    };
    
    function filterPictures(){
	$log.log('filtering pictures');
	$log.log(allPictures);
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

	//draw map segments on map
	for (var i=0;i<data.data.length;i++){
	    geoJsonLayer.addData(data.data[i]);
	}

	//fit map
	fitMap(geoJsonLayer.getBounds());	
    });

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
	//This function handles click event for slider picture.
	//Mark pic location on map, center map on location, go to preview state.


	//get picture data.
	//var picData = null;
	//for(var i=0;i<$scope.pictures.length;i++){
	    
	//}
	
	$log.log("Got click", picId);
    };
    
    $log.log("Hello from Maps controller");
}]);
