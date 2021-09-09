import path from 'path';
import vscode from 'vscode';

import { TYPE } from '../shared/constants';

import { createMakefileTask } from './createMakefileTask';

describe.only('Create Makefile tasks', () => {
  let workspace: vscode.WorkspaceFolder;
  let makefileUri: vscode.Uri;

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
    expect(task.scope).to.equal(workspace, 'task.source');

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

  before(() => {
    const [firstWorkspace] = vscode.workspace.workspaceFolders ?? [];

    if (!firstWorkspace) {
      throw new Error('No open workspace while testing');
    }

    workspace = firstWorkspace;
    makefileUri = firstWorkspace.uri.with({
      path: path.join(firstWorkspace.uri.path, 'Makefile'),
    });
  });
});
