import type vscode from 'vscode';
import TaskDetector from './TaskDetector';

let detector: TaskDetector;
export function activate(_context: vscode.ExtensionContext): void {
  detector = new TaskDetector();
  detector.start();
}

export function deactivate(): void {
  detector.dispose();
}
