import sinon from 'sinon';
import vscode from 'vscode';

import { runFromCommandPicker } from './runFromCommandPicker';

describe('Run from command picker', () => {
  it('should show a message when no targets were found', async () => {
    const showInformationMessageMocked = sinon.stub(vscode.window, 'showInformationMessage');
    const fetchTasksMocked = sinon.stub(vscode.tasks, 'fetchTasks');
    fetchTasksMocked.returns(Promise.resolve([]));

    await runFromCommandPicker();

    fetchTasksMocked.should.have.been.called;
    showInformationMessageMocked.should.have.been.called;
  });

  it('should execute the task when the user Select it', async () => {
    const target = {
      label: 'Test label',
    };

    const fetchTasksMocked = sinon.stub(vscode.tasks, 'fetchTasks');
    fetchTasksMocked.returns(Promise.resolve([target as any]));

    const executeTaskMocked = sinon.stub(vscode.tasks, 'executeTask');
    const showQuickPickMocked = sinon.stub(vscode.window, 'showQuickPick');
    showQuickPickMocked.returns(Promise.resolve(undefined));
    await runFromCommandPicker();

    executeTaskMocked.should.not.have.been.called;

    showQuickPickMocked.callsFake(async (args) => Promise.resolve((await args)[0]));
    await runFromCommandPicker();

    executeTaskMocked.should.have.been.calledWith(target);
  });
});
