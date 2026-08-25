const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

module.exports = function withWorkManagerResolution(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const rootGradle = path.join(
        cfg.modRequest.projectRoot,
        'android',
        'build.gradle'
      );

      if (!fs.existsSync(rootGradle)) return cfg;

      let text = fs.readFileSync(rootGradle, 'utf8');

      if (!text.includes('// Vega WorkManager dependency alignment')) {
        text += `
        
// Vega WorkManager dependency alignment
allprojects {
  configurations.configureEach {
    resolutionStrategy.eachDependency { details ->
      if (details.requested.group == 'androidx.work' &&
          (details.requested.name == 'work-runtime' ||
           details.requested.name == 'work-runtime-ktx')) {
        details.useVersion('2.8.1')
        details.because('Align WorkManager runtime and KTX versions')
      }
    }
  }
}
`;
        fs.writeFileSync(rootGradle, text, 'utf8');
      }

      return cfg;
    },
  ]);
};
