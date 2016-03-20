import 'babel-polyfill';
import _ from 'lodash';

import Promise from 'bluebird';
import DefaultConfig from 'config';

import globalOption from 'command-line-boilerplate/lib/GlobalOption';
import globalArg from 'command-line-boilerplate/lib/GlobalArg';
import runCli from 'command-line-boilerplate/lib/CliRunner';

import Server from './Server';

import loadConfig from './ConfigLoader';

globalOption('-c, --config [CONFIG]',
  `Path to config or comma separate configs.
            Can be name of globally installed module or full path to module directory.
            Defaults to:
                1) Current directory - must be a valid node module or have index.js
                2) HUMANE_DISCOVERY_CONFIG environment variable`
);

globalOption('--transliterator [MODULE DIRECTORY]',
  `Path to transliterator plugin.
            Can be name of globally installed plugin module or full path to plugin directory.
            Defaults to: HUMANE_PLUGIN_TRANSLITERATOR environment variable`);

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

function validConfig(pathOrMultiPath, throwError) {
    if (!pathOrMultiPath) {
        return null;
    }

    const multi = /,/.test(pathOrMultiPath);

    if (multi) {
        const paths = _(pathOrMultiPath).split(',').map(path => _.trim(path)).value();
        return Promise.all(_.map(paths, path => loadConfig(path, throwError)));
    }

    return loadConfig(pathOrMultiPath, throwError);

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
  .then(config => !config ? validConfig(process.cwd()) : config)
  .then(config => !config ? validConfig(process.env.HUMANE_DISCOVERY_CONFIG, true) : config)
  .then(config => {
      if (!config) {
          console.error('No config was specified or found');

          process.exit(1);
      }

      const multi = true;

      // start the server here
      const server = new Server(multi, globalArg('port') || process.env.HUMANE_SERVER_PORT || DefaultConfig.HUMANE_SERVER_PORT || '3000');

      if (_.isArray(config)) {
          const configs = _.map(config, con => _.extend({}, DefaultConfig, {transliterator}, con));

          return server.withConfigs(configs).build();
      }

      return server.withConfig(_.extend({}, DefaultConfig, {transliterator}, config)).build();
  });
