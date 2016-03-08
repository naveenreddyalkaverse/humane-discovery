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

import FS from 'fs';
import Promise from 'bluebird';
import DefaultConfig from 'config';

import globalOption from 'cli-boilerplate/lib/GlobalOption';
import globalArg from 'cli-boilerplate/lib/GlobalArg';
import runCli from 'cli-boilerplate/lib/CliRunner';

import main from './Engine';

globalOption('-c, --config [CONFIG]',
  `Path to config directory.
Defaults to:
    1) Current directory - must be a valid node module or have index.js
    2) HUMANE_DISCOVERY_CONFIG environment variable
    3) <your-home>/humane_discovery_config`);

// runs the cli
runCli();

const fsPromise = Promise.promisifyAll(FS);

function validConfig(directory, throwError) {
    if (!directory) {
        return null;
    }

    console.log('Scanning config at: ', directory);

    return fsPromise.accessAsync(directory, FS.R_OK | FS.W_OK)
      .then(() => require(directory)) // link to new location and then make require
      .catch(error => {
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
      });
}

Promise.resolve(globalArg('config'))
  .then(config => validConfig(config, true))
  .then(config => !config ? validConfig(process.cwd()) : config)
  .then(config => !config ? validConfig(process.env.HUMANE_DISCOVERY_CONFIG, true) : config)
  .then(config => !config ? validConfig(`${process.env.HOME}/humane_discovery_config`) : config)
  .then(config => {
      if (!config) {
          console.error('No config was specified or found');

          process.exit(1);
      }

      // READ config from current location ==> which is default, but can be over-ridden by what exists in indices config
      return main({
          indicesConfig: {
              logLevel: config.logLevel || DefaultConfig.logLevel,
              esConfig: config.esConfig || DefaultConfig.esConfig,
              redisConfig: config.redisConfig || DefaultConfig.redisConfig,
              redisSentinelConfig: config.redisSentinelConfig || DefaultConfig.redisSentinelConfig,
              locksConfig: config.locksConfig || DefaultConfig.locksConfig,
              cacheConfig: config.cacheConfig || DefaultConfig.cacheConfig,
              indicesConfig: config.indicesConfig
          },
          searchConfig: {
              logLevel: config.logLevel || DefaultConfig.logLevel,
              esConfig: config.esConfig || DefaultConfig.esConfig,
              redisConfig: config.redisConfig || DefaultConfig.redisConfig,
              redisSentinelConfig: config.redisSentinelConfig || DefaultConfig.redisSentinelConfig,
              searchConfig: config.searchConfig
          },
          cockpitConfig: config.cockpitConfig,
          dataPipelineConfig: config.dataPipelineConfig
      });
  });