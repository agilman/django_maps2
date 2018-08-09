myApp.controller("mapSegmentsEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
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
			  'waypoints':$scope.$parent.newSegmentPath,
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
	    $scope.$parent.newSegmentPath = [];
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
