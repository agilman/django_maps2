myApp.controller("advController",['$scope','$log','$http','leafletData',function($scope,$log,$http,leafletData){

    //get user adventures
    $http.get('/api/rest/userInfo/' + $scope.userId+'/').then(function(data){
	$scope.adventures = data.data.adventures;
	$scope.currentAdvId = $scope.adventures[$scope.adventures.length-1].id;
	$scope.currentAdvName = $scope.adventures[$scope.adventures.length-1].name;
	$scope.currentAdvIndex = $scope.adventures.length-1;
	
    });
    

    leafletData.getMap().then(function(map){
	advsOverviewLayer = new L.geoJson();
	advsOverviewLayer.addTo(map);

	currentAdvLayer = new L.LayerGroup();
	currentAdvLayer.addTo(map);

	segmentHighlightLayer = new L.LayerGroup();
	segmentHighlightLayer.addTo(map);
    });


    $scope.getAdvDistance = function(index){
	$log.log('test',index);
	if ($scope.advsOverviewData != null){
	    return $scope.advsOverviewData.features[index].properties.distance/1000;
	    
	}
    };
    
    //get geojson
    $http.get('/api/rest/advsOverview/' + $scope.userId+'/').then(function(data){
	$scope.advsOverviewData = data.data;


	//advsOverviewLayer.addData($scope.advsOverviewData);
	$log.log(data.data);
    });

    
    $log.log("Hello from adv controller");
}]);
