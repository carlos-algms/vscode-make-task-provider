import { platform } from 'os';
import vscode from 'vscode';

import { trackEvent } from '../telemetry/tracking';

import { APP_NAME, DEFAULT_MAKEFILE_NAMES } from './constants';

export const CONFIG_KEYS = {
  autoDetect: `${APP_NAME}.autoDetect`,
  makefileNames: `${APP_NAME}.makefileNames`,
  makeExecutable: `${APP_NAME}.${getUserPlatformKey() ?? 'unix.makeExecutable'}`,
  telemetry: `${APP_NAME}.telemetry`,
};

export const COMMANDS = {
  /**
   * Run a Make target when the user run `Make: run target` from the command pallet
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

export function getFolderConfig(scope?: vscode.ConfigurationScope): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(APP_NAME, scope);
}

export function isAutoDetectEnabled(scope?: vscode.ConfigurationScope): boolean {
  return getFolderConfig(scope).get<boolean>('autoDetect', true);
}

export function getMakeExecutablePath(scope?: vscode.ConfigurationScope): string {
  const key = getUserPlatformKey();
  let executablePath = 'make';

  if (key) {
    executablePath = getFolderConfig(scope).get<string>(key, '') || executablePath;
  }

  return executablePath;
}

export function getMakefileNames(scope?: vscode.ConfigurationScope): string[] {
  return getFolderConfig(scope).get<string[]>('makefileNames', DEFAULT_MAKEFILE_NAMES);
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
