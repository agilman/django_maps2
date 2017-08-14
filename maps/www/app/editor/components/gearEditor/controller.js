myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive",$stateParams.currentAdvId);

    $scope.itemName = null;
    $scope.weight = 0.0;
    $scope.weightUnits = 1;
    
    $scope.treeConfig = { core :  {
	themes : {
	    icons: false} },
	plugins : [ "wholerow","themes", "grid"]}

    $scope.treeData = [{'id':"1", 'text':"FUUU", 'parent': '#', "state":{"opened":true}}];

    $http.get('/api/rest/gear/'+$scope.currentAdvId+"/").then(function(data){
	$log.log(data.data);
    });
    
    $scope.addItem = function(){
	//figure out if parent ID or null...
	var newItem = {'adv': $scope.currentAdvId,
		       'parent': null,
		       'name' : $scope.itemName,
		       'ref' : null,//$scope.ref,
		       'weight' : $scope.weight,
		       'weightUnit': $scope.weightUnit};
	
	$http.post('/api/rest/gear/'+$scope.currentAdvId+"/",JSON.stringify(newItem)).then(function(data){
	    //add item to $scope.treeData 
	    $log.log(data.data);
	    //clear fields
	    $scope.itemName= null;
	    $scope.weight=0.0;
	    $scope.weightUnits = 1;
	});
    };
    
    $log.log("Hello from Gear editor controller");
}]);
