import vscode from 'vscode';

import { commandsManager } from './commandsManager';
import TaskDetector from './TaskDetector';

export function activate(context: vscode.ExtensionContext): void {
  const detector = new TaskDetector();
  detector.start();

  context.subscriptions.push(detector, ...commandsManager(detector));
}

export function deactivate(): void {}
