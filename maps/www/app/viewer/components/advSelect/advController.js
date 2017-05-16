myApp.controller("advController",['$scope','$log','$http','$state','leafletData',function($scope,$log,$http,$state,leafletData){
    $scope.$emit("advsSelected");
    $scope.selectClickCount = 0 ;
    
    $scope.advsOverviewData=null;
    leafletData.getMap().then(function(map){
	advsOverviewLayer = new L.geoJson();
	advsOverviewLayer.addTo(map);

	currentAdvLayer = new L.LayerGroup();
	currentAdvLayer.addTo(map);

	segmentHighlightLayer = new L.LayerGroup();
	segmentHighlightLayer.addTo(map);
    });

    //Check if there is only 1 adventure... no choice... might as well change state.
    $scope.$watch("adventures",function(){
	if($scope.adventures.length==1){
	    $state.go("maps",{'advId':$scope.currentAdvId});
	}
    });

    //get geojson
    $http.get('/api/rest/advsOverview/' + $scope.userId+'/').then(function(data){
	$scope.advsOverviewData = data.data;
	
	advsOverviewLayer.addData($scope.advsOverviewData);
	fitMap(advsOverviewLayer.getBounds());	
    });    

    $scope.getAdvDistance = function(index){
	if ($scope.advsOverviewData != null){
	    return $scope.advsOverviewData.features[index].properties.distance/1000;	    
	}
    };

    $scope.getAdvStatus = function(index){
	if($scope.advsOverviewData!=null){
	    var properties = $scope.advsOverviewData.features[index].properties;

	    if (properties.status==1){
		return "In Progress";
	    };
	}
    };
    
    $scope.getAdvDuration = function(index){
	if($scope.advsOverviewData!=null){
	    var properties = $scope.advsOverviewData.features[index].properties;

	    if (properties.startTime!= null && properties.endTime!= null){
		var start = moment(properties.startTime);
		var end = moment(properties.endTime);

		var returnStr = start.format('MMM DD,  YYYY') + ' - ' + end.format('MMM DD,YYYY');

		var duration = moment.duration(end.diff(start));
		if (duration.asDays()>0 && duration.asDays()<2){
		    returnStr=returnStr + ", "+ "1 Day";
		}else if (duration.asDays()>2){
		    returnStr=returnStr + ", "+ parseInt(duration.asDays())+" Days";
		}
		
		return returnStr;
	    }    
	}

	return "";
    };
    
    function drawSegmentHighlight(segment){
	//given a segment, this function adds it to selectedSegmentLayer (used to show specific day when selected)

	segmentHighlightLayer.clearLayers();


	var newSegment = [];
	for (var i = 0; i < segment.length;i++){
	    newSegment.push([segment[i][1],segment[i][0]]);
	}

	var polyline_options = {
	    color: '#ff751a',
	    weight: '8'
	};

	var polyline = new L.polyline(newSegment, polyline_options).addTo(segmentHighlightLayer);
	return polyline;
    }

    function markCurrentPath(coords){
	currentAdvLayer.clearLayers();
	var newSegment = [];
	for (var i = 0; i < coords.length;i++){
	    newSegment.push([coords[i][1],coords[i][0]]);
	}

	var polyline_options = {
	    color: '#337ab7',
	    weight: '8'
	}

	var polyline = new L.polyline(newSegment, polyline_options).addTo(currentAdvLayer);
	return polyline;
    }
    
    $scope.mouseOnAdv = function(index){
	var coordinates = $scope.advsOverviewData.features[index].geometry.coordinates;
	drawSegmentHighlight(coordinates);
    };

    $scope.mouseleaveAdv = function(index){
	segmentHighlightLayer.clearLayers();
    };

    function fitMap(bounds){
	leafletData.getMap().then(function(map){
	    map.fitBounds(bounds);
	});
    };
    
    function centerMap(center){
	leafletData.getMap().then(function(map){
	    map.flyTo(center);	    
	});
    };
	
    $scope.advSelectClick = function(index){
	if($scope.currentAdvIndex==index){
	    var segmentGeoJson= new L.geoJson(segmentHighlightLayer.toGeoJSON());
	    fitMap(segmentGeoJson.getBounds());
	    if($scope.selectClickCount=0){
		$scope.selectClickCount+=1;
	    }else{
		$state.go("maps",{advId:$scope.currentAdvId});
	    }
	}else{
	    if ($scope.selectClickCount==0){
		var a = $scope.advsOverviewData.features[index].geometry.coordinates;
		var line = markCurrentPath(a);
		
		//var c = line.getCenter();
		//should this be fitMap instead?
		//centerMap([c.lat,c.lng]);
		
		fitMap(line.getBounds());
		$scope.selectClickCount=0;
		$scope.$parent.currentAdvIndex=index;
		$scope.$parent.currentAdvId=$scope.$parent.adventures[index].id;
		$scope.$parent.currentAdvName=$scope.$parent.adventures[index].name;
	    }
	}	
    };

    $scope.isAdvSelected = function(index){
	if ($scope.currentAdvIndex == index){
	    return "active";
	}
    };    

    $log.log("Hello from adv controller");
}]);


