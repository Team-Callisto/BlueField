angular.module('mapWidget', []);

angular.
  module('mapWidget').
  component('mapWidget', {
    template:
    `
    <md-card ng-show="displayMap">
      <md-card-header>
        <md-card-header-text>
          Company Location
        </md-card-header-text>
      </md-card-header>
      <md-card-content>
        <p id="map" ng-show="mapp" style="width: 800px; height: 600px"></p>
        <p id="directionsMap" ng-show="displayDirection" style="float:left;width: 400px; height: 600px"></p>
        <p id="directionsPanel" ng-show="displayDirection" style="float:left;width: 400px; height: 600px"></p>

      </md-card-content>
      <md-card-actions layout="row" layout-align="end center">
        <md-button ng-click="directionDisplay()">Direction</md-button>
      </md-card-actions>
    </md-card>
    `,
    binding: {
      data: '='
    },
    controller: function($scope, $rootScope, GoogleMap) {

      let currentAddress;
      let directionsService;
      let directionDisplay;


      $rootScope.displayMapFunc = function() {
        $scope.displayMap = true;
      }

      $rootScope.getAddressData = function(address) {
        currentAddress = address;
      }

      $rootScope.hideDisplayDirection = function() {
        $scope.displayDirection = false;
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
          directionsDisplay.setPanel(document.getElementById("directionsPanel"));
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
        })
          });
        }
      }




    }
  });
