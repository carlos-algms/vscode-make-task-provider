import vscode from 'vscode';

import { CONFIG_KEYS, getMakefileNames } from './config';

function getNewFileWatcher(callback: () => any): vscode.FileSystemWatcher {
  const makefileNames = getMakefileNames();
  const glob = `**/{${makefileNames.join(',')}}`;

  const watcher = vscode.workspace.createFileSystemWatcher(glob);

  watcher.onDidChange(callback);
  watcher.onDidDelete(callback);
  watcher.onDidCreate(callback);

  return watcher;
}

export default function watchForMakefiles(callback: () => any): DisposeLike {
  let watcher: vscode.FileSystemWatcher | undefined;
  let configChangeListener: vscode.Disposable | undefined;

  if (vscode.workspace.workspaceFolders) {
    watcher = getNewFileWatcher(callback);

    configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_KEYS.makefileNames)) {
        watcher?.dispose();
        watcher = getNewFileWatcher(callback);
        callback();
      }
    });
  }

  return {
    dispose() {
      watcher?.dispose();
      configChangeListener?.dispose();
    },
  };
}
