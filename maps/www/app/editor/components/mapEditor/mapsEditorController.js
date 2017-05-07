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


    $log.log("Hello from maps editor controller");
}]);
