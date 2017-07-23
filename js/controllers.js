angular.module('starter.controllers', [])
.constant('WUNDERGROUND_API_KEY', '1cc2d3de40fa5af0')

.constant('FORECASTIO_KEY', '4cd3c5673825a361eb5ce108103ee84a')

.constant('FLICKR_API_KEY', '504fd7414f6275eb5b657ddbfba80a2c')

.filter('int', function() {
  return function(v) {
    return parseInt(v) || '';
  };
})
.controller('Search', function($scope) {
  $scope.items = ['Baypointe Hospital & Medical Center',
  'Our Lady of Lourdes International Medical Center','Ridon St. Jude Medical Center',
  'ZMMG COOP Women and Children Hospital','Divine Spirit General Hospital','Mother And Child General Hospital'];
})

.controller('MapCtrl', function($scope, $cordovaGeolocation, uiGmapGoogleMapApi, uiGmapIsReady, ngGPlacesAPI) {
	
	var posOptions = {timeout: 10000, enableHighAccuracy: false};
  	
  	// get user location with ngCordova geolocation plugin
  	$cordovaGeolocation
	    .getCurrentPosition(posOptions)
	    .then(function (position) {
	      $scope.lat  = position.coords.latitude;
	      $scope.long = position.coords.longitude;

	      // get nearby places once we have user loc in lat & long	
	      ngGPlacesAPI.nearbySearch({
	          latitude: $scope.lat,
	          longitude: $scope.long
	      }).then(
	          function(data){
	              console.log('returned with places data', data);
	              $scope.places = data;
	              return data;
	          });

	      // create new map with your location
	      uiGmapGoogleMapApi.then(function(maps){

	        $scope.control = {};

	      	$scope.myMap = {
	      		center: {
	      			latitude: $scope.lat,
	      			longitude: $scope.long
	      		}, 
	      		zoom : 14
	      	};
	      	$scope.myMarker = {
	      		id: 1, 
	      		coords: {
	      			latitude: $scope.lat,
	      			longitude: $scope.long
	      		}, 
	      		options: {draggable:false}
	      	};

	      });

	    }, function(err) {
	      // error
	    });

    $scope.getMap = function() {
        var map1 = $scope.control.getGMap();
        console.log('map is:', map1);
        console.log('with places:', $scope.places);
    };

    uiGmapIsReady.promise(1).then(function(instances) {
        instances.forEach(function(inst) {
        var map = inst.map;
        var uuid = map.uiGmap_id;
        var mapInstanceNumber = inst.instance; // Starts at 1.
        console.log('from map is ready:', map, uuid, mapInstanceNumber);
        });
    });
})
.controller('LocationController', function($ionicLoading, $http, $state, Geolocation, $cordovaGeolocation, $ionicPopup) {
  var vm = this;

vm.useGeolocation = function() {
  $ionicLoading.show();

  $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: false}).then(function (position) {
    var lat  = position.coords.latitude;
    var lng = position.coords.longitude;

    var url = 'https://civinfo-apis.herokuapp.com/civic/geolocation?latlng=' + lat + ',' + lng;
    $http.get(url).then(function(response) {
      $ionicLoading.hide();
      if (response.data.results.length) {
        Geolocation.data = response.data.results[0];
        $state.go('app.places');
      } else {
        $ionicPopup.alert({
          title: 'Unknown location',
          template: 'Please try again or move to another location.'
        });
      }
    })
    .catch(function(error) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Unable to get location',
        template: 'Please try again or move to another location.'
      });
    });
  });
};

})
.controller('PlaceController', function($scope, $ionicLoading, $ionicActionSheet, $http, $stateParams) {
  var vm = this;

  $ionicLoading.show();

  var url = 'https://civinfo-apis.herokuapp.com/civic/place?place_id=' + $stateParams.place_id;
  $http.get(url).then(function(response) {
    vm.place = response.data.result;
    $ionicLoading.hide();
  });

  vm.openSheet = function() {
    var sheet = $ionicActionSheet.show({
      titleText: 'Share this place',
      buttons: [
        { text: 'Share via Twitter' },
        { text: 'Share via Facebook' },
        { text: 'Share via Email'}
      ],
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        if (index === 0) {
          window.open('https://twitter.com/intent/tweet?text=' +
            encodeURIComponent('I found this great place! ' + vm.place.url));
        } else if (index === 1) {
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + vm.place.url);
        } else if (index === 2) {
          window.open('mailto:?subject=' + encodeURIComponent('I found this great place!') + '&body=' + vm.place.url);
        }
        sheet();
      }
    });
  };

})
.controller('PlacesController', function($http, $scope, $ionicLoading, $ionicHistory, $state, Geolocation, Types) {
  var vm = this;


  if (!Geolocation.data.geometry || !Geolocation.data.geometry.location) {
    $state.go('app.location');
    return;
  }

  var base = 'https://civinfo-apis.herokuapp.com/civic/places?location=' + Geolocation.data.geometry.location.lat + ',' + Geolocation.data.geometry.location.lng;
  var token = '';
  vm.canLoad = true;
  vm.places = [];

  vm.load = function load() {
    $ionicLoading.show();
    var url = base;
    var query = [];
    angular.forEach(Types, function(type) {
      if (type.enabled === true) {
        query.push(type.type.toLowerCase());
      }
    });
    url += '&query=' + query.join('|');

    if (token) {
      url += '&token=' + token;
    }

    $http.get(url).then(function handleResponse(response) {
      vm.places = vm.places.concat(response.data.results);
      token = response.data.next_page_token;

      if (!response.data.next_page_token) {
        vm.canLoad = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $ionicLoading.hide();
    });
  };

  $scope.$on('$ionicView.beforeEnter', function() {
    var previous = $ionicHistory.forwardView();
    if (!previous || previous.stateName != 'app.place') {
      token = '';
      vm.canLoad = false;
      vm.places = [];
      vm.load();
    }
  });
})
.controller('PreferencesController', function(Types) {
  var vm = this;

  vm.types = Types;
})
.controller('MyCtrl', function($scope, $ionicSlideBoxDelegate) {
   $scope.nextSlide = function() {
      $ionicSlideBoxDelegate.next();
   }
})

.controller('login', function ($scope, $http, $state, $ionicHistory) {
   $scope.loginform = function (){
    var username = $scope.username;
    var password = $scope.password;
    
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $http({
        url: 'http://localhost/ion2/php/login.php',
        method: "POST",
        data: {
            'username' : username,
            'password' : password
        }
    })
    .then(function(response){
        console.log(response);
        var data = response.data[0];
        if(data != "Account Doesn't exist!"){
            $scope.username = '';
            $scope.password = '';
            $state.go('app.map');
            localStorage.setItem("name",data);
        }else{
            $scope.error = data;
            $scope.password = '';
        }
    },
    function(response){
        console.log('Error');
    });
   }
})

.controller('register', function ($scope, $http, $state, $ionicHistory) {
   $scope.loginform = function (){
    var username = $scope.username;
    var password = $scope.password;
    var fullname = $scope.fullname;
	var cont1 = $scope.cont1;
	var cont2 = $scope.cont2;
	var cont3 = $scope.cont3;
    
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $http({
        url: 'http://localhost/ion2/php/register.php',
        method: "POST",
        data: {
            'username' : username,
            'password' : password,
            'fullname' : fullname,
			'cont1'    : cont1,
			'cont2'    : cont2,
			'cont3'    : cont3
        }
    })
    .then(function(response){
        console.log(response);
        var data = response.data[0];
            $scope.username = '';
            $scope.password = '';
            $state.go('app.login');
            localStorage.setItem("name",fullname);
     
    },
    function(response){
        console.log('Error');
    });
   }
}) 
.controller('contactus', function ($scope, $http, $state, $ionicHistory) {
   $scope.loginform = function (){
    var name = $scope.name;
    var email = $scope.email;
    var message = $scope.message;

    
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $http({
        url: 'http://localhost/ion2/php/contactus.php',
        method: "POST",
        data: {
            'name' : name,
            'email' : email,
            'message' : message
		
        }
    })
    .then(function(response){
        console.log(response);
        var data = response.data[0];
            $scope.name = '';
            $scope.email = '';
			$scope.message ='';
            $state.go('app.map');
            localStorage.setItem("name",fullname);
     
    },
    function(response){
        console.log('Error');
    });
   }
}) 
.controller('Contacts',function($scope,$http){
	var url = "http://localhost/ion2/php/contacts.php";
	$http.get(url).success(function(response){
		console.log(response);
		$scope.items =response;
	});	
	
})

.controller('Vibration',function($scope,$http){
	var url = "http://localhost/ion2/php/vibReading.php";
	$http.get(url).success(function(response){
		console.log(response);
		$scope.items =response;
	});	
	
})
.controller('DbController',function($scope,$http){

// Function to get employee details from the database
getInfo();
function getInfo(){
// Sending request to EmpDetails.php files 
$http.post('http://explearn.esy.es/databaseFiles/empDetails.php').success(function(data){
// Stored the returned data into scope 
$scope.details = data;
});
}

// Setting default value of gender 
$scope.empInfo = {'gender' : 'male'};
// Enabling show_form variable to enable Add employee button
$scope.show_form = true;
// Function to add toggle behaviour to form
$scope.formToggle =function(){
$('#empForm').slideToggle();
$('#editForm').css('display', 'none');
}
$scope.insertInfo = function(info){
$http.post('http://explearn.esy.es/databaseFiles/insertDetails.php',{"name":info.name,"email":info.email,"address":info.address,"gender":info.gender}).success(function(data){
if (data == true) {
getInfo();
$('#empForm').css('display', 'none');
}
});
}
$scope.deleteInfo = function(info){
$http.post('http://explearn.esy.es/databaseFiles/deleteDetails.php',{"del_id":info.emp_id}).success(function(data){
if (data == true) {
getInfo();
}
});
}
$scope.currentUser = {};
$scope.editInfo = function(info){
$scope.currentUser = info;
$('#empForm').slideUp();
$('#editForm').slideToggle();
}
$scope.UpdateInfo = function(info){
$http.post('http://explearn.esy.es/databaseFiles/updateDetails.php',{"id":info.emp_id,"name":info.emp_name,"email":info.emp_email,"address":info.emp_address,"gender":info.emp_gender}).success(function(data){
$scope.show_form = true;
if (data == true) {
getInfo();
}
});
}
$scope.updateMsg = function(emp_id){
$('#editForm').css('display', 'none');
}
})


.controller('WeatherCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicPlatform) {
  var _this = this;

  $ionicPlatform.ready(function() {
    // Hide the status bar
    if(window.StatusBar) {
      StatusBar.hide();
    }
  });

  $scope.activeBgImageIndex = 0;

  $scope.showSettings = function() {
    if(!$scope.settingsModal) {
     // Load the modal from the given template URL
      $ionicModal.fromTemplateUrl('settings.html', function(modal) {
        $scope.settingsModal = modal;
        $scope.settingsModal.show();
      }, {
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
      });
    } else {
      $scope.settingsModal.show();
    }
  };


  this.getBackgroundImage = function(lat, lng, locString) {
    Flickr.search(locString, lat, lng).then(function(resp) {
      var photos = resp.photos;
      if(photos.photo.length) {
        $scope.bgImages = photos.photo;
        _this.cycleBgImages();
      }
    }, function(error) {
      console.error('Unable to get Flickr images', error);
    });
  };

  this.getCurrent = function(lat, lng, locString) {
    Weather.getAtLocation(lat, lng).then(function(resp) {
      /*
      if(resp.response && resp.response.error) {
        alert('This Wunderground API Key has exceeded the free limit. Please use your own Wunderground key');
        return;
      }
      */
      $scope.current = resp.data;
      console.log('GOT CURRENT', $scope.current);
      $rootScope.$broadcast('scroll.refreshComplete');
    }, function(error) {
      alert('Unable to get current conditions');
      console.error(error);
    });
  };

  this.cycleBgImages = function() {
    $timeout(function cycle() {
      if($scope.bgImages) {
        $scope.activeBgImage = $scope.bgImages[$scope.activeBgImageIndex++ % $scope.bgImages.length];
      }
      //$timeout(cycle, 10000);
    });
  };

  $scope.refreshData = function() {
    Geo.getLocation().then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      Geo.reverseGeocode(lat, lng).then(function(locString) {
        $scope.currentLocationString = locString;
        _this.getBackgroundImage(lat, lng, locString.replace(', ', ','));
      });
      _this.getCurrent(lat, lng);
    }, function(error) {
      alert('Unable to get current location: ' + error);
    });
  };

  $scope.refreshData();
})

.controller('SettingsCtrl', function($scope, Settings) {
  $scope.settings = Settings.getSettings();

  // Watch deeply for settings changes, and save them
  // if necessary
  $scope.$watch('settings', function(v) {
    Settings.save();
  }, true);

  $scope.closeSettings = function() {
    $scope.modal.hide();
  };

});