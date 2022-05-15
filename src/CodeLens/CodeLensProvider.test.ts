import path from 'path';
import vscode from 'vscode';

import { COMMANDS } from '../shared/config';

import { MakefileCodeLensProvider } from './CodeLensProvider';

describe.only('CodeLensProvider', () => {
  let document: vscode.TextDocument;

  beforeEach(async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0] as vscode.WorkspaceFolder;
    const makefileUri = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, 'Makefile'));
    document = await vscode.workspace.openTextDocument(makefileUri);
  });

  it('should return the right instances of Lens', () => {
    const instance = new MakefileCodeLensProvider();
    const lenses = instance.provideCodeLenses(document);

    lenses.should.have.length(3);
    lenses.forEach((lens) => {
      expect(lens).to.be.instanceOf(vscode.CodeLens);
      expect(lens.command).to.exist;
      expect(lens.command?.command).to.equal(COMMANDS.executeTarget);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [command, uri] = lens.command?.arguments ?? [];
      expect(typeof command).to.equal('string');
      expect(uri).to.be.instanceOf(vscode.Uri);
    });
  });
});
