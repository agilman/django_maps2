myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive",$stateParams.currentAdvId);

    $scope.itemName = null;
    $scope.weight = 0.0;
    $scope.weightUnits = 1;

    $scope.selectedNodeId = null;
    $scope.treeData = [];

    $scope.gearOverviewPics = [];
    $scope.currentGearPicIndex = null;
    
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
	//The above api call returns both items to populate the tree, and the picture data in one call.

	//First, get the jsTree populated with gear list
	var temp = [];
	
	for (var i = 0;i<data.data.gear.length;i++){
	    var item = data.data.gear[i];
	    if (item.parent==null){
		item.parent="#";
	    }

	    temp.push(item);
	};

	$scope.treeData = temp;

	//This is needed for the angular directive for jsTree.
	//A core configuration change triggers tree rebuild.... (version is random var that isn't used by jsTree)
	$scope.treeConfig.version++;


	//Populate pictures data
	$scope.gearOverviewPics = data.data.pictures;

	//TODO: get the one where default columnt is true.
	$scope.currentGearPicIndex = data.data.pictures.length-1;


	//add tags to picture
	loadTags();
	
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

	    //add item to treeData
	    $scope.treeData.push(tmp);
	    
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

	    //Remove item from treeData
	    for(var i =0; i<$scope.treeData.length;i++){
		if ($scope.treeData[i].id == $scope.selectedNodeId){
		    $scope.treeData.splice(i,1);
		}
	    }
	    
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

    $scope.uploadGearPhoto = function(){
	//trigger file select dialogue 
	var domElement = document.getElementById("file");
	domElement.click();
    }

    $scope.fileSelectChange = function(files){
	var uploadUrl= "/api/rest/gearPictures/"+$scope.currentAdvId+"/";
	var fd = new FormData();
	
	//Take the first selected file
	fd.append("userId", $scope.userId);
	fd.append("file", files[0]);
	
	$http.post(uploadUrl, fd, {
	    withCredentials: true,
	    headers: {'Content-Type': undefined }
	}).then(function(data){
	    $log.log(data.data);
	    $scope.gearOverviewPics.push(data.data);
	    $scope.currentGearPicIndex = $scope.gearOverviewPics.length -1 ; 
	    $log.log("uploaded OK", $scope.gearOverviewPics, $scope.currentGearPicIndex);
	});
    };

    //Image taggin experiments
    
    function loadTags(){
	var img = document.getElementById("gearImg");

	var taggd = new Taggd(img);
	var text = "Hello";
	
	var tag1 = new Taggd.Tag({
	    x: 0.1,
	    y: 0.1,
	}, text);
	
	taggd.setTags([tag1]);
	$log.log("tags loaded",taggd);
    }

    
    $log.log("Hello from Gear editor controller");
}]);
