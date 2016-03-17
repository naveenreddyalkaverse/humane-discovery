import _ from 'lodash';
import {EventEmitter} from 'events';
import {Map as immutableMap} from 'immutable';

import Searcher from 'humane-searcher/lib/api/Searcher';
import Indexer from 'humane-indexer/lib/api/Indexer';
import routesBuilder from 'humane-cockpit/lib/app/Routes';

import Path from 'path';

//
// cli specific includes
//
import buildServer from 'expressjs-boilerplate/lib/server/Server';

const INDICES_CONFIG_FIELDS = [
    'instanceName',
    'indicesConfig',
    'logLevel',
    'esConfig',
    'redisConfig',
    'redisSentinelConfig',
    'locksConfig',
    'cacheConfig'
];

const SEARCH_CONFIG_FIELDS = [
    'instanceName',
    'searchConfig',
    'transliterator',
    'logLevel',
    'esConfig',
    'redisConfig',
    'redisSentinelConfig',
    'locksConfig',
    'cacheConfig'
];

export default class Server {
    constructor(multiInstance, port) {
        this.multiInstance = multiInstance;
        this.port = port;
        this.configs = {};
        this.indexers = {};
        this.searchers = {};
        this.services = {};

        this.eventEmitter = new EventEmitter();

        this._built = false;
    }

    withConfig(config) {
        this.addConfig(config);

        return this;
    }

    withConfigs(configs) {
        _.forEach(configs, config => this.addConfig(config));

        return this;
    }

    build() {
        const _this = this;

        function cockpitPropertiesBuilder(params) {
            if (_this.multiInstance) {
                if (!params || !params.instanceName || !_this.configs[params.instanceName]) {
                    throw new Error('No such instance found: ', params);
                }

                const instanceName = params.instanceName;

                return _.extend({
                    multiInstance: _this.multiInstance,
                    instanceName,
                    searcherApi: `/${instanceName}/searcher/api`,
                    cockpitUrlPrefix: `/${instanceName}`
                }, _this.configs[instanceName].cockpitConfig);
            }

            return _.extend({instanceName: 'default', searcherApi: '/searcher/api', cockpitUrlPrefix: ''}, _this.configs.default.cockpitConfig);
        }

        // build indexer, searcher and add them to services

        buildServer({
            port: this.port,

            eventEmitter: this.eventEmitter,

            api: {
                services: _.values(this.services)
            },

            client: {
                multiInstance: this.multiInstance,
                routes: routesBuilder(immutableMap({multiInstance: this.multiInstance})),
                properties: cockpitPropertiesBuilder, // properties to be passed to the client
                publicPath: Path.join(__dirname, '../public'),
                resourcesPath: Path.join(__dirname, '../__public__')
            }
        });

        this._built = true;

        return this;
    }

    addConfig(config) {
        // through event add the config
        if (!this.multiInstance && this.configs.default) {
            console.error('For single instance can not add config more than once: ', config);
            return false;
        }

        const instanceName = this.multiInstance ? config.instanceName : 'default';

        console.log('Instance Name: ', instanceName);

        this.configs[instanceName] = config;

        // build indexer, searcher, and add to server api through event calls
        const searcherApiPath = this.multiInstance ? `/${instanceName}/searcher/api` : '/searcher/api';
        const searcher = this.searchers[instanceName] = new Searcher(_.pick(config, SEARCH_CONFIG_FIELDS));
        this.services[`${instanceName}/searcher`] = {path: searcherApiPath, api: searcher};

        const indexerApiPath = this.multiInstance ? `/${instanceName}/indexer/api` : '/indexer/api';
        const indexer = this.indexers[instanceName] = new Indexer(_.pick(config, INDICES_CONFIG_FIELDS));
        this.services[`${instanceName}/indexer`] = {path: indexerApiPath, api: indexer};

        // emit events
        if (this._built) {
            this.eventEmitter.emit('service.add', this.services[`${instanceName}/searcher`]);
            this.eventEmitter.emit('service.add', this.services[`${instanceName}/indexer`]);
        }

        return true;
    }

    removeConfig(name) {
        // through event remove the config
        if (!this.multiInstance) {
            console.error('For single instance can not remove config: ', name);
            return false;
        }

        // TODO: remove the routes from server, destroy Indexer and Searcher
        return true;
    }

    updateConfig(/*config*/) {
        // TODO: through event update the config
    }
}