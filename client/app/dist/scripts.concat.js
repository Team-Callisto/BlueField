angular.module('app',[
  'ngRoute',
  'ngMaterial',
  'app.input',
  'app.dashboard',
  'app.auth',
  'app.services'
])
.config(function($locationProvider, $routeProvider, $mdThemingProvider, $httpProvider) {
  $locationProvider.hashPrefix('');
  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('blue');
  $routeProvider
    .when('/', {
      templateUrl: './app/landing/landingTemplate.html',
      controller: 'authController'
    })
    .when('/input', {
      templateUrl: './app/input/inputTemplate.html',
      controller: 'inputController'
    })
    .when('/dashboard', {
      templateUrl: './app/dashboard/dashboardTemplate.html',
      controller: 'dashboardController'
    })
    .when('/logout', {
      redirectTo: '/'
    })
})
.controller('navController', function($scope, $location) {
    $scope.showSignUp = false;

    $scope.renderNavButtons = function() {
      var currentPath = $location.path();
      return currentPath !== "/";
    }

    $scope.handleDashboardClick = function() {
      $location.path('dashboard');
    }

    $scope.handleInputClick = function() {
      $location.path('input');
    }

    $scope.handleLogoutClick = function() {
      $location.path('logout');
    }

})
.run((Auth, $rootScope, $location, $http) => Auth.status($rootScope, $location, $http))

