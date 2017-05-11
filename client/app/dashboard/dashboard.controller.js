angular.module('app.dashboard', [
  'ngMaterial',
  'profileWidget',
  'newsWidget',
  'calendarWidget',
  'jobWidget',
  'tasksWidget',

  'emailToneWidget',
  'chart.js'])
.controller('dashboardController', function dashboardController($http, $scope, Companies, User, Jobs, Tasks, Tone){


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

  $scope.reviews; 
  $scope.queryGlassdoor = function(){
    $http({
      method: "POST",
      url: "/api/glassdoor",
      data : {
        q : $scope.searchGlassdoor
      }
    }).then(function(response){
      console.log(response.data);
      $scope.reviews = response.data;
    })
  }


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

});
