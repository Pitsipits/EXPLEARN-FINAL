angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'
,'starter.filters','starter.directives','uiGmapgoogle-maps', 'ngCordova', 'ngGPlaces'])


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.factory('Geolocation', function() {
  return {
    data: {}
  };
})

.factory('Types', function() {
  return [
    {type: 'Park', enabled: true},
    {type: 'Hospital', enabled: true},
    {type: 'Library', enabled: true},
    {type: 'Museum', enabled: true}
  ];
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  })
  
 .state('app.map', {
    url: '/map',
    views: {
      'menuContent': {
        templateUrl: 'templates/map.html',
		controller:'MapCtrl'
		
		
      }
    }
  })
  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
	
		
		
      }
    }
  })
  .state('app.find', {
    url: '/find',
    views: {
      'menuContent': {
        templateUrl: 'templates/find.html',
	
		
		
      }
    }
  })
  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
		controller: 'Search'
      }
    }
  })
   .state('signup',{
      url: '/signup',
      
              templateUrl: 'templates/signup.html'
     
  })
   .state('app.contacts', {
    url: '/contacts',
    views: {
      'menuContent': {
        templateUrl: 'templates/contacts.html',
		controller: 'contactus'
      }
    }
  })
  .state('app.travel', {
    url: '/travel',
    views: {
      'menuContent': {
        templateUrl: 'template/travel.html',
		controller:'DbController'
      }
    }
  })
  .state('app.weather', {
    url: '/weather',
    views: {
      'menuContent': {
        templateUrl: 'templates/weather.html',
		controller:'WeatherCtrl'
      }
    }
  })
   .state('app.location', {
    url: '/location',
    views: {
      'menuContent': {
        templateUrl: 'templates/location.html',
		controller: 'LocationController as vm'
      }
    }
  })
  .state('app.place', {
    url: '/places/:place_id',
    views: {
      'menuContent': {
        templateUrl: 'templates/place.html',
		controller: 'PlaceController as vm'
      }
    }
  })
 .state('app.places', {
    url: '/places',
    views: {
      'menuContent': {
        templateUrl: 'templates/places.html',
		controller: 'PlacesController as vm'
      }
    }
  })
 .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
		 controller: 'PreferencesController',
        controllerAs: 'vm'
      }
    }
  })
  .state('box', {
    url: '/box',
   
        templateUrl: 'templates/box.html',
		 controller:'MyCtrl'
      })
  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html'
	
		
      }
    }
  })
   
  
   .state('login',{
      url: '/login',
      
              templateUrl: 'templates/login.html'
     
  });
  $urlRouterProvider.otherwise('/box');
});
