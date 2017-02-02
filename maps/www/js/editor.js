var myApp = angular.module("myApp",['ui.router','ui.bootstrap','leaflet-directive']);

myApp.config(function($stateProvider){
    $stateProvider
	.state('advEditor',{
	    url:'',
	    templateUrl:'/www/partials/editor-adventures.html',
	    controller:'advEditorController',
	})
	.state('mapsEditor',{
	    url:'/:currentAdvId/maps/',
	    templateUrl:'/www/partials/editor-maps.html',
	    controller:'mapsEditorController',
	})
    	.state('mapsEditor.map',{
	    url:':mapId/',
	    templateUrl:'/www/partials/editor-maps.map.html',
	    controller:'mapEditorController',
	})
	.state('blogsEditor',{
	    url:'/:currentAdvId/blogs/',
	    templateUrl:'/www/partials/editor-blogs.html',
	    controller:'blogEditorController',
	})
    	.state('gearEditor',{
	    url:'/:currentAdvId/gear/',
	    templateUrl:'/www/partials/editor-gear.html',
	    controller:'gearEditorController',
	});
});

myApp.controller("mainController",['$scope','$log','$http',function($scope,$log,$http){
    $log.log("Hello from main controller");
    var userId = document.getElementById("userId").value;
    $scope.userId = userId;
    $scope.adventures = [];
    $scope.currentAdvId = null;
    $scope.currentAdvName = null;
    $scope.currentAdvIndex = null;
    $scope.profilePic="/www/img/blank-profile-picture.png";
    $scope.currentEditorPage = null;
    
    $scope.isAdvEditorActive = function(){
	if ($scope.currentEditorPage=="advs"){
	    return "active";
	}
    }

    $scope.isMapEditorActive = function(){
	if ($scope.currentEditorPage=="maps"){
	    return "active";
	}
    }

    $scope.isBlogEditorActive = function(){
	if ($scope.currentEditorPage=="blogs"){
	    return "active";
	}
    }

    $scope.isGearEditorActive = function(){
	if ($scope.currentEditorPage=="gear"){
	    return "active";
	}
    }

    $scope.$on('setAdvEditorActive',function(event){
	$scope.currentEditorPage='advs';
    });

    $scope.$on('setBlogEditorActive',function(event){
	$scope.currentEditorPage='blogs';
    });

    $scope.$on('setMapEditorActive',function(event){
	$scope.currentEditorPage='maps';
    });
    $scope.$on('setGearEditorActive',function(event){
	$scope.currentEditorPage='gear';
    });

    $scope.$on('advChangeEvent',function(event,indx){
	$scope.currentAdvId   =  $scope.adventures[indx].id;
	$scope.currentAdvName = $scope.adventures[indx].name;
	$scope.currentAdvIndex= indx;
    });
    
    $scope.$on('advNameChangeEvent',function(event,newName){
	$scope.currentAdvName=newName;
    });

    $scope.$on('deselectAdv',function(event){
	$scope.currentAdvId=null;
	$scope.currentAdvName=null;
	$scope.currentAdvIndex=null;
    });


    $http.get('/api/rest/userInfo/' + userId).then(function(data){
	$scope.adventures = data.data.adventures;
	$scope.bio = data.data.bio;
	var profilePics = data.data.profile_pictures;
	
	//TODO: need to check for active picture
	if (profilePics.length>0){
	    var pfPic = profilePics[profilePics.length-1];
	    $scope.profilePic = "/www/user_media/"+$scope.userId+"/profile_pictures/"+pfPic.id+".png";
	}
	
	//Get latest adv if adventureId not provided...
	if ($scope.adventures.length > 0){
	    $scope.currentAdvId  = $scope.adventures[$scope.adventures.length-1].id;
	    $scope.currentAdvName= $scope.adventures[$scope.adventures.length-1].name;
	    $scope.currentAdvIndex=$scope.adventures.length-1;
	}
    });
}]);


