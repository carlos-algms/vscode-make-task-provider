import path from 'path';
import vscode from 'vscode';

import { makefileParser } from './makefileParser';

describe('Makefile Parser', () => {
  it('should parse a Makefile', async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      throw new TypeError('No workspace folder open while running tests');
    }

    const makefilePath = path.join(workspaceFolder.uri.path, 'Makefile');

    const targetNames = await makefileParser(makefilePath);

    expect(targetNames).to.eql(['foo', 'build', 'test']);
  });
});
