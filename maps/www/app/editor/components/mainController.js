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

    $scope.isPhotoEditorActive = function(){
	if ($scope.currentEditorPage=="photos"){
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

    $scope.$on('setPhotoEditorActive',function(event){
	$scope.currentEditorPage='photos';
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
