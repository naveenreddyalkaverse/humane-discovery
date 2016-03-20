import 'babel-polyfill';
import _ from 'lodash';
import Promise from 'bluebird';
import DefaultConfig from 'config';

import globalOption from 'command-line-boilerplate/lib/GlobalOption';
import globalArg from 'command-line-boilerplate/lib/GlobalArg';
import runCli from 'command-line-boilerplate/lib/CliRunner';

import cli from './Cli';

import loadConfig from './ConfigLoader';

globalOption('-c, --config [CONFIG]',
  `Path to config.
            Can be name of globally installed module or full path to module directory.
            Defaults to:
                1) Current directory - must be a valid node module or have index.js
                2) HUMANE_DISCOVERY_CONFIG environment variable`
);

// runs the cli
runCli();

function validConfig(configPath, throwError) {
    if (!configPath) {
        return null;
    }

    return loadConfig(configPath, throwError);
}

Promise.resolve(globalArg('config'))
  .then(config => validConfig(config, true))
  .then(config => !config ? validConfig(process.cwd()) : config)
  .then(config => !config ? validConfig(process.env.HUMANE_DISCOVERY_CONFIG, true) : config)
  .then(config => {
      if (!config) {
          console.error('No config was specified or found');
          process.exit(1);
      }

      // READ config from current location ==> which is default, but can be over-ridden by what exists in indices config
      return cli(_.extend({}, DefaultConfig, config));
  });
