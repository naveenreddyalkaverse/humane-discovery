import _ from 'lodash';

import Indexer from 'humane-indexer/lib/api/Indexer';

//
// cli specific includes
//
import buildIndexerCli from 'humane-indexer/lib/api/IndexerCliBuilder';
import buildDataPipelineCli from 'humane-indexer/lib/api/DataPipelineCliBuilder';
import currentCommand from 'command-line-boilerplate/lib/CurrentCommand';
import outputHelp from 'command-line-boilerplate/lib/OutputHelp';
import runCli from 'command-line-boilerplate/lib/CliRunner';

export default function (config) {
    const indexerBuilder = () => new Indexer(_.pick(config, [
        'instanceName',
        'indicesConfig',
        'logLevel',
        'esConfig',
        'redisConfig',
        'redisSentinelConfig',
        'locksConfig',
        'cacheConfig'
    ]));

    // specific to the client => show section wise... need to be done for all plugins
    buildIndexerCli(indexerBuilder, config.indicesConfig);

    // specific to the client => show section wise... need to be done for all plugins
    buildDataPipelineCli(indexerBuilder, config.dataPipelineConfig);

    // runs the cli
    runCli(true);

    if (!currentCommand()) {
        // output help
        outputHelp();
    }
}