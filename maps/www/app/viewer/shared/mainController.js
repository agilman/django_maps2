myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $scope.userId = document.getElementById("userId").value;

    $scope.adventures = [];
    $scope.currentAdvId = null;
    $scope.currentAdvName = null ;
    $scope.currentAdvIndex = null;

    $scope.currentPage = null;

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
	}
    });

    $scope.$on('advChangeEvent',function(event,index){
	$scope.currentAdvId = $scope.adventures[index].id;
	$scope.currentAdvName = $scope.adventures[index].name;
	$scope.currentAdvIndex = index;
    });

    $scope.$on('setViewer',function(event,opts){
	$scope.currentPage = opts.page;

	$scope.currentAdvId = opts.advId;
	for (var i =0;i<$scope.adventures.length;i++){
	    if ($scope.adventures[i].id == opts.advId){
		$scope.currentAdvName = $scope.adventures[i].name;
		$scope.currentAdvIndex = i;
	    }
	}
    });

    $scope.isAdvsPageActive = function(){
	if($scope.currentPage =='advs'){
	    return "active";
	}
    };

    $scope.isMapsPageActive = function(){
	if($scope.currentPage =='maps'){
	    return "active";
	}
    };

    $scope.isBlogsPageActive = function(){
	if($scope.currentPage =='blogs'){
	    return "active";
	}
    };

    $scope.isGearPageActive = function(){
	if($scope.currentPage =='gear'){
	    return "active";
	}
    };


    $scope.$on('advsSelected',function(event){
	$scope.currentPage = 'advs';
    })
    
    $log.log("Hello from main controller");
}]);

