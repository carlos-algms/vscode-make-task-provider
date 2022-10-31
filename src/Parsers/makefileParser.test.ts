import path from 'path';
import vscode from 'vscode';

import { makeTasksResult } from '../test/examples/case-1/expectedResults';

import { makefileParser } from './makefileParser';

describe('Makefile Parser', () => {
  it('should parse a Makefile', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      throw new TypeError('No workspace folder open while running tests');
    }

    const makefilePath = path.join(workspaceFolder.uri.fsPath, 'Makefile');

    const targetNames = await makefileParser(makefilePath);

    expect(targetNames).to.eql(makeTasksResult);
  });
});
