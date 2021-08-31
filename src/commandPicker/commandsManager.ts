import vscode from 'vscode';

import { COMMANDS } from '../shared/config';
import DisposeManager from '../shared/DisposeManager';
import { invalidateTaskCaches } from '../Tasks/taskCaches';
import { trackEvent } from '../telemetry/tracking';

import { runFromCommandPicker } from './runFromCommandPicker';

export class CommandsRegistration extends DisposeManager {
  private refreshEventEmitter = new vscode.EventEmitter();

  /**
   * Event triggered every time the user triggers a refresh command
   */
  readonly onRunRefresh = this.refreshEventEmitter.event;

  constructor() {
    super();

    this.disposables.push(
      this.refreshEventEmitter,

      vscode.commands.registerCommand(COMMANDS.runTarget, () => runFromCommandPicker()),

      vscode.commands.registerCommand(COMMANDS.refresh, () => {
        invalidateTaskCaches();
        this.refreshEventEmitter.fire(null);

        trackEvent({
          action: 'Run Command',
          category: 'Global',
          label: 'Refresh',
        });
      }),
    );
  }
}
