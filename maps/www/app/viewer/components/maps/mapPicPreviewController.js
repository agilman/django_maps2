myApp.controller("picPreviewController",['$scope','$log','$http','$stateParams','$state','$timeout',function($scope,$log,$http,$stateParams,$state,$timeout){    
     var picId = $stateParams.picId;

    //try to set stff in parent scope (selectedPic in preview and add dot to map)
    $scope.$watch('pictures', function(dataLoaded) {
	if (dataLoaded){
	    for(var i=0;i<dataLoaded.length;i++){
		if (dataLoaded[i].id==picId){
		    $scope.selectedPic = dataLoaded[i];

		    picLocationLayer.clearLayers();
		    //draw pic location dot on the map
		    if ($scope.selectedPic.picMeta){
			var lat = $scope.selectedPic.picMeta.lat;
			var lng = $scope.selectedPic.picMeta.lng;
			//draw circle
			var circleOptions = {'color':'#940f17'};
			var newLatLng = new L.latLng(lat,lng);
			var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);

			marker.addTo(picLocationLayer);
		    }
		}
	    }
	}
    });
    
    $log.log("Hello from pic Preview controller");
}]);
