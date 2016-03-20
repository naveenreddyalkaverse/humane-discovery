# Humane Discovery [1.0.2](https://www.npmjs.com/package/humane-discovery)
Humane Discovery product stack aims to solve entire discovery problem space for content (such as exams, jobs), news & media, e-commerce, digital goods products etc. More specifically product approaches the discovery problem in 3 broad parts --

- Search based discovery, such as autocomplete, suggested queries, search results, instance searches.
- Personalised discovery such as recommended products (or posts). 
- Curated discovery such as curated collections or products.
- Domain specific discovery algorithms such as news one may have missed since last visit.

We call the lowest unit that can be searched, personalised or curated a **'Product'**. These can be any of the following --
- Banners
- Tabs
- Categories
- E-commerce Products
- Digital Products such as e-books, PDFs
- Posts such as News, Articles
- Blog or Articles
- Discounts
- Offers
- Delivery Slots
- Collections
 
## Search based discovery
- APIs for 
  - Autocomplete, 
  - Suggested Queries, 
  - Search Results, 
  - Instance Search (Search As You Type).
- Excellent support for fuzzy queries, and vernacular queries.
- Easy synonyms management (add, update, & remove) without worrying about re-indexing as product takes care of re-indexing or query-expansion itself.
- Match relevancy algorithm that considers
  - Some fields are more important than others.
  - Matches in single field are better than matches in two separate fields.
  - Phrase matches are better than single field matches.
  - Single field matches in lower weight field are better than matches in two different higher weight field. 
- Product's weight auto-computation from disparate type of signals - views, downloads, add to cart, cart abandonment, purchases, time spent, or any custom events.
- Multiple ways to compute weight --
  - Weighted signals based weight.
  - Holt Winter's based trend forecast weight.

## Personalised discovery [Not Yet Open Sourced]
- Personalises entire experience based on user profile, past behavior, and geo-location, such as --
  - Banners
  - Tabs
  - Categories
  - E-commerce Products
  - Digital Products such as e-books, PDFs
  - Posts such as News, Articles
  - Blogs or Articles
  - Discounts
  - Offers
  - Delivery Slots
  - Collections
- Auto learns user preferences based on implicit behaviors.
- Auto A/B tests new products to learn user preferences.
- Careful mix of recommendations, curated, A/B test products.
- Collaborative filtering based discovery algorithms, such as people who bought (or any other signal) X also bought (or any other signal)

## Curated discovery [Not Yet Open Sourced]
- Hand or community curated products or their collections.

## Domain specific discovery algorithms [Not Yet Open Sourced]
- Many domain specific discovery algorithms, such as --
  - News one may have missed since last visit.
  - Popular Products
  - Trending Products
- Custom algorithms can be composed in functional style.

-----------------------------------------------

## Data Pipeline
- A very powerful data pipeline that can import data from variety of sources --
  - CSV Files
  - TSV Files
  - JSON Files
  - Array of JSON
- Transform or multiplex data through JS functions.
- Extend data with lookups & mapper
- Output data to Indexer, as of now (more to come).

-----------------------------------------------

## How to Install
While there are other ways to install, we recommend to install humane-discovery as global npm module

```sh
npm install -g humane-discovery
```

## How to Run
Humane-discovery has two commands - one for cli, another for server

### Running Server
Server runs the searcher and indexer API services and cockpit UI.

```sh
humane-server --config <config> --port [PORT] --transliterator [transliterator module]
```

Below are details on various options -

```
config           - Path to config or comma separate configs.
                   Can be name of globally installed module or full path to module directory.
                   Defaults to:
                       1) Current directory - must be a valid node module or have index.js
                       2) HUMANE_DISCOVERY_CONFIG environment variable
                       
transliterator   - Path to transliterator plugin (optional).
                   Can be name of globally installed plugin module or full path to plugin directory.
                   Defaults to: HUMANE_PLUGIN_TRANSLITERATOR environment variable
                   
port             - Server Port. Defaults to: 3000                   
```                 

### Running Cli
CLI provides various utility commands for managing indexes - such as adding (or removing) index, add (or update, delete, upsert) data, import data into index through data pipeline.

```sh
humane-cli --config <config>
```

Below are details on various options.

```
config           - Path to config or comma separate configs.
                   Can be name of globally installed module or full path to module directory.
                   Defaults to:
                       1) Current directory - must be a valid node module or have index.js
                       2) HUMANE_DISCOVERY_CONFIG environment variable
```    

CLI is a meta-cli, that is CLI generates another CLI based on provided config. This way commands are specific to the configured indexes, types, data pipeline. Below is such a sample CLI.

![Sample CLI](/docs/assets/SAMPLE_CLI_DH.png "Sample CLI")

## How to Configure

1. Create a new npm module for the configuration.
2. Add dependency on humane-indexer
```sh
npm install --save humane-indexer
```
3. Create IndicesConfig.js, SearchConfig.js, and CockpitConfig.js - refer below for details    
    - [Indexer Configuration](https://github.com/360fy/humane-indexer)
    - [Search Configuration](https://github.com/360fy/humane-searcher)
    - [Cockpit Configuration](https://github.com/360fy/humane-cockpit)
4. You can optionally define DataPipelineConfig.js - refer [Indexer Configuration](https://github.com/360fy/humane-indexer) for details.
5. Create a index.js file.
6. Export following from index.js
    - name of the instance (say ```exams```) as ```instanceName```
    - IndicesConfig.js as ```indicesConfig```
    - SearchConfig.js as ```searchConfig```
    - CockpitConfig.js as ```cockpitConfig```
    - DataPipelineConfig.js as ```dataPipelineConfig```

    ```js
    exports.instanceName = 'exams';
    exports.dataPipelineConfig = require('./DataPipelineConfig.js');
    exports.indicesConfig = require('./IndicesConfig.js');
    exports.searchConfig = requure('./SearchConfig.js');
    exports.cockpitConfig = require('./CockpitConfig.js');
    ```       
7. In package.json specify this as 'main': 
```json
"main": "./lib/index.js"
```
8. If you use ES6, ```main``` should refer to babel compiled code for es5. Use following babel presets -
```json
    "babel": {
        "plugins": [
            "transform-runtime"
        ],
        "presets": [
            "es2015"
        ]
    }
```  

## API Documentation
- [Indexer APIs](https://github.com/360fy/humane-indexer)
- [Search APIs](https://github.com/360fy/humane-searcher)
