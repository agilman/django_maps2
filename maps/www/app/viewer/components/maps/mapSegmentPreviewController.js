myApp.controller("segmentPreviewController",['$scope','$log','$http','$stateParams','$state','$timeout',function($scope,$log,$http,$stateParams,$state,$timeout){        
    var segmentId = $stateParams.segmentId;

    $scope.$emit('highlightSegment',segmentId);
    
    $log.log("Hello from segment preview controller");
}]);
