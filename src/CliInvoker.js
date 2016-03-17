import 'babel-polyfill';
import _ from 'lodash';
import FS from 'fs';
import Promise from 'bluebird';
import DefaultConfig from 'config';

import globalOption from 'command-line-boilerplate/lib/GlobalOption';
import globalArg from 'command-line-boilerplate/lib/GlobalArg';
import runCli from 'command-line-boilerplate/lib/CliRunner';

import cli from './Cli';

globalOption('-c, --config [CONFIG]', 'Path to config directory (supports single only)');

// runs the cli
runCli();

const fsPromise = Promise.promisifyAll(FS);

function handleConfigError(error, throwError, directory) {
    if (error && throwError) {
        if (error.code === 'ENOENT') {
            console.error(`>>> No such file or directory at ${directory}`);
        } else if (error.code === 'MODULE_NOT_FOUND') {
            console.error(`>>> Bad module at ${directory} :`, error.message);
        } else {
            console.error(`>>> Module error at ${directory} :`, error);
        }

        // exit process on any error
        process.exit(1);
    }

    return null;
}

const CONFIG_ACCESS_PERMISSION = FS.R_OK;

function validConfig(configPath, throwError) {
    if (!configPath) {
        return null;
    }

    const loadConfigObject = (path) => {
        console.log('Scanning config at: ', path);

        const configDirectory = require.resolve(path);

        console.log('Resolved location to: ', configDirectory);

        return fsPromise.accessAsync(configDirectory, CONFIG_ACCESS_PERMISSION)
          .then(() => require(configDirectory))
          .catch(error => handleConfigError(error, throwError, configDirectory));
    };

    return loadConfigObject(configPath);
}

Promise.resolve(globalArg('config'))
  .then(config => validConfig(config, true))
  .then(config => {
      if (!config) {
          console.error('No config was specified or found');

          process.exit(1);
      }

      // READ config from current location ==> which is default, but can be over-ridden by what exists in indices config
      return cli(_.extend({}, DefaultConfig, config));
  });
