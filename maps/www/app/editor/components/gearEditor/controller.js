myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive");
    
    $scope.treeConfig = { core :  {
	themes : {
	    icons: false} },
	plugins : [ "wholerow","themes", "grid"]}

    $scope.treeData = [{'id':"1", 'text':"FUUU", 'parent': '#', "state":{"opened":true}}];
    
    $log.log("Hello from Gear editor controller");
}]);
