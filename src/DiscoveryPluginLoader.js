import FS from 'fs';
import Promise from 'bluebird';

/* eslint-disable global-require */

const fsPromise = Promise.promisifyAll(FS);

function handleConfigError(error, throwError, directory) {
    if (error) {
        if (error.code === 'ENOENT') {
            console.error(`>>> ERROR: No such file or directory at ${directory}`);
        } else if (error.code === 'MODULE_NOT_FOUND') {
            if (throwError) {
                console.error(`>>> ERROR: Bad module at ${directory} :`, error.message);
            }
        } else {
            console.error(`>>> ERROR: Module error at ${directory} :`, error);
        }

        if (throwError) {
            // exit process on any error
            process.exit(1);
        }
    }

    return null;
}

function resolve(path) {
    try {
        return require.resolve(path);
    } catch (error) {
        return Promise.reject({code: 'MODULE_NOT_FOUND', message: error.message});
    }
}

const CONFIG_ACCESS_PERMISSION = FS.R_OK;

export default (path, throwError) => {
    console.log('Scanning config at: ', path);

    let configDirectory = null;

    return Promise.resolve(resolve(path))
      .then(directory => {
          configDirectory = directory;
          return fsPromise.accessAsync(configDirectory, CONFIG_ACCESS_PERMISSION);
      })
      .then(() => require(configDirectory))
      .then(config => {
          console.log('Resolved config at: ', configDirectory);
          return config;
      })
      .catch(error => handleConfigError(error, throwError, path));
};