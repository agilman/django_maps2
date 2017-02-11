myApp.controller("mapsController",['$scope','$log','$http','$stateParams','$state','leafletData',function($scope,$log,$http,$stateParams,$state,leafletData){
    $scope.$emit("mapViewer", $stateParams.advId);

    $scope.maps = [];

    //load maps overview data...
    $http.get('/api/rest/mapsOverview/' + $scope.currentAdvId+'/').then(function(data){
	//$log.log($scope.$parent.currentAdvId);
	$scope.maps.push({'mapId':0,'mapName':'Overview'});
	for (var i=0; i< data.data.features.length; i++){
	    $scope.maps.push({'mapId':data.data.features[i].properties.mapId,'mapName':data.data.features[i].properties.mapName});
	}
    });    
    
    
    $log.log("hello from maps Controller");
}]);
