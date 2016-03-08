import _ from 'lodash';

import Searcher from 'humane-searcher/lib/api/Searcher';
import Indexer from 'humane-indexer/lib/api/Indexer';
import routesBuilder from 'humane-cockpit/lib/app/Routes';

import Path from 'path';
import DefaultConfig from 'config';

//
// cli specific includes
//
import buildServerCli from 'expressjs-boilerplate/lib/server/ServerCliBuilder';
import buildIndexerCli from 'humane-indexer/lib/api/IndexerCliBuilder';
import buildDataPipelineCli from 'humane-indexer/lib/api/DataPipelineCliBuilder';
import globalArg from 'cli-boilerplate/lib/GlobalArg';
import outputHelp from 'cli-boilerplate/lib/OutputHelp';
import runCli from 'cli-boilerplate/lib/CliRunner';

export default function (config) {
    const searcherApiPath = config.multiInstance ? '/:instanceName/searcher/api' : '/searcher/api';
    const indexerApiPath = config.multiInstance ? '/:instanceName/indexer/api' : '/indexer/api';

    const indexerBuilder = () => new Indexer(config.indicesConfig);
    const searcherBuilder = () => new Searcher(config.searchConfig);
    const cockpitPropertiesBuilder = (instanceName) =>
      _.extend({
          instanceName,
          searcherApi: config.multiInstance ? `/${instanceName}/searcher/api` : '/searcher/api'
      }, config.cockpitConfig);

    buildServerCli({
        port: DefaultConfig.get('INDEXER_PORT'),
        api: {
            services: {path: indexerApiPath, api: indexerBuilder}
        }
    }, 'server-indexer', 'Runs indexer server');

    buildServerCli({
        port: DefaultConfig.get('SEARCHER_PORT'),
        api: {
            services: {path: searcherApiPath, api: searcherBuilder}
        }
    }, 'server-searcher', 'Run searcher server');

    buildServerCli({
        port: DefaultConfig.get('COCKPIT_PORT'),
        client: {
            multiInstance: config.multiInstance,
            routes: routesBuilder(),
            properties: cockpitPropertiesBuilder, // properties to be passed to the client
            publicPath: Path.join(__dirname, '../public'),
            resourcesPath: Path.join(__dirname, '../__public__')
        }
    }, 'server-cockpit', 'Runs cockpit server');

    buildServerCli({
        api: {
            services: [
                {path: searcherApiPath, api: searcherBuilder}, // THIS WOULD BE BASIC INSTANCE NAME
                {path: indexerApiPath, api: indexerBuilder} // THIS WOULD BE BASIC INSTANCE NAME
            ]
        },

        client: {
            multiInstance: config.multiInstance,
            routes: routesBuilder(),
            properties: cockpitPropertiesBuilder, // properties to be passed to the client
            publicPath: Path.join(__dirname, '../public'),
            resourcesPath: Path.join(__dirname, '../__public__')
        }
    }, 'server', 'Runs all servers');

    buildIndexerCli(indexerBuilder, config.indicesConfig);

    buildDataPipelineCli(indexerBuilder, config.dataPipelineConfig);

    // runs the cli
    runCli();

    // TODO: handle unknown command case
    if (globalArg('config') && process.argv.length < 5) {
        // output help
        outputHelp();
    }
}