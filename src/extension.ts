import type vscode from 'vscode';
import TaskDetector from './TaskDetector';

let detector: TaskDetector | null;
export function activate(_context: vscode.ExtensionContext): void {
  detector = new TaskDetector();
  detector.start();
}

export function deactivate(): void {
  if (detector) {
    detector.dispose();
  }
  detector = null;
}
