myApp.controller("segmentDetailsController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.currentSegmentId = $stateParams.segmentId;

    $scope.$emit("showSegmentDetails",{mapId:$stateParams.mapId,segmentId:$stateParams.segmentId});

    $scope.getSelectedSegmentDistance = function(){
	return Number($scope.$parent.currentSegment.distance/1000).toFixed(1);
    }

    $log.log("Hello from Blog editor controller");
}]);
