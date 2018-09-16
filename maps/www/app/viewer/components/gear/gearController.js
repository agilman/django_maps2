myApp.controller("gearController",['$scope','$log','$http','$stateParams','$state',function($scope,$log,$http,$stateParams,$state){
    $scope.$emit("setViewer",{'page':'gear', 'advId':$stateParams.advId});

    
    $log.log("Hello from Gear controller");
}]);
