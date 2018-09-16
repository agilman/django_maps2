myApp.controller("mapsController",['$scope','$log','$http','$stateParams','$state','$timeout','leafletData',function($scope,$log,$http,$stateParams,$state,$timeout,leafletData){
    $scope.$emit("setViewer", {'page':'maps', 'advId':$stateParams.advId});

    $scope.maps = [];
    
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
	$scope.pictures = data.data;
	
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
    
    $log.log("Hello from Maps controller");
}]);
