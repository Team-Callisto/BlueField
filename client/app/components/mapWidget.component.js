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
        <p id="map" style="width: 800px; height: 600px"></p>
      </md-card-content>
      <md-card-actions layout="row" layout-align="end center">
        <md-button ng-click="analyzeText()">Direction</md-button>
      </md-card-actions>
    </md-card>
    `,
    binding: {
      data: '='
    },
    controller: function($scope, $rootScope) {
      $rootScope.displayMapFunc = function() {
        $scope.displayMap = true;
      }
    }
  });
