myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive",$stateParams.currentAdvId);

    $scope.itemName = null;
    $scope.weight = 0.0;
    $scope.weightUnits = 1;

    $scope.selectedNodeId = null;
    $scope.treeData = [];
    
    $scope.treeConfig = {
	core :  {
	    multiple: false,
	    animation: true,
	    check_callback: true,
	    worker: true,
	    themes : { icons: false} },
	version: 1,
	plugins : [ "wholerow","themes", "grid"]};

    //load gear data
    $http.get('/api/rest/gear/'+$scope.currentAdvId+"/").then(function(data){
	var temp = [];
	for (var i = 0;i<data.data.length;i++){
	    var item = data.data[i];
	    if (item.parent==null){
		item.parent="#";
	    }

	    temp.push(item);

	};

	$scope.treeData = temp;

	//This is needed for the shitty angular directive for jsTree.
	//A core configuration change triggers tree rebuild.... (version is random var that isn't used by jsTree)
	$scope.treeConfig.version++;
	
    });

    $scope.addItem = function(){
	var newItem = {'adv': $scope.currentAdvId,
		       'parent': $scope.selectedNodeId,
		       'name' : $scope.itemName,
		       'ref' : null,//$scope.ref,
		       'weight' : $scope.weight,
		       'weightUnit': $scope.weightUnit};
	
	$http.post('/api/rest/gear/'+$scope.currentAdvId+"/",JSON.stringify(newItem)).then(function(data){
	    var tmp = data.data;
	    if(tmp.parent==null){
		tmp.parent="#";
	    };

	    var tree = $scope.treeInstance.jstree(true);
	    tree.create_node($scope.selectedNodeId,tmp,'last',false,false);
	    tree.open_node($scope.selectedNodeId);
	    	    
	    //clear fields
	    $scope.itemName = null;
	    $scope.weight = 0.0;
	});	
    };


    
    $scope.deleteItem = function(){
	$http.delete('/api/rest/gear/'+$scope.currentAdvId+"/"+$scope.selectedNodeId).then(function(data){
	    $scope.treeInstance.jstree(true).delete_node($scope.selectedNodeId);

	    $scope.selectedNodeId =  null;
	});
    };

    
    //JS Tree callbacks
    var lastEventTs = 0;
    $scope.changedCB = function(e,data){
	//multiple instances of an event get triggered on click... this prevents repeated action.
	if(data.action=="select_node"){
	    if (e.timeStamp > lastEventTs){
		
		lastEventTs = e.timeStamp;
		if ($scope.selectedNodeId==data.node.id){
		    $scope.treeInstance.jstree(true).deselect_node(data.node);
		    $scope.selectedNodeId=null;
		}else{
		  $scope.selectedNodeId = data.node.id;
		}
	    }
	}
    };
    
    $scope.loadedCB = function(e,data){
	$scope.treeInstance.jstree(true).open_all();
    };		

    $log.log("Hello from Gear editor controller");
}]);







