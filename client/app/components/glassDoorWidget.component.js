angular.module('glassDoorWidget',[]);

angular.module('glassDoorWidget')

// .component('glassDoorWidget',{
//
//   template : `
//
//    <md-card class='widget' id='glassDoor-widget' >
//     <div class='glass-view'></div>
//    </md-card>
//
//   `,
//   controller : function($scope){
//
//   }
// })


.controller('glassdoorController',function($http,$scope){
  $scope.search = "";
  $scope.queryGlassdoor = function(){
    $http({
      method: "POST",
      url: "/api/glassdoor",
      data : {
        location : $scope.search
      }
    })
  };
})
