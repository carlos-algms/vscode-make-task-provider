import { name, version, contributes } from '../../package.json';

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
