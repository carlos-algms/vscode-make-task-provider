export const APP_NAME = 'make-task-provider';

export const MAKEFILE = 'Makefile';

/**
 * Glob to match `M` or `m` in the file name
 *
 * As suggested in the official {@link https://www.gnu.org/software/make/manual/html_node/Makefile-Names.html Docs},
 * make is case insensitive regarding the default file names.
 */
export const MAKEFILE_GLOB = '{M,m}akefile';

/**
 * Task provider type name
 */
export const TYPE = 'make';
