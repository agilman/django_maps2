myApp.config(function($stateProvider){
    $stateProvider
        .state('advSelect',{
	    url:'/',
	    templateUrl:'/www/partials/viewer-advSelect.html',
	    controller:'advController',
	})
        .state('maps',{
	    url:'/:advId/maps/:mapId/',
	    templateUrl:'/www/partials/viewer-maps.html',
	    controller:'mapsController',
	})
        .state('maps.picPreview',{
	    url :'picPreview/:picId/',    
	    templateUrl:'/www/partials/viewer-maps.picPreview.html',
	    controller:'picPreviewController',
	})
        .state('blogs',{
	    url:'/:advId/blogs/',
	    templateUrl:'/www/partials/viewer-blogs.html',
	    controller:'blogsController',
	})
        .state('gear',{
	    url:'/:advId/gear/',
	    templateUrl:'/www/partials/viewer-gear.html',
	    controller:'gearController',
	})
    ;
});
