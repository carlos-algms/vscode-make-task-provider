import vscode, { Disposable } from 'vscode';

import { runFromCommandPicker } from './runFromCommandPicker';
import { APP_NAME } from './shared/constants';
import TaskDetector from './TaskDetector';

export function commandsManager(detector: TaskDetector): Disposable[] {
  const disposables: Disposable[] = [
    vscode.commands.registerCommand(`${APP_NAME}.runTarget`, () => {
      runFromCommandPicker(detector);
    }),
  ];

  return disposables;
}
