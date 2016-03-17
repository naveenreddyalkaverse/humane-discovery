// --config option
// environment variable
// current directory
// default folder in user's workplace
// default folder in global workplace
// given one of the valid location, setup watcher
// look for changes => if changes, re-load and fire event to re-load: Searcher, Indexer instances
// DataPipelineConfig is for command line, so no reload is required.
// What do we do for CockpitProperties => make them available at a fixed location, implement client logic to fetch it from server.

// watch => changes => compile => fire-event => on success => swap

// in case of multiple plugins, same architecture would hold
// probably we key in indexer, searcher by a name (plugin name)... and that should come in each request
// as new plugin gets registered, we can register more instances of services... some event to create/update routes
// as a plugin gets removed, we remove existing routes
import 'babel-polyfill';
import _ from 'lodash';
import FS from 'fs';
import Promise from 'bluebird';
import DefaultConfig from 'config';

import globalOption from 'command-line-boilerplate/lib/GlobalOption';
import globalArg from 'command-line-boilerplate/lib/GlobalArg';
import runCli from 'command-line-boilerplate/lib/CliRunner';

import Server from './Server';

globalOption('-c, --config [CONFIG]',
  `Path to config directory.
        Defaults to:
            1) Current directory - must be a valid node module or have index.js
            2) HUMANE_DISCOVERY_CONFIG environment variable
            3) <your-home>/humane_discovery_config`);

globalOption('-m, --multi', 'Specifies whether multi instance or single');

globalOption('--transliterator [MODULE DIRECTORY]', 'Specifies transliterator module directory');

globalOption('-p, --port [PORT]', 'Specifies server port');

// runs the cli
runCli();

// TODO: move all code below in global function
const transliteratorPlugin = globalArg('transliterator') || process.env.HUMANE_PLUGIN_TRANSLITERATOR || DefaultConfig.plugins && DefaultConfig.plugins.transliterator;

let transliterator = null;
if (transliteratorPlugin) {
    const Transliterator = require(transliteratorPlugin).default;
    transliterator = new Transliterator();
}

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
        //process.exit(1);
    }

    return null;
}

const CONFIG_ACCESS_PERMISSION = FS.R_OK;

function validConfig(pathOrMultiPath, throwError) {
    if (!pathOrMultiPath) {
        return null;
    }

    const multi = /,/.test(pathOrMultiPath);

    const loadConfigObject = (path) => {
        console.log('Scanning config at: ', path);

        const configDirectory = require.resolve(path);

        console.log('Resolved location to: ', configDirectory);

        return fsPromise.accessAsync(configDirectory, CONFIG_ACCESS_PERMISSION)
          .then(() => require(configDirectory))
          .catch(error => handleConfigError(error, throwError, configDirectory));
    };

    if (multi) {
        const paths = _(pathOrMultiPath).split(',').map(path => _.trim(path)).value();
        return Promise.all(_.map(paths, path => loadConfigObject(path)));
    }

    return loadConfigObject(pathOrMultiPath);

    // before require symlink the module
    //return fsPromise.accessAsync(pathOrMultiPath, CONFIG_ACCESS_PERMISSION)
    //  .then(() => {
    //      if (multi) {
    //          return fsPromise.readdirAsync(pathOrMultiPath)
    //            .then(directories =>
    //              Promise.all(
    //                _(directories)
    //                  .filter(dir => !dir.match(/^\./))
    //                  .map(dir => {
    //                      const fullPath = Path.resolve(pathOrMultiPath, dir);
    //                      console.log('Directory: ', fullPath);
    //
    //                      return fsPromise.accessAsync(fullPath, CONFIG_ACCESS_PERMISSION)
    //                        .then(() => require(fullPath))
    //                        .catch(error => handleConfigError(error, throwError, fullPath));
    //                  })
    //                  .filter(value => !!value)
    //                  .value()
    //              ));
    //      }
    //
    //      return require(pathOrMultiPath);
    //  }) // link to new location and then make require
    //  .catch(error => handleConfigError(error, throwError, pathOrMultiPath));
}

// TODO: setup watcher for config changes
Promise.resolve(globalArg('config'))
  .then(config => validConfig(config, true))
  //.then(config => !config ? validConfig(process.cwd()) : config)
  .then(config => !config ? validConfig(process.env.HUMANE_DISCOVERY_CONFIG, true) : config)

  //.then(config => !config ? validConfig(`${process.env.HOME}/humane_discovery_config`) : config)

  .then(config => {
      if (!config) {
          console.error('No config was specified or found');

          process.exit(1);
      }

      const multi = _.isArray(config) || globalArg('multi');

      // start the server here
      const server = new Server(multi, globalArg('port') || process.env.HUMANE_SERVER_PORT || DefaultConfig.HUMANE_SERVER_PORT || '3000');

      if (_.isArray(config)) {
          const configs = _.map(config, con => _.extend({}, DefaultConfig, {transliterator}, con));

          return server.withConfigs(configs).build();
      }

      return server.withConfig(_.extend({}, DefaultConfig, {transliterator}, config)).build();
  });
