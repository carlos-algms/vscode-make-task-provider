import vscode from 'vscode';
import { APP_NAME } from './constants';

export const CONFIG_KEYS = {
  autoDetect: `${APP_NAME}.autoDetect`,
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
