myApp.controller("mapsController",['$scope','$log','$http','$stateParams','$state','leafletData',function($scope,$log,$http,$stateParams,$state,leafletData){
    $scope.$emit("mapViewer", $stateParams.advId);

    $scope.maps = [];

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
    

    $http.get('/api/rest/advMapSegments/' + $scope.currentAdvId).then(function(data){
	$scope.maps = data.data;

	//draw map segments on map
	for (var i=0;i<data.data.length;i++){
	    geoJsonLayer.addData(data.data[i]);
	}

	//fit map
	fitMap(geoJsonLayer.getBounds());	
    });    
    
    $log.log("hello from maps Controller");
}]);
