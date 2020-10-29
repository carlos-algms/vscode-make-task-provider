import vscode from 'vscode';
import { APP_NAME } from './constants';

export function getFolderConfig(folder: vscode.WorkspaceFolder): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(APP_NAME, folder.uri);
}

export function isAutoDetectEnabled(folder: vscode.WorkspaceFolder): boolean {
  return getFolderConfig(folder).get<boolean>('autoDetect', true);
}
