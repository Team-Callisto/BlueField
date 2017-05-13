angular.module('mapWidget', []);

angular.
  module('mapWidget').
  component('mapWidget', {
    template:
    `
    <md-card ng-show="displayMap">
      <md-card-header>
        <md-card-header-text class="md-title">
          Company Location
        </md-card-header-text>
      </md-card-header>
      <md-card-content>

        <p id="map" ng-show="mapp" style="width: 850px; height: 600px"></p>
        <p id="directionsMap" ng-show="displayDirection" style="float:left;width: 850px; height: 450px"></p>

      </md-card-content>

      <md-card-content ng-show="displayData" layout="row" layout-align="center center">
        <md-card-actions >
          <md-button ng-click="displayFeature('TRANSIT')">TRANSIT</md-button>
        </md-card-actions>

        <md-card-actions >
          <md-button ng-click="displayFeature('DRIVING')">DRIVING</md-button>
        </md-card-actions>

        <md-card-actions >
          <md-button ng-click="displayFeature('BICYCLING')">BICYCLING</md-button>
        </md-card-actions>

        <md-card-actions >
          <md-button ng-click="displayFeature('WALKING')">WALKING</md-button>
        </md-card-actions>
      </md-card-content>

      <md-card-content ng-show="displayData" md-colors="{background:'GREY-600'}" style="display:flex; justify-content:space-around">
        <div><p class="md-subhead">Transportation: {{trans}}</p></div>
        <div><p class="md-subhead">Distance: {{dis}}</p></div>
        <div><p class="md-subhead">Time: {{totleTime}}</p></div>
      </md-card-content>

      <md-card-actions ng-show="mapp" layout="column" layout-align=" stretch">
        <md-button ng-click="directionDisplay()">Direction</md-button>
        <br>
      </md-card-actions>
      
    </md-card>
    `,
    binding: {
      data: '='
    },
    controller: function($scope, $rootScope, GoogleMap) {

      let currentAddress;
      let directionsService;
      let directionsDisplay;
      let originAddress;


      $rootScope.displayMapFunc = function() {
        $scope.displayMap = true;
      }

      $rootScope.getAddressData = function(address) {
        currentAddress = address;
      }

      $rootScope.hideDisplayDirection = function() {
        $scope.displayDirection = false;
        $scope.displayData = false;
      }

      $rootScope.hideDisplayMapp = function() {
        $scope.mapp = true;
      }

      
      $scope.directionDisplay = function() {

      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();
      $scope.displayDirection = true;
      $scope.mapp = false;
      if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(function (position) { 
        var coords = position.coords; 
        console.log('latitude: ', coords.latitude);
        console.log('longitude: ', coords.longitude);
        latlng = new google.maps.LatLng(coords.latitude, coords.longitude); 
        GoogleMap.getAddress(latlng)
        .then(function(end) {
          console.log(end);
          console.log(currentAddress);

          var mapOptions = {
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: latlng
          }
          map = new google.maps.Map(document.getElementById("directionsMap"), mapOptions);
          directionsDisplay.setMap(map);
          //directionsDisplay.setPanel(document.getElementById("directionsPanel"));
          return end;
        })
        .then(function(end) {
          var request = {
            origin: end,
            destination: currentAddress,
            travelMode: google.maps.TravelMode.DRIVING
          };
          directionsService.route(request, function(response, status) {
            console.log(status);
            if(status === 'OK') {
              directionsDisplay.setDirections(response);
            }
          });
          return end;
        })
        .then(function(end) {
            $scope.displayData = true;
            return end;
          })
        .then(function(end) {
          GoogleMap.getDirectionData(end, currentAddress, 'DRIVING')
          .then(function(datas) {
            $scope.trans = 'DRIVING';
            $scope.totleTime = datas.duration;
            $scope.dis = datas.distance;
          })
        })

          });
        }
      }


      $scope.displayFeature = function(transportation) {
      console.log("transportation Gos here", transportation)
      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();
      $scope.displayDirection = true;
      $scope.mapp = false;
      if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(function (position) { 
        var coords = position.coords; 
        console.log('latitude: ', coords.latitude);
        console.log('longitude: ', coords.longitude);
        latlng = new google.maps.LatLng(coords.latitude, coords.longitude); 
        GoogleMap.getAddress(latlng)
        .then(function(end) {
          console.log(end);
          console.log(currentAddress);

          var mapOptions = {
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: latlng
          }
          map = new google.maps.Map(document.getElementById("directionsMap"), mapOptions);
          directionsDisplay.setMap(map);
          //directionsDisplay.setPanel(document.getElementById("directionsPanel"));
          return end;
        })
        .then(function(end) {
          console.log("transportation Gos here", transportation)
          var way = google.maps.TravelMode[transportation];
          originAddress = end
          var request = {
            origin: end,
            destination: currentAddress,
            travelMode: way
          };
          directionsService.route(request, function(response, status) {
            console.log(status);
            if(status === 'OK') {
              directionsDisplay.setDirections(response);
            }
          });
          return transportation;
        })
        .then(function(mode) {
          GoogleMap.getDirectionData(originAddress, currentAddress, mode)
          .then(function(datas) {
            console.log("LASTONEEEEEEEEE!!!!!!", datas)
            $scope.totleTime = datas.duration;
            $scope.dis = datas.distance;
            $scope.trans = mode;
          })
        })




          });
        }
      }


    }
  });
