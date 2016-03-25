import 'babel-polyfill';
import _ from 'lodash';
import Path from 'path';
import Promise from 'bluebird';

import Config from 'config-boilerplate/lib/Config';

import globalOption from 'command-line-boilerplate/lib/GlobalOption';
import globalArg from 'command-line-boilerplate/lib/GlobalArg';
import runCli from 'command-line-boilerplate/lib/CliRunner';

import cli from './Cli';

import loadPlugin from './DiscoveryPluginLoader';

globalOption('-c, --config [CONFIG]', 'Path to JSON / YAML based environment configs, such as esConfig, redisConfig etc');

globalOption('-d, --discoveryPlugin [DISCOVERY PLUGIN]',
  `Path to single discovery plugin.
            Can be name of globally installed module or full path to module directory.
            Defaults to:
                1) Current directory - must be a valid node module
                2) HUMANE_PLUGIN_DISCOVERY environment variable`
);

// runs the cli
runCli();

function validDiscoveryPlugin(path, throwError) {
    if (!path) {
        return null;
    }

    return loadPlugin(path, throwError);
}

Promise.resolve(globalArg('discoveryPlugin'))
  .then(plugin => validDiscoveryPlugin(plugin, true))
  .then(plugin => {
      if (!plugin) {
          return validDiscoveryPlugin(process.cwd());
      }

      return plugin;
  })
  .then(plugin => {
      if (!plugin) {
          return validDiscoveryPlugin(process.env.HUMANE_PLUGIN_DISCOVERY, true);
      }

      return plugin;
  })
  .then(plugin => {
      if (!plugin) {
          console.error('No plugin was specified or found');
          process.exit(1);
      }

      const defaultConfig = globalArg('config')
        ? new Config('default', globalArg('config'), Path.join(__dirname, '..', 'config'))
        : new Config('default', Path.join(__dirname, '..', 'config'));

      return cli(_.extend({}, defaultConfig, plugin));
  });
