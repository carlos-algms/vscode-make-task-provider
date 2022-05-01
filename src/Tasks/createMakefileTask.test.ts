import path from 'path';
import sinon from 'sinon';
import vscode from 'vscode';

import { TYPE } from '../shared/constants';

import { createMakefileTask } from './createMakefileTask';

describe('Create Makefile tasks', () => {
  let workspace: vscode.WorkspaceFolder;
  let makefileUri: vscode.Uri;

  before(() => {
    const [firstWorkspace] = vscode.workspace.workspaceFolders ?? [];

    if (!firstWorkspace) {
      throw new Error('No open workspace while testing');
    }

    workspace = firstWorkspace;
    makefileUri = firstWorkspace.uri.with({
      path: path.join(firstWorkspace.uri.fsPath, 'Makefile'),
    });
  });

  it('should create a task from a string name', () => {
    const name = 'test_name';
    const task = createMakefileTask(name, workspace, makefileUri);

    task.name.should.equal(name);
    expect(task.definition).to.deep.equal(
      {
        type: TYPE,
        targetName: name,
        makeFileRelativePath: 'Makefile',
      },
      'task.definition',
    );
    expect(task.scope).to.equal(workspace, 'task.scope');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { execution }: { execution: vscode.ShellExecution } = <any>task;
    expect(execution).to.be.instanceOf(vscode.ShellExecution);
    expect(execution.command).to.equal('make');
    expect(execution.args).to.deep.equal(['-f', 'Makefile', name]);
  });

  it('should accept a definition as if coming from tasks.json', () => {
    const name = 'test_name_2';
    const fakeDefinition = {
      type: TYPE,
      targetName: name,
      makeFileRelativePath: 'Makefile',
    };
    const task = createMakefileTask(fakeDefinition, workspace, makefileUri);
    expect(task.definition).to.equal(fakeDefinition);
  });

  it('should pass extra arguments when defined on settings', () => {
    const extraArgsMock = ['--extra-arg', '-B'];
    const getConfigurationMocked = sinon.stub(vscode.workspace, 'getConfiguration');

    getConfigurationMocked.onFirstCall().callThrough();
    getConfigurationMocked.onSecondCall().returns({
      get: () => extraArgsMock,
    } as any);
    getConfigurationMocked.callThrough();

    const name = 'test_with_args';
    const task = createMakefileTask(name, workspace, makefileUri);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { execution }: { execution: vscode.ShellExecution } = <any>task;
    expect(execution.command).to.equal('make');
    expect(execution.args).to.deep.equal(['-f', 'Makefile', ...extraArgsMock, name]);
  });

  it('should merge extra arguments from settings and tasks.json', () => {
    const extraArgsMock = ['--extra-unique', '-B'];
    const getConfigurationMocked = sinon.stub(vscode.workspace, 'getConfiguration');

    getConfigurationMocked.onFirstCall().callThrough();
    getConfigurationMocked.onSecondCall().returns({
      get: () => extraArgsMock,
    } as any);
    getConfigurationMocked.callThrough();

    const name = 'test_with_args_merged';
    const fakeDefinition = {
      type: TYPE,
      targetName: name,
      makeFileRelativePath: 'Makefile',
      args: ['--extra-arg', '-B'],
    };

    const task = createMakefileTask(fakeDefinition, workspace, makefileUri);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { execution }: { execution: vscode.ShellExecution } = <any>task;

    expect(execution.args).to.deep.equal(['-f', 'Makefile', ...extraArgsMock, '--extra-arg', name]);
  });
});
