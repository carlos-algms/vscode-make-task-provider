import vscode from 'vscode';

import { COMMANDS } from '../shared/config';
import DisposeManager from '../shared/DisposeManager';
import { createMakefileTask } from '../Tasks/createMakefileTask';
import { invalidateTaskCaches } from '../Tasks/taskCaches';
import { trackEvent } from '../telemetry/tracking';

import { runFromCommandPicker } from './runFromCommandPicker';

export default class CommandsRegistration extends DisposeManager {
  private refreshEventEmitter = new vscode.EventEmitter();

  /**
   * Event triggered every time the user triggers a refresh command
   */
  readonly onRunRefresh = this.refreshEventEmitter.event;

  constructor() {
    super();

    this.disposables.push(
      this.refreshEventEmitter,
      vscode.commands.registerCommand(COMMANDS.runTarget, this.handleRunTarget),
      vscode.commands.registerCommand(COMMANDS.refresh, this.handleRefresh),
      vscode.commands.registerCommand(COMMANDS.executeTarget, this.handleExecuteTarget),
    );
  }

  handleRunTarget = (): void => {
    runFromCommandPicker();
  };

  handleRefresh = (): void => {
    invalidateTaskCaches();
    this.refreshEventEmitter.fire(null);

    trackEvent({
      action: 'Run Command',
      category: 'Global',
      label: 'Refresh',
    });
  };

  handleExecuteTarget = (targetName: string, makefileUri: vscode.Uri) => {
    const scope = vscode.workspace.getWorkspaceFolder(makefileUri);
    if (!scope) {
      return;
    }

    const task = createMakefileTask(targetName, scope, makefileUri);
    task.group = vscode.TaskGroup.Rebuild;
    vscode.tasks.executeTask(task);
  };
}
