import path from 'path';
import vscode from 'vscode';

import { filterUniqueUris, findFilesInFolder, getFileRelativePath } from './workspaceFiles';

describe('Workspace Files Utils', () => {
  it('should find files', async () => {
    const uris = await findFilesInFolder(<any>vscode.workspace.workspaceFolders?.[0], '*.c');
    uris.should.have.length(1);

    const [file] = uris;

    file.fsPath.endsWith('foo.c').should.be.true;
  });

  it('should return empty array when no files found', async () => {
    const uris = await findFilesInFolder(<any>vscode.workspace.workspaceFolders?.[0], 'not-find');
    uris.should.have.length(0);
  });

  it('should filter unique Uris', () => {
    const file1 = path.normalize('/a/b/file-1.txt');
    const file2 = path.normalize('/a/b/file-2.txt');

    const uris = [vscode.Uri.file(file1), vscode.Uri.file(file2), vscode.Uri.file(file1)];

    const filtered = filterUniqueUris(uris);

    filtered.should.have.length(2);
    filtered.map((uri) => uri.fsPath).should.be.eql([file1, file2]);
  });

  it('should return the relative path', () => {
    const folder = '/a/b/c';

    const relative1 = 'file1.txt';
    const relative2 = 'd/e/f/file2.txt';

    const file1 = `${folder}/${relative1}`;
    const file2 = `${folder}/${relative2}`;

    getFileRelativePath(file1, folder).should.equal(relative1);
    getFileRelativePath(file2, folder).should.equal(relative2);
  });
});
