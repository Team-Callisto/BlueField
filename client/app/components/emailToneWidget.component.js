angular.module('emailToneWidget', []);

angular.
  module('emailToneWidget').
  component('emailToneWidget', {
    template:
    `
    <md-card>
      <md-card-header>
        <md-card-header-text>
          <md-input-container class="md-block">
            <label>Email to Analyze</label>
            <textarea ng-model="textToAnalyze" rows="10" md-select-on-focus></textarea>
          </md-input-container>
        </md-card-header-text>
      </md-card-header>
      <md-card-actions layout="row" layout-align="end center">
        <md-button ng-click="analyzeText()">Analyze Tone</md-button>
      </md-card-actions>
    </md-card>

    <md-card ng-show="analyzed">
      <md-card-header>
        <md-card-header-text>
          <canvas id="emotionTone" class="chart-horizontal-bar"
            chart-data="[emotionToneData]" chart-labels="emotionToneLabels" >
          </canvas>
          <canvas id="languageTone" class="chart-horizontal-bar"
            chart-data="[languageToneData]" chart-labels="languageToneLabels" >
          </canvas>
          <canvas id="socialTone" class="chart chart-radar"
            chart-data="[socialToneData]" chart-labels="socialToneLabels" >
          </canvas>
        </md-card-header-text>
      </md-card-header>
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
