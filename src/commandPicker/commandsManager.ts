import vscode, { ExtensionContext } from 'vscode';
import { APP_NAME } from '../shared/constants';
import { MakefileTaskProvider } from '../Tasks/MakefileTaskProvider';
import { runFromCommandPicker } from './runFromCommandPicker';

export function registerCommands(
  context: ExtensionContext,
  taskProvider: MakefileTaskProvider,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(`${APP_NAME}.runTarget`, () => {
      runFromCommandPicker(taskProvider);
    }),
  );
}
