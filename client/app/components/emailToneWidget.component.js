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
        <div class="graphs">
          <div class="graph">
            <h4>Emotion</h4>
            <canvas id="emotionTone" class="chart-horizontal-bar" chart-colors="graphColors.emotionTone"
              chart-data="[emotionToneData]" chart-labels="emotionToneLabels"
              chart-options="options">
            </canvas>
          </div>
          <div class="graph">
            <h4>Language Style</h4>
            <canvas id="languageTone" class="chart-horizontal-bar" chart-colors="graphColors.languageTone"
              chart-data="[languageToneData]" chart-labels="languageToneLabels"
              chart-options="options" chart-colors="colors">
            </canvas>
          </div>
          <div class="graph">
            <h4>Social Tendencies</h4>
            <canvas id="socialTone" class="chart-horizontal-bar" chart-colors="graphColors.socialTone"
              chart-data="[socialToneData]" chart-labels="socialToneLabels"
              chart-options="options">
            </canvas>
          </div>
        </div>
      </md-card-content>
    </md-card>
    `,
    controller: function($scope, Tone) {
      console.log('hello tone widge');

      $scope.graphColors = {
        emotionTone: [{
          backgroundColor: '#086DB2',
          borderWidth: 0
        }],
        languageTone: [{
          backgroundColor: '#274b5f',
          borderWidth: 0
        }],
        socialTone: [{
          backgroundColor: '#1cb4a0',
          borderWidth: 0
        }]
      }

      $scope.options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            xAxes: [{
                ticks: {
                    max: 1,
                    min: 0,
                    stepSize: 0.25
                }
            }]
        }
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
    }
  });
