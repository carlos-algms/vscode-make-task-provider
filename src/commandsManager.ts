import { Disposable } from 'vscode';
import { runFromCommandPicker } from './runFromCommandPicker';
import TaskDetector from './TaskDetector';
import vscode from 'vscode';

export function commandsManager(detector: TaskDetector): Disposable[] {
  const disposables: Disposable[] = [
    vscode.commands.registerCommand('make.runTarget', () => {
      runFromCommandPicker(detector);
    }),
  ];

  return disposables;
}