// .     .       .  .   . .   .   . .    +  .
//   .     .  :     .    .. :. .___---------___.
//        .  .   .    .  :.:. _".^ .^ ^.  '.. :"-_. .
//     .  :       .  .  .:../:            . .^  :.:\.
//         .   . :: +. :.:/: .   .    .        . . .:\
//  .  :    .     . _ :::/:               .  ^ .  . .:\
//   .. . .   . - : :.:./.                        .  .:\
//   .      .     . :..|:                    .  .  ^. .:|
//     .       . : : ..||        .                . . !:|
//   .     . . . ::. ::\(                           . :)/
//  .   .     : . : .:.|. ######              .#######::|
//   :.. .  :-  : .:  ::|.#######           ..########:|
//  .  .  .  ..  .  .. :\ ########          :######## :/
//   .        .+ :: : -.:\ ########       . ########.:/
//     .  .+   . . . . :.:\. #######       #######..:/
//       :: . . . . ::.:..:.\           .   .   ..:/
//    .   .   .  .. :  -::::.\.       | |     . .:/
//       .  :  .  .  .-:.":.::.\             ..:/
//  .      -.   . . . .: .:::.:.\.           .:/
// .   .   .  :      : ....::_:..:\   ___.  :/
//    .   .  .   .:. .. .  .: :.:.:\       :/
//      +   .   .   : . ::. :.:. .:.|\  .:/|
//      .         +   .  .  ...:: ..|  --.:|
// .      . . .   .  .  . ... :..:.."(  ..)"
//  .   .       .      :  .   .: ::/  .  .::\
;
angular.module('calendarWidget', [])
.component('calendarWidget', {
  templateUrl: './app/components/calendarWidgetTemplate.html',
  controller: function calendarController($scope, $http, $route, $mdDialog){
    $scope.today = new Date();
    $scope.dates = [];

    $scope.maxDate = new Date();
    $scope.maxDate.setDate($scope.today.getDate() + 60);
    $scope.taskData;

    $http.get('/api/dates')
    .then(data => {
      $scope.taskData = data;
      var jsDates = data.data.map(date => new Date(date.dueDate));
      $scope.dates = jsDates.map(date=> {
        return [date.getFullYear(), date.getMonth(), date.getDate()]
      });
    });

    // Popup dialog upon clicking a date on the calendar
    $scope.showPrerenderedDialog = function(ev) {
      $scope.date = ev.target.parentNode.attributes['aria-label'].value;
      $scope.taskDate = new Date($scope.date);
      $scope.task = $scope.taskData.data.filter(task => new Date(task.dueDate).getTime() === $scope.taskDate.getTime())

      $mdDialog.show({
        contentElement: '#myDialog',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    //Formula to show dates on the calendar (see calendar html "md-date-filter")
    $scope.filterDates = date => {
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();

      return $scope.dates.reduce((acc, date)=>{
        if(year===date[0] && month === date[1] && day === date[2]){
          return true;
        }
        return acc;
      }, false)
    };
  }
})
;
angular.module('emailToneWidget', []);

angular.
  module('emailToneWidget').
  component('emailToneWidget', {
    template:
    `
    <md-card class="tone-card-input">
      <md-card-content>
        <md-input-container class="md-block">
          <label>Email to Analyze</label>
          <textarea ng-model="textToAnalyze" rows="10" md-select-on-focus></textarea>
        </md-input-container>
      </md-card-content>
      <md-card-actions layout="row" layout-align="end center">
        <md-button class="nav-btn md-raised md-accent md-button md-ink-ripple" ng-click="analyzeText()">Analyze Tone</md-button>
      </md-card-actions>
    </md-card>

    <md-card ng-show="analyzed">
      <md-card-content>
          <canvas id="emotionTone" class="chart-horizontal-bar"
            chart-data="[emotionToneData]" chart-labels="emotionToneLabels" >
          </canvas>
          <canvas id="languageTone" class="chart-horizontal-bar"
            chart-data="[languageToneData]" chart-labels="languageToneLabels" >
          </canvas>
          <canvas id="socialTone" class="chart chart-radar"
            chart-data="[socialToneData]" chart-labels="socialToneLabels" >
          </canvas>

      </md-card-content>
    </md-card>
    `,
    controller: function($scope, Tone) {
      console.log('hello tone widge');

      $scope.analyzeText = function() {
        console.log('inside dcontroller')
        Tone.analyzeTone({ text: $scope.textToAnalyze})
        .then(function(data) {
          console.log('double inside controller', data)
          console.log('typeoff', typeof data);
          $scope.analyzed = data.document_tone;

          let emotionData = parseToneData('emotion_tone', $scope.analyzed);
          $scope.emotionToneData = emotionData.scores;
          $scope.emotionToneLabels = emotionData.toneNames;

          let languageData = parseToneData('language_tone', $scope.analyzed);
          $scope.languageToneData = languageData.scores;
          $scope.languageToneLabels = languageData.toneNames;

          let socialData = parseToneData('social_tone', $scope.analyzed);
          $scope.socialToneData = socialData.scores;
          $scope.socialToneLabels = socialData.toneNames;
        })
      }

      var parseToneData = function(categoryId, data) {
        let parsed = {
          scores: [],
          toneNames: []
        };

        let category = data.tone_categories.filter(tone => tone.category_id === categoryId)[0];
        console.log('Category', category);
        console.log('Category tones', category.tones);
        category.tones.forEach(tone => {
          parsed.scores.push(tone.score);
          parsed.toneNames.push(tone.tone_name);
        })
        return parsed;
      }
    }
  });
;
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
;
angular.module('jobWidget', []);

angular.
  module('jobWidget').
  component('jobWidget', {
    template:
    `
    <md-card class="job-card">
      <md-card-header style="display:flex; align-items:center">
        <md-card-avatar class="job-widget-image" style="{{$ctrl.imageStyle($ctrl.data.imageUrl)}}"></md-card-avatar>

        <md-card-header-text>
          <span class="md-headline">{{$ctrl.data.company}}</span>
          <span class="md-subhead">{{$ctrl.data.position}}</span>
        </md-card-header-text>

        <!--<md-button class="md-fab md-mini" ng-click="$ctrl.toggleFavorite()">
            <md-tooltip md-direction="top">Set as Favorite</md-tooltip>
            <md-icon>{{$ctrl.renderFavoriteIcon()}}</md-icon>
        </md-button>-->

        <md-button class="md-fab md-mini" ng-click="$ctrl.editJob()">
            <md-tooltip md-direction="top">Edit Job</md-tooltip>
            <md-icon>edit</md-icon>
        </md-button>

        <md-button class="md-fab md-mini" ng-click="$ctrl.deleteJob($ctrl.data)">
            <md-tooltip md-direction="top">Delete Job</md-tooltip>
            <md-icon>delete</md-icon>
        </md-button>
      </md-card-header>

      <md-divider></md-divider>
      <md-tabs md-dynamic-height="" md-border-bottom="" md-center-tabs="true" md-stretch-tabs="always">

         <!--<md-tab>
            <md-tab-label><md-icon>expand_less</md-icon></md-tab-label>
          </md-tab>-->

          <md-tab label="JOB INFO">
          <md-content>
              <p class="md-subhead"><strong>Date Applied: </strong>{{$ctrl.parseDate($ctrl.data.dateCreated)}}</p>
              <p class="md-subhead"><strong>Application Link: </strong>{{$ctrl.data.link}}</p>
              <p class="md-subhead"><strong>Current Step: </strong>{{$ctrl.data.currentStep.name}}</p>
              <p class="md-subhead"><strong>Next Step: </strong>{{$ctrl.data.nextStep.name}}</p>
              <p class="md-subhead"><strong>Salary: </strong>\${{$ctrl.data.salary}}</p>
              <p id="map_canvas" style="float:left;width:70%; height:100%"></p>
          </md-content>
          </md-tab>

          <md-tab label="COMPANY">
          <md-content>
            <p class="md-subhead"><strong>Company: </strong>{{$ctrl.data.officialName}}</p>
            <p class="md-subhead"><strong>Website: </strong><a href='http://{{$ctrl.data.website}}'/>{{$ctrl.data.website}}</a></p>
            <p class="md-subhead"><strong>Description: </strong>{{$ctrl.data.description}}</p>
            <p class="md-subhead"><strong>Founded: </strong>{{$ctrl.data.founded}}</p>
            <p class="md-subhead"><strong># of Employees: </strong>{{$ctrl.data.approxEmployees}}</p>
            <p class="md-subhead"><strong>Average Rating:{{averageRating}}</strong>
            <br>
            <strong>Pros:</strong>{{pros}}
            <br>
            <strong>Cons: </strong>{{cons}}
            </p><br><a href='https://www.glassdoor.com/index.htm'>powered by <img src='https://www.glassdoor.com/static/img/api/glassdoor_logo_80.png' title='Job Search' /></a>
            <md-button ng-click="$ctrl.queryGlassdoor()">Get Glassdoor Review!</md-button>
            <p class="md-subhead" ><strong>Address: </strong>{{$ctrl.data.address}}</p>

            <md-button ng-click="$ctrl.googleMap($ctrl.data.address, $ctrl.data.officialName)">Show Map</md-button>


            </md-content>
          </md-tab>

          <md-tab label="CONTACT">
          <md-content ng-repeat='contact in $ctrl.data.contacts'>
            <div layout="column" class="contact-divider" style="padding-left: 0">
              <p class="md-subhead contact-info"><md-icon>person</md-icon>{{contact.name}}</p>
              <p class="md-subhead contact-info"><md-icon>phone</md-icon>{{contact.phoneNumber}}</p>
              <p class="md-subhead contact-info"><md-icon>email</md-icon>{{contact.email}}</p>
            </div>
          </md-content>
          </md-tab>

          <md-tab label="STATUS">
          <md-content>
            <div layout="column" class="contact-divider" style="padding-left: 0">
              <p class="md-subhead" style="margin-top: 0"> <strong>Current Step: </strong> {{$ctrl.data.currentStep.name}}</p>
              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.currentStep.dueDate)}}</p>
              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>
                <md-content layout-margin ng-repeat='comment in $ctrl.data.currentStep.comments'> {{comment}} </md-content>
              </p>

              <md-divider style="margin-top: 16px; margin-bottom: 16px;"></md-divider>

              <p class="md-subhead"> <strong>Next Step: </strong> {{$ctrl.data.nextStep.name}}</p>
              <p class="md-subhead" style="margin-top: 0"> <strong>Due: </strong> {{$ctrl.parseDate($ctrl.data.nextStep.dueDate)}}</p>
              <p class="md-subhead" style="margin-top: 0; margin-bottom: 0;" ng-if="$ctrl.data.currentStep.comments.length > 0"> <strong>Comments: </strong>
                <md-content layout-margin ng-repeat='comment in $ctrl.data.nextStep.comments'> {{comment}} </md-content>
              </p>
            </div>

          </md-content>
        </md-tab>

        </md-tabs>

    </md-card>
    `,
    bindings: {
     data: '='
    },



    controller: function($window, $scope, $http, $route, $mdDialog, Jobs, GoogleMap, $rootScope) {

      this.favorite = false;

      Jobs.get().then(function(data) {
        $scope.jobs = data;
      });

      this.toggleFavorite = function() {
        this.favorite = !this.favorite;
      }

      this.renderFavoriteIcon = function() {
        return this.favorite ? 'star' : 'star_border';
      }

      // parse the style string for setting the logo image
      // parse the style string for setting the logo image
      this.imageStyle = function(imageUrl) {
        return `background-image:url('${imageUrl}');width:120px;background-repeat: no-repeat;background-size:cover;margin-right:10px`;
      };

      // use moment.js to parse de date data in a user-friendly format
      this.parseDate = function(applicationDate) {
        var date = new Date(applicationDate);
        var dateFormated = moment(date).format("MMM Do YY");
        var dateFromNow = moment(date).fromNow();
        return `${dateFromNow} on ${dateFormated}`;
      }

      this.deleteJob = function(job) {
        let query = JSON.stringify({_id : job._id});

        if($window.confirm('Are you sure you want to delete this job?')) {
          Jobs.delete(query)
          .then(function(res) {
            $route.reload()
            $window.alert(res);
          })
          .catch(function(err) {
            console.log(err)
          })
        }
      }




      ////////////////////Google Map///////////////////////////////////////////

      this.googleMap = function(address, companyName) {
        $rootScope.displayMapFunc();
        $rootScope.getAddressData(address);
        $rootScope.hideDisplayDirection();
        $rootScope.hideDisplayMapp();
        window.scrollTo(0,400);
        GoogleMap.getLocationCode(address)
        .then(function(data){

          var mapProp = {
          center:data,
          zoom:12,
          mapTypeId:google.maps.MapTypeId.ROADMAP
          };
          var map=new google.maps.Map(document.getElementById("map"),mapProp);
          var marker=new google.maps.Marker({
            position:data,
            });
          marker.setMap(map);
          var infoWindow = new google.maps.InfoWindow({ 
            content: companyName
            }); 
          infoWindow.open(map, marker); 
          
        })
        .catch(function(err) {
          console.log(err);
        })
      }

      this.queryGlassdoor = function(){

        $http({
          method: "POST",
          url: "/api/glassdoor",
          data : {
            q : this.data.company
          }
          // console.log($scope.jobs[1].company)
        }).then(function(response){
            // console.log('hello world');


            let parsedBody = JSON.parse(response.data.body);

            $scope.pros = parsedBody.response.employers[0].featuredReview.pros;
            $scope.cons = parsedBody.response.employers[0].featuredReview.cons;
            $scope.averageRating = parsedBody.response.employers[0].overallRating;

        })
      };

      this.editJob = function($event) {
        var parentEl = angular.element(document.body)
        $mdDialog.show({
          parent: parentEl,
          targetEvent: $event,
          locals: {
            jobs: $scope.jobs
          },
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: `
          <md-dialog>
            <md-content layout-padding>
              <div layout="row">
                <span flex="80" class="md-display-1">Edit Application</span>
              </div>

              <form name="jobForm" ng-submit="updateJob($ctrl.data)">
                <div layout="row">
                  <span class="md-title">Application Information</span>
                </div>
                <div layout="row">
                  <md-input-container flex="30">
                    <label>Salary</label>
                    <md-icon class="material-icons">attach_money</md-icon>
                    <input ng-model="$ctrl.data.salary">
                  </md-input-container>
                </div>
                <div layout="row">
                  <md-input-container flex="50">
                    <label>Application Link</label>
                    <md-icon class="material-icons">web</md-icon>
                    <input ng-model="$ctrl.data.link" type="url">
                  </md-input-container>
                </div>
                <div layout="row">
                  <span class="md-title">Contacts</span>
                </div>
                <div layout="row" layout-padding ng-repeat="contact in $ctrl.data.contacts track by $index">
                  <md-input-container flex="35">
                    <label>Name</label>
                    <md-icon class="material-icons">contacts</md-icon>
                    <input ng-model="contact.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Phone</label>
                    <md-icon class="material-icons">call</md-icon>
                    <input ng-model="contact.phoneNumber" type="tel">
                  </md-input-container>

                  <md-input-container flex="30">
                    <label>e-mail</label>
                    <md-icon class="material-icons">email</md-icon>
                    <input ng-model="contact.email" type='email'>
                  </md-input-container>
                  <md-button ng-hide="$index>0" ng-click="addContact($ctrl.data)" class="md-fab" aria-label="Edit contact">
                    <i class="material-icons">add</i>
                    <md-tooltip>Add Contact</md-tooltip>
                  </md-button>
                </div>
                <div layout="row">
                  <span class="md-title">Modify Steps</span>
                </div>
                <br>
                <div layout="row">
                  <span class="md-subhead">Current Step</span>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="75">
                    <md-icon class="material-icons">subject</md-icon>
                    <label>Current Step</label>
                    <input ng-model="$ctrl.data.currentStep.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Due Date</label>
                    <md-datepicker ng-model="$ctrl.data.currentStep.dueDate" md-hide-icons="calendar"></md-datepicker>
                  </md-input-container>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="90">
                    <label>Current Step Comments</label>
                    <md-icon class="material-icons">comment</md-icon>
                    <textarea ng-model="$ctrl.data.currentStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>
                  </md-input-container>
                </div>
                <div layout="row">
                  <span class="md-subhead">Next Step</span>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="75">
                    <label>Next Step</label>
                    <md-icon class="material-icons">subject</md-icon>
                    <input ng-model="$ctrl.data.nextStep.name">
                  </md-input-container>

                  <md-input-container flex="25">
                    <label>Due Date</label>
                    <md-datepicker ng-model="$ctrl.data.nextStep.dueDate" md-hide-icons="calendar"></md-datepicker>
                  </md-input-container>
                </div>
                <div layout="row" layout-padding>
                  <md-input-container flex="90">
                    <label>Next Step Comments</label>
                    <md-icon class="material-icons">comment</md-icon>
                    <textarea ng-model="$ctrl.data.nextStep.comments[0]" md-maxlength="150" rows="1" md-select-on-focus></textarea>
                  </md-input-container>
                </div>

                <md-button type="submit" class="md-primary">Update Job</md-button>
              </form>
            </md-content>
          </md-dialog>`,
          controller: function DialogController($scope, $mdDialog, Jobs) {

            $scope.addContact = (data) => {
              data.contacts.push({name: undefined,
                         phoneNumber: undefined,
                         email: undefined
              })
            }

            $scope.closeDialog = function() {
              $mdDialog.hide();
            }
            $scope.updateJob = function(job) {
              Jobs.update(JSON.stringify(job))
              .then(function(res) {
                $scope.closeDialog()
                $window.alert(res)
              })
              .catch(function(err) {
                console.log(err)
              })
            }
          }
        })
      }
    }
  });
;
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
;
angular.module('newsWidget', []);

angular.
  module('newsWidget').
  component('newsWidget', {
    template:
    `
    <md-card id="news-widget" class='widget' ng-if="articles !== 0">
      <span class="md-headline">Your Curated News</span>
      <md-divider></md-divider>

      <div class="news-img-container" style="background-image:url('{{imageUrl}}')"></div>

      <md-content>
        <span>{{title}}</span>
        <p>From: {{source}}</p>
        <p>{{content}}</p>
      </md-content>

      <md-divider></md-divider>
      <md-footer style="padding-bottom:60px">
        <md-button ng-click="prevArticle()">
            <md-tooltip md-direction="top">Previous Article</md-tooltip>
            <md-icon>navigate_before</md-icon>
        </md-button>
        <md-button ng-click="openArticle()">
            Read More ...
        </md-button>
        <md-button ng-click="nextArticle()">
            <md-tooltip md-direction="top">Next Article</md-tooltip>
            <md-icon>navigate_next</md-icon>
        </md-button>
        <div>{{current}} of {{articles}}</div>
      </md-footer>
    </md-card>
    `,
    controller: function(News, User, $scope) {
      var currentArticle = 0;
      var newsData;
      $scope.current = 1;
      $scope.articles = 0;

      User.getCompanies().then(comp => {
        News.getNews(comp).then(data =>{
          newsData = data;
          if(!!newsData) {
            $scope.articles = newsData.length;
          } else {
            $scope.articles = 0;
            $scope.current = 0;
          }
          setArticle()
        })
      })

      $scope.nextArticle = () => {
        if(newsData[currentArticle+1] !== undefined) {
          currentArticle++;
          $scope.current = currentArticle + 1
          setArticle();
        }
      }

      $scope.openArticle = () => {
        var url = newsData[currentArticle].url;
        window.open(url);
      }

      $scope.prevArticle = () => {
        if(currentArticle > 0) {
          currentArticle--;
          $scope.current = currentArticle + 1
          setArticle();
        }
      }

      var setArticle = () => {
        if(!!newsData) {
          if(newsData[currentArticle].image) {
            $scope.imageUrl = newsData[currentArticle].image.thumbnail.contentUrl;
          } else {
            $scope.imageUrl = 'http://www.freeiconspng.com/uploads/no-image-icon-1.jpg';
          }
          $scope.title = newsData[currentArticle].name;
          $scope.source = newsData[currentArticle].provider[0].name;
          $scope.content = newsData[currentArticle].description;
        }
      }

    },
  });
;
angular.module('profileWidget', []);

angular.
  module('profileWidget').
  component('profileWidget', {
    template:
    `
    <md-card id="profile-widget" class='widget' layout="row">
      <div class="profile-img-container">
        <img class="profile-img" src="{{$ctrl.user.profilePic}}">
      </div>
      <div class="profile-data-container">
        <span class="md-headline">{{$ctrl.user.username}}</span>
        <p>{{$ctrl.user.city}}, {{$ctrl.user.state}}</p>
        <p>{{$ctrl.user.email}}</p>
        <p>Active Applications: {{$ctrl.user.jobs.length}}</p>
      </div>
      <!-- <button id="profile-add-job" ng-click="$ctrl.handleAddJobClick()">
        <md-icon>add</md-icon>Add New Job
      </button> -->
    </md-card>
    `,
    controller: function($location, User) {
      User.getAllData().then(data => {
        this.user = data;
      });
    }

  });
;
angular.module('tasksWidget', []);

angular.
  module('tasksWidget').
  component('tasksWidget', {
    template:
    `
    <md-card id="tasks-widget" class='widget'>
      <span class="md-headline">Your Task Manager </span>

      <md-divider></md-divider>

      <div class="input-container">
        <input type="text" placeholder="Add a new task..." ng-model="inputValue"></input>
        <md-button class="md-icon-button" ng-click="$ctrl.createTask(inputValue); inputValue = null">
            <md-tooltip md-direction="top">Add Task</md-tooltip>
            <md-icon>add</md-icon>
        </md-button>

        <md-button class="md-icon-button" ng-click="$ctrl.deleteAllCompleted()">
            <md-tooltip md-direction="top">Remove Completed Tasks</md-tooltip>
            <md-icon>delete</md-icon>
        </md-button>

        <!-- <md-button class="md-icon-button" ng-click="">
            <md-tooltip md-direction="top">Edit Mode</md-tooltip>
            <md-icon>edit_mode</md-icon>
        </md-button> -->
      </div>

      <md-divider ng-if="$ctrl.tasksList.length > 0"></md-divider>

      <md-content>

        <ul>
          <li ng-repeat="task in $ctrl.tasksList">
            <md-checkbox ng-checked="task.completed" ng-click="$ctrl.toggleCompleted(task._id, task.completed)">{{task.name}}</md-checkbox>
          </li>
        </ul>



      </md-content>
    </md-card>
    `,
    controller: function($log, Tasks) {

      this.getTasks = function() {
        Tasks.get().then(data => {
          this.tasksList = data || [];
        });
      }
      this.getTasks();

      this.createTask = function(name) {
        if(name && name.length > 0) {
          Tasks.create({ name: name }).then(res => {
            this.getTasks();
          });
        }
      }


      this.deleteTask = function(id) {
        var query = JSON.stringify({ _id: id });

        Tasks.delete(query).then(res => {
          this.getTasks();
        });
      }



      this.updateTask = function(id, name, completed) {

        var query = { _id: id };
        if(name) {
          query.name = name;
        }

        if(typeof completed === 'boolean') {
          query.completed = completed;
        }
        query = JSON.stringify(query);

        Tasks.update(query).then(res => {
          this.getTasks();
        });
      }

      this.toggleCompleted = function(id, completed) {
        this.updateTask(id, null, !completed);
      }

      this.deleteAllCompleted = function() {
        this.tasksList.forEach(task => {
          if(task.completed) {
            this.deleteTask(task._id);
          }
        });
      }

    }
  });
;
angular.module('app.dashboard', [
  'ngMaterial',
  'profileWidget',
  'newsWidget',
  'calendarWidget',
  'jobWidget',
  'tasksWidget',
  'emailToneWidget',
  'mapWidget',
  'chart.js'])
.controller('dashboardController', function dashboardController($scope, Companies, User, Jobs, Tasks, Tone){


  $scope.getJobs = function() {
    Jobs.get()
    .then(function(data) {
      $scope.jobs = data
    })
    .catch(function(err) {
      console.log(err)
    })
  }
  $scope.getJobs()

  $scope.setBackgroundImg = function(job) {
    return `background-image:url("${job.imgURL}")`;
  }

  $scope.getDate = function(job) {
    var dateStr = job.applicationDate;
    var date = new Date(dateStr);
    var dateFormat = moment(date).format("MMM Do YY");
    var fromNow = moment(date).fromNow();
    return `${dateFormat}  |  ${fromNow}`
  }

  $scope.newsArticle = {number:0};

  $scope.test = function() {
    Companies.getNews('amazon')
    .then(function(res) {
    })
  }

  $scope.filterJobs = function (job) {
      return (angular.lowercase(job.company).indexOf(angular.lowercase($scope.search) || '') !== -1 ||
              angular.lowercase(job.position).indexOf(angular.lowercase($scope.search) || '') !== -1);
  };

});
;
angular.module('app.input', [
  'ngMaterial',
  'ngMessages'
])
.controller('inputController', function($scope, $http, $location, News, Companies, Jobs) {
  
  $scope.job = {
    company: undefined,
    salary: undefined,
    dateCreated: new Date(),
    position: undefined,
    contacts: [{name: undefined,
              phoneNumber: undefined,
              email: undefined}],
    link: undefined,
    website: undefined,
    description: undefined,
    imageUrl: undefined,
    officialName: undefined,
    approxEmployees: undefined,
    founded: undefined,
    address: undefined,
    currentStep: {name: undefined,
              comments:[],
              dueDate: null}, 
    nextStep: {name: undefined,
              comments:[],
              dueDate: null}
  };

  $scope.addContact = () => {
    $scope.job.contacts.push({name: undefined,
              phoneNumber: undefined,
              email: undefined})
  }

  $scope.submitJob = function(data){
    console.log($scope.job);

    if($scope.job.nextStep.name === undefined) {
      $scope.job.nextStep = null;
    }

    if($scope.job.contacts[0].name === undefined) {
      $scope.job.contacts = [];
    }

    Companies.getInfo($scope.job.website).then((data)=> {

      if(data === undefined) return;

      $scope.job.imageUrl = data.logo;
      $scope.job.description = data.organization.overview;
      $scope.job.officialName = data.organization.name;
      $scope.job.approxEmployees = data.organization.approxEmployees;
      $scope.job.founded = data.organization.founded;

      var addr = data.organization.contactInfo.addresses[0];

      $scope.job.address = addr.addressLine1 + ", "
        + addr.locality + ", "
        + addr.region.code + ", "
        + addr.postalCode + ", "
        + addr.country.code;

      Jobs.create($scope.job).then((res) => {
        alert(res);
        $location.url('/dashboard');
      });
    });
  }

});
angular.module('app.auth', [
  'ngMaterial',
  'ngMessages',
  'signInForm',
  'signUpForm'
])
.controller('authController', function($rootScope, $scope, Auth) {

  Auth.logout();

  $rootScope.showWelcomeMessage = true;
  $rootScope.showSignUp = false;
  $rootScope.showSignIn = false;

  $scope.handleGetStarted = function() {
    $rootScope.showWelcomeMessage = false;
    $rootScope.showSignUp = false;
    $rootScope.showSignIn = true;
  }
})
;
angular.module('signInForm', []);

angular.
  module('signInForm').
  component('signInForm', {
    template:
    `
    <md-card id="signin" class="landingCard" layout-margin>
      <h2>Please Sign In</h2>

      <form name="signInForm" ng-submit="">

        <div layout="row">
          <md-input-container flex='100'>
            <label>User Name</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>
            <input ng-model="$ctrl.user.username" ng-required="true">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Password</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">lock</md-icon>
            <input ng-model="$ctrl.user.password" ng-required="true" type="password">
          </md-input-container>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign In</md-button>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleGoTo()" class="md-primary">I want to create an account...</md-button>
        </div>
      </form>
    </md-card>
    `,
    controller: function($rootScope, Auth) {
      this.user = {
        username: undefined,
        password: undefined
      }

      this.handleClick = function() {
        Auth.signin(this.user);
      }

      this.handleGoTo = function() {
        $rootScope.showWelcomeMessage = false;
        $rootScope.showSignUp = true;
        $rootScope.showSignIn = false;
      }
    }
  });
;
angular.module('signUpForm', []);

angular.
  module('signUpForm').
  component('signUpForm', {
    template:
    `
    <md-card id="signup" class="landingCard" layout-margin>
      <h2>Sign Up for your free account!</h2>

      <form name="signUnForm" ng-submit="">

        <div layout="row">
          <md-input-container flex='100'>
            <label>User Name</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">account_circle</md-icon>
            <input ng-model="$ctrl.user.username" ng-required="true">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Email</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">mail</md-icon>
            <input type="email" ng-model="$ctrl.user.email" ng-required="true">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Profile Picture</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">link</md-icon>
            <input type="url" ng-model="$ctrl.user.profilePic" ng-required="false">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>City</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>
            <input ng-model="$ctrl.user.city" ng-required="false">
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100' style="margin-bottom:24px">
            <label>State</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">location_city</md-icon>
            <md-select ng-model="$ctrl.user.state">
              <md-option ng-repeat="state in $ctrl.states" value="{{state}}">
                {{state}}
              </md-option>
            </md-select>
          </md-input-container>
        </div>

        <div layout="row">
          <md-input-container flex='100'>
            <label>Password</label>
            <md-icon class="material-icons" style="color:rgb(0,150,136)">lock</md-icon>
            <input ng-model="$ctrl.user.password" ng-required="true" type="password">
          </md-input-container>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleClick()" class="md-raised md-primary">Sign Up</md-button>
        </div>

        <div layout="row">
          <md-button flex='100' ng-click="$ctrl.handleGoTo()" class="md-primary">I already have an account...</md-button>
        </div>
      </form>
    </md-card>
    `,
    controller: function($rootScope, Auth) {
      this.states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY"]

      this.user = {
        username: undefined,
        password: undefined,
        profilePic: undefined,
        email: undefined,
        city: undefined,
        state: undefined
      }

      this.handleClick = function() {
        Auth.register(this.user);
      }

      this.handleGoTo = function() {
        $rootScope.showWelcomeMessage = false;
        $rootScope.showSignUp = false;
        $rootScope.showSignIn = true;
      }
    }
  });
;
angular.module('app.services', [])

.factory('Companies', function($http) {
	return {
		getInfo: function(companyUrl) {
			return $http({
				method: 'GET',
				url: '/api/companyInfo?',
				params: {
					domain: companyUrl
				}
			})
			.then(function(res) {
				console.log('this is res form database: ', res.data);
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		}
  }
})
.factory('GoogleMap', function($http) {
	return {
		getLocationCode: function(address) {
			console.log('This is the address: ', address);
			return $http({
				method: 'POST',
				url: '/api/companyMap',
				data: {data: address}
			})
			.then(function(res) {
				console.log('this is res CODE form GoogleMapApi: ', res.data.results[0].geometry.location);
				return res.data.results[0].geometry.location;

			})
			.catch(function(err) {
				console.log(err)
			})
		},

		getAddress: function(latlngCode) {
			console.log('This is the latlngCode: ', latlngCode);
			return $http({
				method: 'POST',
				url: '/api/addressMap',
				data: {data: latlngCode}
			})
			.then(function(res) {
				console.log('this is res ADDRESS from GoogleMapApi: ', res.data.results[1].formatted_address);
				return res.data.results[1].formatted_address;
			})
			.catch(function(err) {
				console.log(err);
			})
		},

		getDirectionData: function(origin, destination, mode ) {
			console.log('WWWWWWWWWWWWWWWWWWWWWW', origin, destination, mode);
			return $http({
				method: 'POST',
				url: '/api/directionData',
				data: {
					origin: origin,
					destination: destination,
					mode: mode
				}
			})
			.then(function(res) {
				//console.log('this is res DIRECTIONDATA from GoogleMapApi: ', res.data.routes[0].legs[0]);
				var directionDatas = {
					distance: res.data.routes[0].legs[0].distance.text,
					duration: res.data.routes[0].legs[0].duration.text,
					mode: mode
				}
				return directionDatas;
			})
			.catch(function(err) {
				console.log(err);
			})
		}

  }
})
.factory('News', ($http) => {
  var getNews = companiesArray => {
    return Promise.all(companiesArray.map(comp => {
      return $http.get('/api/news/?company='+comp)
    }))
    //based on number of companies, determine how many articles per company to include:
    .then(data=>{
      var companies = data.length;
      if(companies>4){
        return data.map(com => com.data.value[0]).reduce((a,b)=>a.concat(b))
      } else if(companies>1){
        return data.map(com=> [com.data.value[0], com.data.value[1]]).reduce((a,b)=>a.concat(b))
      } else if(companies === 1) {
        return data.map(com=> [com.data.value[0], com.data.value[1],com.data.value[2],com.data.value[3]]).reduce((a,b)=>a.concat(b))
      }
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  return {
    getNews: getNews
  }
})

.factory('User', function($http) {
	return {
		getAllData: function() {
			return $http({
				method: 'GET',
				url: 'api/users',
			})
			.then(function(res) {
				console.log('user data: ', res.data);
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		changeData: function(data) {

			return $http({
				method: 'PATCH',
				url: 'api/users',
				data: data
			})
			.then(function(res) {
				console.log('user data: ', res.data);
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function() {
			return $http({
				method: 'DELETE',
				url: 'api/users'
			})
			.then(function(res) {
				return res.data;
			})
		},
		getCompanies: function() {
			return $http({
				method: 'GET',
				url: 'api/companies'
			})
			.then(function(res) {
				console.log('companies', res.data);
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		}
	}
})

.factory('Jobs', function($http) {
	return {
		create: function(data) {
			return $http({
				method: 'POST',
				url: 'api/jobs',
				data: data
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		get: function() {
			return $http({
				method: 'GET',
				url: 'api/jobs',
			})
			.then(function(res) {
				console.log("jobs: ", res.data);
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		update: function(jobData) {
			return $http({
				method: 'PATCH',
				url: 'api/jobs',
				data: jobData,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function(jobData) {
			return $http({
				method: 'DELETE',
				url: 'api/jobs',
				data: jobData,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
		}
	}
})

.factory('Tasks', function($http) {
	return {
		create: function(data) {
			return $http({
				method: 'POST',
				url: 'api/tasks',
				data: data
			})
			.then(function(res) {
				console.log('inside tasks', res);
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		get: function() {
			return $http({
				method: 'GET',
				url: 'api/tasks',
			})
			.then(function(res) {
				console.log('tasks: ', res.data);
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		update: function(data) {
			return $http({
				method: 'PATCH',
				url: 'api/tasks',
				data: data,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
			.catch(function(err) {
				console.log(err)
			})
		},
		delete: function(data) {
			return $http({
				method: 'DELETE',
				url: 'api/tasks',
				data: data,
				headers: {
					'Content-type': 'application/json;charset=utf-8'
				}
			})
			.then(function(res) {
				return res.data
			})
		}
	}
})
.factory('Auth', ($http, $location) => {

  var register = (user) => {
    $http.post('/api/register', JSON.stringify(user))
    .then(res => {
      $location.path('/dashboard')
    }, res => {
      $location.path('/')
      alert(res.data.err.message)
    })
  };

  var signin = (user) => {
    $http.post('/api/login', JSON.stringify(user))
    .then(res => {
      $location.path('/dashboard')
    }, res => {
      $location.path('/')
      alert(res.data.err.message)
    })
  };

  var logout = () => {
    $http.get('/api/logout');
  }

  // Use API to backend to check if user is logged in and session exists
  var status = ($rootScope, $location, $http) => {
    $rootScope.$on('$routeChangeStart', function (evt, next, current) {
      $http.get('/api/status').then(function(data){
        if(next.$$route && !data.data.status){
          $location.path('/');
        }
      })
    })
  }

  return {
    register: register,
    signin: signin,
    logout: logout,
    status: status
  }
})
.factory('Tone', function($http) {
	console.log('Inside tone factory')
	return {
		analyzeTone: function(data) {
			return $http({
				method: 'POST',
				url: '/api/tone',
				data: data
			})
			.then(function(res) {
				console.log('tone response', res.data);
				return res.data;
			})
			.catch(function(err) {
				console.log(err)
			})
		}
  }
})
