import { name, version, contributes } from '../../package.json';

// TODO find a way of avoid using `contributes`, since it is keeping a huge amount of unused code from package.json
const {
  configuration: {
    properties: {
      'make-task-provider.makefileNames': { default: defaultMakefileNames },
    },
  },
} = contributes;

export const APP_NAME = name;

export const APP_VERSION = version;

export const DEFAULT_MAKEFILE_NAMES = defaultMakefileNames;

export const MAKEFILE = 'Makefile';

/**
 * Task provider type name
 */
export const TYPE = 'make';
