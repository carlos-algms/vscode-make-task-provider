import { workspace, WorkspaceFolder } from 'vscode';
import { APP_NAME } from './constants';

export function isAutoDetectEnabled(folder: WorkspaceFolder): boolean {
  return workspace.getConfiguration(APP_NAME, folder.uri).get<boolean>('autoDetect', true);
}
