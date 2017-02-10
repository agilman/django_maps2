myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $scope.userId = document.getElementById("userId").value;

    $scope.adventures = [];
    $scope.currentAdvId = null;
    $scope.currentAdvName = null ;
    $scope.currentAdvIndex = null

    //get user adventures
    $http.get('/api/rest/userInfo/' + $scope.userId+'/').then(function(data){
	$scope.adventures = data.data.adventures;
	
	//By default select last.
	if(!$scope.currentAdvId){
	    if ($scope.adventures.length){
		$scope.currentAdvId = $scope.adventures[$scope.adventures.length-1].id;
		$scope.currentAdvName = $scope.adventures[$scope.adventures.length-1].name;
		$scope.currentAdvIndex = $scope.adventures.length-1;

	    }
	}else{
	    $log.log("GOT ADV ID, NOT ASSIGNING");
	}
    });
    

    $scope.$on('advChangeEvent',function(event,index){
	$scope.currentAdvId = $scope.adventures[index].id;
	$scope.currentAdvName = $scope.adventure
	$scope.currentAdvIndex = index;
    });
    
    $log.log("Hello from main controller");
}]);

