var myApp = angular.module("myApp",['ui.router','ui.bootstrap','ui.bootstrap.datetimepicker','leaflet-directive']);

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
    	.state('mapsEditor.segments',{
	    url:':mapId/',
	    templateUrl:'/www/partials/editor-maps.segments.html',
	    controller:'mapEditorController',
	})
    	.state('mapsEditor.segmentDetails',{
	    url:':mapId/:segmentId/',
	    templateUrl:'/www/partials/editor-maps.segmentDetails.html',
	    controller:'segmentDetailsController',
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

    $scope.$on('setMapEditorActive',function(event,advId){
	$scope.currentEditorPage='maps';
	$scope.currentAdvId = advId;
    });

    $scope.$on('setGearEditorActive',function(event){
	$scope.currentEditorPage='gear';
    });

    $scope.$on('advChangeEvent',function(event,indx){
	$scope.currentAdvId   =  $scope.adventures[indx].id;
	$scope.currentAdvName = $scope.adventures[indx].name;
	$scope.currentAdvIndex= indx;
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
	    if(!$scope.currentAdvId){
		$scope.currentAdvId  = $scope.adventures[$scope.adventures.length-1].id;
		$scope.currentAdvName= $scope.adventures[$scope.adventures.length-1].name;
		$scope.currentAdvIndex=$scope.adventures.length-1;
	    }else{ //if adventureId has been set, set the name and index.
		for(var i=0; i<$scope.adventures.length; i++){
		    if($scope.adventures[i].id == $scope.currentAdvId){
			$scope.currentAdvName =$scope.adventures[i].name;
			$scope.currentAdvIndex = i;
		    }
		}
	    }
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
    $scope.$emit("setMapEditorActive",$stateParams.currentAdvId);
        
    $scope.maps = [];
    $scope.currentMapIndex = null;
    $scope.currentMapId= null;
    $scope.currentMapName=null;

    $scope.segmentsData =[];

    function drawSegmentCenters(segments){
	//clear previous
	segmentMarkersLayer.clearLayers();

	for(var i = 0;i<segments.features.length;i++){
	    var coordinates = segments.features[i].geometry.coordinates;
	    var point = [ ];
	    var segmentId =  segments.features[i].properties.segmentId;
	    if (coordinates.length==2){
		// TODO:this is a line... need to find it's geometric center
		point = coordinates[0];

	    }else{
		// this is a navline... just take a middle point

		point = coordinates[Math.floor(coordinates.length/2)];
	    }

	    var markerPoint = [point[1],point[0]];
	    var newMarker = new L.Marker(markerPoint).on('click',$scope.segmentMarkerClick);
	    newMarker.segmentId = segmentId;
	    newMarker.addTo(segmentMarkersLayer);
	}
    };
    
    function centerOnStart(lat,lng){
	leafletData.getMap().then(function(map){
	    map.setView([lat,lng],9);
	});
    }

    function setStartTimeFromLast(segment){
	var last = $scope.segmentsData.features[$scope.segmentsData.features.length-1];
	var endTime = last.properties.endTime;
	if (endTime){//if last segment has endTime set... set this as start time.
	    var ts = moment(last.properties.endTime).startOf("day").add(6,'hours').add(1,'days');
	    $scope.dateRangeStart = ts;

	}else{
	    $scope.dateRangeStart = moment({hour:6});
	}
    };    
    
    function setupMapFromDOM(index){
	//get Map
	$http.get('/api/rest/map/' + $scope.currentMapId).then(function(data){
	    $scope.segmentsData = data.data;
	    geoJsonLayer.addData($scope.segmentsData);


	    //draw circles (currently markers) on segment centers, for segment selection.
	    drawSegmentCenters($scope.segmentsData);
	    
	    //check if need to show segment.
	    if ($scope.currentSegmentId){
		setSegmentViewer($scope.currentSegmentId);
	    }
	    
	    //set startPoint to last point from established line...
	    if ($scope.segmentsData.features.length>0){
	    	var lastSegment = $scope.segmentsData.features[$scope.segmentsData.features.length-1].geometry.coordinates;	
	    	
	    	if (lastSegment.length>0){
	    	    startLat = lastSegment[lastSegment.length-1][1];
	    	    startLng = lastSegment[lastSegment.length-1][0];

		    setStartPoint(startLat,startLng);
	    	    $scope.startSet = true;
		    
		    //set start time as 6am the next day from last point.
		    setStartTimeFromLast();
		    
		    //center map on last point
		    if(!$scope.currentSegmentId){
			centerOnStart(startLat,startLng);
	    	    }
	    	}
		
		
	    }else{ //if the selected map doesn't have any points
	    	$scope.startLat = null;
	    	$scope.startLng = null;
	    	$scope.startSet = false;    		
	    }	    
	});
    };

    function getSegmentIndexById(id){
	for (var i =0;i< $scope.segmentsData.features.length;i++){
	    if ($scope.segmentsData.features[i].properties.segmentId == id){
		return i;
	    }
	}
    }

    function drawSegmentHighlight(segment){
	//given a segment, this function adds it to selectedSegmentLayer (used to show specific day when selected)
	selectedSegmentLayer.clearLayers();


	var newSegment = [];
	for (var i = 0; i < segment.length;i++){
	    newSegment.push([segment[i][1],segment[i][0]]);
	}

	var polyline_options = {
	    color: '#ff751a',
	    weight: '6'
	};

	var polyline = new L.polyline(newSegment, polyline_options).addTo(selectedSegmentLayer);
	return polyline;
    };

    function centerMap(center){
	leafletData.getMap().then(function(map){
	    map.panTo(center);

	    if (map.getZoom()<7){
		map.setView(center,9);
	    }else if (map.getZoom()>11){
		map.setView(center,9);
	    }
	});
    };

    function setSegmentViewer(segmentId){
	$scope.currentSegmentIndex = getSegmentIndexById(segmentId);	
	var segment =$scope.segmentsData.features[$scope.currentSegmentIndex];
	var properties = segment.properties;
	var myPolyline = drawSegmentHighlight(segment.geometry.coordinates);
	
	//TODO: instead of fitMap, flyTo center on line, at reasonable zoom.
	centerMap(myPolyline.getBounds().getCenter());

	$scope.currentSegment = properties;
    };
    
    $scope.segmentMarkerClick= function(e){
	$scope.currentSegmentId = e.target.segmentId;
	setSegmentViewer($scope.currentSegmentId);
	
	$state.go("mapsEditor.segmentDetails",{mapId:$scope.currentMapId,segmentId:$scope.currentSegmentId});
    };

    
    //Load maps, and latest segments
    $http.get('/api/rest/advMaps/' + $scope.currentAdvId+"/").then(function(data){
	$scope.maps = data.data;
	
	if($scope.maps.length>0){
	    if (!$scope.currentMapId){
		
		$scope.currentMapId  =  $scope.maps[$scope.maps.length-1].id;
		$scope.currentMapName= $scope.maps[$scope.maps.length-1].name;
		$scope.currentMapIndex= $scope.maps.length-1;
		
		$state.go('mapsEditor.segments',{mapId:$scope.currentMapId});
	    }else{//Already got currentMapId from URL... need to get currentMapName, CurrentMapIndex
		for(var i=0; i<$scope.maps.length; i++){
		    if ($scope.maps[i].id==$scope.currentMapId){
			$scope.currentMapIndex = i;
			$scope.currentMapName = $scope.maps[i].name;
		    }
		}		
	    }
	    
	    setupMapFromDOM($scope.currentMapIndex);
	}
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

	    $state.go('mapsEditor.segments',{mapId:$scope.currentMapId});
	    
	    if($scope.startLat & $scope.startLng){
		setStartPoint($scope.startLat,$scope.startLng);
	    }
	    //clear things
	    
	    endLayer.clearLayers();
	    latestPathLayer.clearLayers();
	    geoJsonLayer.clearLayers();
	    segmentMarkersLayer.clearLayers();
	    selectedSegmentLayer.clearLayers();
	    
	 
	    $scope.segmentsData = data.data;
	    $scope.newMapName = null;
	    $scope.segmentDistance = null;
	    $scope.endSet = false;
	})
    };

    
    $scope.deleteMap = function(index){
	var mapId = $scope.maps[index].id;
	$http.delete('/api/rest/map/'+mapId).then(function(resp){
	    //clear entry from list
	    $scope.maps.splice(index,1);

	    if (mapId == $scope.currentMapId){
		clearAllLayers();
		$scope.endLat = null;
		$scope.endLng = null;
		$scope.startLng = null;
		$scope.startLat = null
		$scope.startSet = null;
		$scope.endSet = null;


		if($scope.maps.length==0){
		    $state.go('mapsEditor',{advId:$scope.currentAdvId});
		}
		else{
		    //last;
		    if($scope.maps.length==index){
			$scope.currentMapId = $scope.maps[index-1].id;	
			setupMapFromDOM(index-1);//load right map...
		    }else{
			$scope.currentMapId = $scope.maps[index].id;
			setupMapFromDOM(index);//load right map...
		    }

		    $state.go('mapsEditor.segments',{mapId:$scope.currentMapId});
		}
	    }

	});
    };
		
    $scope.isMapActive = function(index){
	if($scope.maps[index].id == $scope.currentMapId){
	    return true;
	}else{
	    return false;
	}
    };
    
    $scope.getMapDistance = function(index){
	if($scope.maps[index].distance){
	    return Number($scope.maps[index].distance/1000).toFixed(1);
	}
	else{
	    return 0;
	}
    }

    function clearAllLayers(){
	startLayer.clearLayers();
	endLayer.clearLayers();
	latestPathLayer.clearLayers();
	geoJsonLayer.clearLayers();

	segmentMarkersLayer.clearLayers();
	selectedSegmentLayer.clearLayers();
    };
    
    function fitMap(bounds){
	leafletData.getMap().then(function(map) {
	    map.fitBounds(bounds);
	});
    };
    
    $scope.selectMapClick = function(index){
	//if change is needed...
	$scope.currentMapId = $scope.maps[index].id;
	$scope.currentMapName = $scope.maps[index].name;
	
	if ($scope.currentMapIndex == index){
	    fitMap(geoJsonLayer.getBounds());
	}else{
	    $scope.currentMapIndex = index;
	    $scope.dateRangeEnd = null;
	    $scope.endLat = null;
	    $scope.endLng = null;
	    $scope.endSet = false;	    
	    $scope.currentSegmentId= null;
	    $scope.segmentDistance = null;
	    
	    setupMapFromDOM(index);//load right map...

	    clearAllLayers();

	    $scope.$broadcast("mapIndexChange",$scope.currentMapIndex);
	}

	$state.go('mapsEditor.segments',{mapId:$scope.currentMapId});
    };

    $scope.$on('setActiveMap',function(event,mapId){
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
	
	$scope.$broadcast("startSet");
	$scope.startSet=true;
    };

    function drawFinishCircle(lat,lng){
	endLayer.clearLayers();

	//draw circle
	var circleOptions = {'color':'#FB0C00'}
	var newLatLng = new L.latLng(lat,lng);
	var marker = new L.circleMarker(newLatLng,circleOptions).setRadius(3);

	marker.addTo(endLayer);
    }

    function getNavLine(startLat,startLng,endLat,endLng){
	var newCoordinates = [];
	var distance = 0;

	if ($scope.navActive==1){ //If navtype is line
	    newCoordinates.push([parseFloat(startLat),parseFloat(startLng)]);
	    newCoordinates.push([parseFloat(endLat),parseFloat(endLng)]);

	    var startLatLng =  new L.latLng(parseFloat(startLat),parseFloat(startLng));
	    var endLatLng = new L.latLng(parseFloat(endLat),parseFloat(endLng));
	    distance = Math.floor(startLatLng.distanceTo(endLatLng));

	}else{ //If navtype requires getting directions from mapbox api
	    var navTypeStr = "cycling";
	    if ($scope.navActive == 3){ navTypeStr = "driving";};

	    var accessToken = document.getElementById("mapboxToken").value;
	    var myURL ="https://api.mapbox.com/directions/v5/mapbox/"+navTypeStr+"/"+ startLng+","+startLat+";"+endLng+","+endLat+"?access_token="+accessToken ;
	    var xmlhttp = new XMLHttpRequest();
	    xmlhttp.open("GET",myURL,false);
	    xmlhttp.send();

	    var json_back = JSON.parse(xmlhttp.response);

	    var navOption = json_back.routes[0];
	    var navPolyline = navOption.geometry;

	    //use polylineDecoder lib...
	    var decodedLine = L.Polyline.fromEncoded(navPolyline);

	    for (var i = 0;i < decodedLine._latlngs.length; i++){
		newCoordinates.push([decodedLine._latlngs[i].lat ,decodedLine._latlngs[i].lng]);

	    }

	    distance = json_back.routes[0].distance;
	}

	return {'navLine':newCoordinates,'distance':distance};
    };

    function setEndPoint(lat,lng){
	$scope.endLat = lat;
	$scope.endLng = lng;

	drawFinishCircle(lat,lng);
	
	navInfo = getNavLine($scope.startLat,$scope.startLng,$scope.endLat,$scope.endLng);

	var navLine = navInfo.navLine;

	var polyline_options = {
	    color: '#00264d'
	};

	latestPathLayer.clearLayers();
	var polyline = L.polyline(navLine, polyline_options).addTo(latestPathLayer);

	return navInfo;
    }

    function setEndTime(){
	//if dateRangeStart is today:
	//   set dateRangeEnd as now
	//if dateRangeStart is in the future:
	// set dateRangeEnd as 6pm of same day as future dateRangeStart

	var startTs = $scope.dateRangeStart;

	if(moment(startTs).startOf('day').isSame(moment().startOf('day'))){
	    $scope.dateRangeEnd = moment();
	}else{
	    $scope.dateRangeEnd = moment(startTs).startOf('day').add(18,'hours');
	}

	$scope.$broadcast("changeEndTime",$scope.dateRangeEnd);
    }
    
    $scope.$on("leafletDirectiveMap.click",function(e,wrap){
	//if in segmentDetails view, need to return to segment creation view...
	if ($scope.currentSegmentId){
	    $scope.currentSegmentId = null;
	    $state.go('mapsEditor.segments',{mapId:$scope.currentMapId});
	}
	
	var lat = wrap.leafletEvent.latlng.lat;
	var lng = wrap.leafletEvent.latlng.lng;
	

	if (!$scope.startSet){
	    setStartPoint(lat,lng);
	    $scope.dateRangeStart = moment({hour:6});

	}else{
	    var navData = setEndPoint(lat,lng);
	    newSegmentPath = navData.navLine;
	    $scope.segmentDistance = navData.distance;
	    $scope.$broadcast("newSegmentDistance",$scope.segmentDistance);
	    
	    setEndTime();
	    $scope.endSet = true;

	    //clear highlight layer
	    selectedSegmentLayer.clearLayers();
	}
    });

    $scope.$on("setStartTo",function(e,data){
	var lat = data.lat;
	var lng = data.lng;
	setStartPoint(lat,lng);	
    });

    $scope.$on("changeNavType",function(e,typeId){
	$scope.navActive = typeId;
    });

    $scope.$on("showSegmentDetails", function(e,data){
	$scope.currentMapId = data.mapId;
	$scope.currentSegmentId = data.segmentId;
    });

    $scope.loadPreviousSegment = function(e){
	$scope.currentSegmentId = $scope.segmentsData.features[$scope.currentSegmentIndex-1].properties.segmentId;
	setSegmentViewer($scope.currentSegmentId);
	$state.go("mapsEditor.segmentDetails",{mapId:$scope.currentMapId,segmentId:$scope.currentSegmentId});
    };

    $scope.loadNextSegment = function(){
	$scope.currentSegmentId = $scope.segmentsData.features[$scope.currentSegmentIndex+1].properties.segmentId;
	setSegmentViewer($scope.currentSegmentId);
	$state.go("mapsEditor.segmentDetails",{mapId:$scope.currentMapId,segmentId:$scope.currentSegmentId});
    };

    function flyTo(center){
	leafletData.getMap().then(function(map){
	    var zoom = map.getZoom();
	    if (zoom>11){
		map.flyTo(center,10);
	    }else if(zoom<6){
		map.flyTo(center,10);
	    }else{
		map.flyTo(center);
	    }
	});
    };
    
    $scope.deselectSegment = function(){
	$scope.currentSegmentId = null;
	selectedSegmentLayer.clearLayers();

	var center = new L.LatLng($scope.startLat,$scope.startLng);
	flyTo(center);

	$state.go("mapsEditor.segments",{mapId:$scope.currentMapId});
    };
    
    $scope.showNextSegmentButton = function(){
	if ($scope.segmentsData){
	    if($scope.currentSegmentIndex < $scope.segmentsData.features.length-1){
		return true;
	    }
	}

	return false;
    }


    $scope.deselectEndSet = function(){
	$scope.endLat = null;
	$scope.endLng = null;
	$scope.dateReangeEnd=null;
	newSegmentPath = [];
	endLayer.clearLayers();
	latestPathLayer.clearLayers();
	$scope.endSet = null;
	$scope.segmentDistance=null;
    };    

    
    $log.log("Hello from map editor controller");
}]);


myApp.controller("mapEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentMapId=$stateParams.mapId;
    $scope.$emit("setActiveMap",$scope.currentMapId);

    $scope.startLng=null;
    $scope.startLat=null;
    $scope.isStartOpen = false;
    
    $scope.endLng=null;
    $scope.endLat=null;
    $scope.delayOptions = [{ label: "No delay", value: 0 }, { label: "5 Days", value: 5 },{ label: "15 Days", value: 15 },{ label: "30 Days", value: 30 }];
    $scope.selectedDelayOption = $scope.delayOptions[0];
    $scope.selectedDelayValue = $scope.delayOptions[0].value;
   
    $scope.isStartOpen = false; 
    $scope.startSet = false;
    $scope.dateRangeStart = null;

    $scope.navActive=3;

    $scope.isEndOpen = false;
    $scope.endSet = false;
    $scope.dateRangeEnd = null;


    $scope.changeNav = function(typeId){
	$scope.navActive=typeId;
	$scope.$emit("changeNavType",typeId);
    };
    
    $scope.changeNav($scope.navActive);
    
    $scope.startDateOnSetTime = function() {
	$scope.isStartOpen = false;	
    };

    $scope.endDateOnSetTime = function() {
	$scope.isEndOpen = false;	
    };

    $scope.getSegmentDistance = function(){
	return Number($scope.$parent.segmentDistance/1000).toFixed(1);
    }

    $scope.$on("startSet",function(e,wrap){
	$scope.startSet = true;
    });

    $scope.$on("startSet",function(e,wrap){
	$scope.startSet = true;
    });

    /*    $scope.$on("endSet",function(e,wrap){
	$scope.endSet = true;
    });
    */
    
    $scope.$on("newSegmentDistance",function(e,dist){
	$scope.segmentDistance = dist;
    });

    
    $scope.$on("mapIndexChange",function(e,data){
	$scope.currentMapIndex = data;
	
	$scope.endLat = null;
	$scope.endLng = null;
	$scope.endSet = false;
	
    });

    $scope.$on("changeEndTime",function(e,data){
	$scope.dateRangeEnd = data;
    });
    

    function addSegmentMarker(segment){
	//this is invoked on 'save segment' button. It marks the segment center marker.
	var coordinates = segment.geometry.coordinates;
	point =[];
	if (coordinates.length==2){
	    point = coordinates[0];
	}else{
	    point = coordinates[Math.floor(coordinates.length/2)];
	}

	var markerPoint = [point[1],point[0]];
	var newMarker = new L.Marker(markerPoint).on('click',$scope.segmentMarkerClick);
	newMarker.segmentId = segment.properties.segmentId;
	newMarker.addTo(segmentMarkersLayer);
    };
    
    
    $scope.createSegment = function(){
	var newSegment = {'mapId':$scope.currentMapId,
			  'startTime':$scope.$parent.dateRangeStart,
			  'endTime': $scope.$parent.dateRangeEnd,
			  'distance': $scope.$parent.segmentDistance,
			  'waypoints':newSegmentPath,
			  'dayNotes':$scope.dayNotes,
			  'delay':$scope.selectedDelayValue,
			 };
	
	$http.post('/api/rest/mapSegment',JSON.stringify(newSegment)).then(function(data){
	    //return needs to be geojson
	    var jsonData = data.data
	    //add to geojson...
	    geoJsonLayer.addData(jsonData);

	    $scope.$parent.maps[$scope.$parent.currentMapIndex].distance += $scope.segmentDistance;

	    $scope.$emit("setStartTo",{'lat':$scope.$parent.endLat,'lng':$scope.$parent.endLng});
	    //setStartPoint($scope.endLat,$scope.endLng);

	    $scope.segmentsData.features.push(jsonData);

	    //Add marker to map.
	    addSegmentMarker(jsonData);

	    //unset things
	    $scope.$parent.endLat = null;
	    $scope.$parent.endLng = null;
	    newSegmentPath = []; 
	    endLayer.clearLayers();
	    latestPathLayer.clearLayers();
	    selectedSegmentLayer.clearLayers();

	    $scope.$parent.segmentDistance = null;
	    $scope.$parent.endSet = false;
	    $scope.dayNotes = null;

	    //set dateRangeStart to 6am next day from dateRangeEnd.
	    $scope.$parent.dateRangeStart = moment($scope.$parent.dateRangeEnd._d).startOf('day').add(1,'days').add(6,'hours')
	    $scope.$parent.dateRangeEnd = null;
	});
    };
    
    $log.log("Hello from Maps.segments editor controller");
}]);


myApp.controller("segmentDetailsController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentSegmentId = $stateParams.segmentId;

    $scope.$emit("showSegmentDetails",{mapId:$stateParams.mapId,segmentId:$stateParams.segmentId});
    
    $scope.getSelectedSegmentDistance = function(){
	return Number($scope.$parent.currentSegment.distance/1000).toFixed(1);
    }
    
    $log.log("Hello from Blog editor controller");
}]);

myApp.controller("blogEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setBlogEditorActive");

    $log.log("Hello from Blog editor controller");
}]);


myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive");

    $log.log("Hello from Gear editor controller");
}]);