myApp.controller("advEditorController",['$scope','$log','$http',function($scope,$log,$http){
    $scope.$emit("setAdvEditorActive");

    $scope.bioEditEnabled = false;
    $scope.bioSaveEnabled = false;
    $scope.newAdvName = "";
    $scope.showEditor=false;
    $scope.advEdited=false;
  
    $scope.advTypeOptions=[{name:"Bicycle Touring",'id':1},{name:"Backpacking",'id':2},{name:"Car/Van Camping",'id':3},{name:"Other",'id':4}];
    $scope.selectedAdvType = $scope.advTypeOptions[0];

    $scope.advStatusOptions=[{name:"In Progress",id:1},{name:"Completed",id:2},{name:"In Planning",id:3}];
    $scope.selectedAdvType = $scope.advStatusOptions[0];

    $scope.isAdvSelected = function(index){
	if ($scope.currentAdvIndex ==index){
	    return "active";
	}else{
	    //pass
	}
    }

    $scope.createAdv = function(){
	var advName = $scope.newAdvName;
	var advType = $scope.selectedAdvType.id;
	var advStatus = $scope.selectedAdvStatus.id;
	//prepare json to pass
	$log.log($scope.userId);
	var newAdv = {'owner':$scope.userId,'name':advName,'advType':advType,'advStatus':advStatus};

	$http.post('/api/rest/adventures/',JSON.stringify(newAdv)).then(function(data){
	    $scope.adventures.push(data.data);

	    //clear field
	    $scope.newAdvName = "";

	    //change to latest
	    $scope.$emit('advChangeEvent', $scope.adventures.length-1);
	})
    }

    $scope.deleteAdv = function(index){
	var advId = $scope.adventures[index].id;
	$http.delete('/api/rest/adventures/'+advId).then(function(resp){
	    //clear entry from list
	    $scope.adventures.splice(index,1);
	    
	    //clear out of editor mode..
	    $scope.showEditor=false;
	    //if after delete there are no adventures:
	    //  deselect currentAdvItems
	    //else
	    // if deleted adventure after the currently selected adv: no changes
	    // elif deleted adventure before the currently selected adv: need to change current adv to one below
	    // elif deleted adventure that is currently selected:
	    //   select last adv
	    //

	    if ($scope.adventures.length==0){
		$scope.$emit("deselectAdv");
	    }else{
		if (index > $scope.currentAdvIndex){
		    //noChanges
		}else if (index < $scope.currentAdvIndex){
		    $scope.$emit('advChangeEvent',$scope.currentAdvIndex-1);
		}else if (index == $scope.currentAdvIndex){
		    $scope.$emit('advChangeEvent',$scope.adventures.length-1);
		}
	    }
	});
    };
    
    $scope.advClick = function(index){
	if ($scope.currentAdvIndex==index){//if click on current adv..go to editor mode:
	    $scope.showEditor= !$scope.showEditor;
	    $scope.editAdvName = $scope.currentAdvName;

	    //get current adventure type and status
	    var advT = $scope.adventures[$scope.currentAdvIndex].advType;
	    $scope.currentAdvType = $scope.advTypeOptions[advT-1];

	    var advS = $scope.adventures[$scope.currentAdvIndex].advStatus;
	    $scope.currentAdvStatus = $scope.advStatusOptions[advS-1];

	}else{
	    //change adventure
	    $scope.showEditor=false;
	    $scope.$emit('advChangeEvent',index);
	}

	//clean up
	$scope.advEdited=false;
    }

    $scope.bioDisabled = function(){
	return !$scope.bioEditEnabled;
    };

    $scope.editBioClick = function(){
	$scope.bioEditEnabled = true;
    };

    $scope.editTextKeyUp = function(){
	$scope.bioSaveEnabled = true;
    };

    $scope.saveBioClick = function(){
	//Because of the binding, bio field wont be null when 'save' is clicked.
	//Always sending POST, and letting server figure out if to create or update.

	var bio = document.getElementById("bioField").value;
	var newBio = {'userId':$scope.userId,'bio':bio};
	$http.post('/api/rest/userInfo/'+$scope.userId+"/",JSON.stringify(newBio)).then(function(data){
	    $scope.bio=data.data;
	});

	$scope.bioEditEnabled = false;
	$scope.bioSaveEnabled = false;
    }

    $scope.uploadPictureClick = function(){
	var domElement = document.getElementById("file");
	domElement.click();
	//angular.element(domElement).trigger('click');
	//document.getElementById("file").trigger('click');
    };

    $scope.fileSelectChange = function(files){
	var fd = new FormData();
	//Take the first selected file
	fd.append("userId", $scope.userId);
	fd.append("file", files[0]);

	var uploadUrl= "/api/rest/profilePhoto/";
	$http.post(uploadUrl, fd, {
	    withCredentials: true,
	    headers: {'Content-Type': undefined }
	    //transformRequest: angular.identity
	}).then(function(data){
	    $scope.profilePic = "/www/user_media/"+$scope.userId+"/profile_pictures/"+data.data.picId+".png";
	});
    };
    
    $log.log("Hello from adv editor controller");
    
}]);


