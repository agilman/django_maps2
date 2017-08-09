myApp.controller("gearEditorController",['$scope','$log','$http','$stateParams',function($scope,$log,$http, $stateParams){
    $scope.$emit("setGearEditorActive");
    
    $scope.list = [{
	'id': 1,
	'title': 'node1',
	'nodes': [
	    {
		'id': 11,
		'title': 'node1.1',
		'nodes': [
		    {
			'id': 111,
			'title': 'node1.1.1',
			'nodes': []
		    }
		]
	    },
	    {
		'id': 12,
		'title': 'node1.2',
		'nodes': []
	    }
	]
    }, {
	'id': 2,
	'title': 'node2',
	'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
	'nodes': [
	    {
		'id': 21,
		'title': 'node2.1',
		'nodes': []
	    },
	    {
		'id': 22,
		'title': 'node2.2',
		'nodes': []
	    }
	]
    }, {
	'id': 3,
	'title': 'node3',
	'nodes': [
	    {
		'id': 31,
		'title': 'node3.1',
		'nodes': []
	    }
	]
    }];
    
    
    $log.log("Hello from Gear editor controller");
}]);
