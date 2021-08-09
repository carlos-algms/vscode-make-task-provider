import { platform } from 'os';
import vscode from 'vscode';

import { contributes } from '../../package.json';
import { trackEvent } from '../telemetry/tracking';

import { APP_NAME } from './constants';

const {
  configuration: {
    properties: {
      'make-task-provider.makefileNames': { default: defaultMakefileNames },
    },
  },
} = contributes;

export const CONFIG_KEYS = {
  autoDetect: `${APP_NAME}.autoDetect`,
  makefileNames: `${APP_NAME}.makefileNames`,
  makeExecutable: `${APP_NAME}.${getUserPlatformKey() ?? 'unix.makeExecutable'}`,
};

export const COMMANDS = {
  /**
   * Run a Make target in interactive mode
   * Either by command picker or from menu: Terminal -> Run Task
   */
  runTarget: `${APP_NAME}.runTarget`,

  /**
   * Run a specific target clicked on the tree-view
   */
  runTargetFromTreeView: `${APP_NAME}.runTargetFromTreeView`,

  /**
   * Open a Makefile containing a specific target
   */
  openMakefile: `${APP_NAME}.openMakefile`,

  /**
   * Should invalidate all caches and refresh the tree-view
   */
  refresh: `${APP_NAME}.refresh`,
};

// TODO use common excludes from user config and also provide a custom exclude setting
export const COMMON_EXCLUDES = [
  '**/node_modules',
  '**/.vscode',
  '**/.vscode-test',
  '**/build',
  '**/dist',
  '**/.temp',
  '**/bower_components',
  '**/.git',
  '**/vendor',
].join(',');

export function getFolderConfig(folder?: vscode.WorkspaceFolder): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(APP_NAME, folder?.uri);
}

export function isAutoDetectEnabled(folder?: vscode.WorkspaceFolder): boolean {
  return getFolderConfig(folder).get<boolean>('autoDetect', true);
}

export function getMakeExecutablePath(folder?: vscode.WorkspaceFolder): string {
  const key = getUserPlatformKey();
  let executablePath = 'make';

  if (key) {
    executablePath = getFolderConfig(folder).get<string>(key, '') || executablePath;
  }

  return executablePath;
}

export function getMakefileNames(folder?: vscode.WorkspaceFolder): string[] {
  return getFolderConfig(folder).get<string[]>('makefileNames', defaultMakefileNames);
}

export function getUserPlatformKey(): string | null {
  const userPlatform = platform();

  switch (userPlatform) {
    case 'win32':
      return 'windows.makeExecutable';
    case 'darwin':
      return 'osx.makeExecutable';
    case 'linux':
    case 'openbsd':
    case 'freebsd':
      return 'unix.makeExecutable';
    default:
      trackEvent({
        action: 'Platform not recognized',
        value: userPlatform,
      });
      return null;
  }
}