myApp.controller("mapsEditorController",['$scope','$log','$http','$stateParams','$state','leafletData',function($scope,$log,$http, $stateParams,$state,leafletData){
    $scope.$emit("setMapEditorActive");

    $scope.currentAdvId = $stateParams.currentAdvId;
    $scope.maps = [];
    $scope.currentMapIndex = null;
    $scope.currentMapId= null;
    $scope.currentMapName=null;
    $scope.startSet = false;
    $scope.navActive=3;
    
    $scope.delayOptions = [{ label: "No delay", value: 0 }, { label: "5 Days", value: 5 },{ label: "15 Days", value: 15 },{ label: "30 Days", value: 30 }];
    $scope.selectedDelayOption = $scope.delayOptions[0];
    $scope.selectedDelayValue = $scope.delayOptions[0].value;
    //startLat = null;
    //startLng = null;

    //Load maps, and latest segments
    $http.get('/api/rest/advMaps/' + $scope.currentAdvId+"/").then(function(data){
	$scope.maps = data.data;
	
	if($scope.maps.length>0){
	    if (!$scope.currentMapId){
		$log.log("Setting to last...");
		$scope.currentMapId  =  $scope.maps[$scope.maps.length-1].id;
		$scope.currentMapName= $scope.maps[$scope.maps.length-1].name;
		$scope.currentMapIndex= $scope.maps.length-1;
		
		$state.go('mapsEditor.map',{mapId:$scope.currentMapId});
	    }
	    // TODO  change state here...
	    //setupMapFromDOM($scope.maps.length-1);
	}
	//$scope.pleasesWait = false;
	
    });


    //after leaflet loads, create layers

    leafletData.getMap().then(function(map){
	startLayer = new L.LayerGroup();
	startLayer.addTo(map);

	endLayer = new L.LayerGroup();
	endLayer.addTo(map);

	latestPathLayer = new L.LayerGroup();
	latestPathLayer.addTo(map);

	//This is used to draw current established map
	geoJsonLayer = new L.geoJson();
	geoJsonLayer.addTo(map);
	segmentMarkersLayer = new L.LayerGroup();
	segmentMarkersLayer.addTo(map);

	selectedSegmentLayer = new L.LayerGroup();
	selectedSegmentLayer.addTo(map);
    });


    $scope.createMap = function(){
	var mapName = $scope.newMapName;
	//prepare json to pass
	var newMap = {'advId':$scope.currentAdvId,'name':mapName};
	$http.post('/api/rest/advMaps/'+$scope.currentAdvId+"/",JSON.stringify(newMap)).then(function(data){
	    var latestMap = data.data;
	    $scope.maps.push(latestMap);

	    $scope.currentMapId= latestMap.id;
	    $scope.currentMapName = latestMap.name;
	    $scope.currentMapIndex = $scope.maps.length-1;

	    $state.go('mapsEditor.map',{mapId:$scope.currentMapId});
	    
	    //if(startLat & startLng){
	    //setStartPoint(startLat,startLng);
	    //}
	    //clear things
	    /*
	    endLayer.clearLayers();
	    latestPathLayer.clearLayers();
	    geoJsonLayer.clearLayers();
	    segmentMarkersLayer.clearLayers();
	    selectedSegmentLayer.clearLayers();
	    $scope.segmentsData = data.data;
	    $scope.newMapName = null;
	    $scope.segmentDistance = null;
	    $scope.showSegment = false;
	    */
	})
    };

    $scope.deleteMap = function(index){
	var mapId = $scope.maps[index].id;
	$http.delete('/api/rest/maps/'+mapId).then(function(resp){
	    //clear entry from list
	    $scope.maps.splice(index,1);

	    if (mapId == $scope.currentMapId){
		//clearLayers();
		//endLat = null;
		//endLng = null;
		//startLng = null;
		//startLat = null
		//$scope.startSet = null;
		//$scope.endSet = null;
	    }
	    //$scope.showSegment=false;
	});
    };

		
    $scope.isMapActive = function(index){
	if($scope.maps[index].id == $scope.currentMapId){
	    return true;
	}else{
	    return false;
	}
    };

    $scope.selectMapClick = function(index){
	//if change is needed...
	$scope.currentMapId = $scope.maps[index].id;
	$scope.currentMapName = $scope.maps[index].name;
	
	if ($scope.currentMapIndex == index){
	    //fitMap(geoJsonLayer.getBounds());
	}else{
	    $scope.currentMapIndex = index;
	    //endLat = null;
	    //endLng = null;
	    //$scope.endSet = false;
	    //setupMapFromDOM(index);//load right map...

	    //clearLayers();
	}

	$state.go('mapsEditor.map',{mapId:$scope.currentMapId});
    };

    $scope.$on('setActiveMap',function(event,mapId){
	$log.log("activating map...");
	$log.log(mapId);
	$log.log($scope.maps);
	$scope.currentMapId = mapId;

    });

    function drawStartCircle(lat,lng){
	startLayer.clearLayers();

	//draw circle
	var circleOptions = {'color':'#551A8B'}
	var newLatLng = new L.latLng(lat,lng);
	var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);

	marker.addTo(startLayer);
    };
    
    function setStartPoint(lat,lng){
	$scope.startLat = lat;
	$scope.startLng = lng;
	drawStartCircle(lat,lng);
    };
    
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
	//unset segment selection view
	$scope.showSegment = false;

	var lat = wrap.leafletEvent.latlng.lat;
	var lng = wrap.leafletEvent.latlng.lng;

	$log.log(lat,lng);
	//set start point.
	if (!$scope.startSet){
	    setStartPoint(lat,lng);
	    $scope.startSet = true;
	    $scope.dateRangeStart = moment({hour:6});

	}else{
	    var navData = setEndPoint(lat,lng);
	    newSegmentPath = navData.navLine;
	    $scope.segmentDistance = navData.distance;

	    $scope.endSet = true;
	    setEndTime();

	    //clear highlight layer
	    //possibly need more map cleaning and adjusting zoom.
	    selectedSegmentLayer.clearLayers();
	}
    });

    $log.log("Hello from map editor controller");
}]);


myApp.controller("mapEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentMapId=$stateParams.mapId;
    $scope.$emit("setActiveMap",$scope.currentMapId);
    
    
    $log.log("Hello from Maps.map editor controller");
}]);



myApp.controller("blogEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setBlogEditorActive");

    $log.log("Hello from Blog editor controller");
}]);


myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive");

    $log.log("Hello from Gear editor controller");
}]);
