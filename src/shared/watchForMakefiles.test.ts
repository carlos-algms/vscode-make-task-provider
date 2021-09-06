import sinon from 'sinon';
import vscode from 'vscode';

import watchForMakefiles from './watchForMakefiles';

describe.only('Watch for Makefiles', () => {
  let onDidChangeConfigurationStub: sinon.SinonStub;
  let createFileSystemWatcherStub: sinon.SinonStub<any[], vscode.FileSystemWatcher>;
  let configListener: (e: vscode.ConfigurationChangeEvent) => any;
  let onDidChangeConfigurationDisposableStub: sinon.SinonSpy;

  const changeEvent: vscode.ConfigurationChangeEvent = {
    affectsConfiguration: sinon.spy(() => true),
  };

  beforeEach(() => {
    onDidChangeConfigurationStub = sinon.stub(vscode.workspace, 'onDidChangeConfiguration');
    onDidChangeConfigurationStub.callsFake((c: () => any) => {
      configListener = c;
      onDidChangeConfigurationDisposableStub = sinon.spy();
      return { dispose: onDidChangeConfigurationDisposableStub };
    });

    createFileSystemWatcherStub = sinon.stub(vscode.workspace, 'createFileSystemWatcher');
    createFileSystemWatcherStub.onFirstCall().returns(<any>{
      onDidChange: sinon.spy(),
      onDidDelete: sinon.spy(),
      onDidCreate: sinon.spy(),
      dispose: sinon.spy(),
    });
    createFileSystemWatcherStub.onSecondCall().returns(<any>{
      onDidChange: sinon.spy(),
      onDidDelete: sinon.spy(),
      onDidCreate: sinon.spy(),
      dispose: sinon.spy(),
    });
  });

  it('should invoke the callback when the config changes', () => {
    const cb = sinon.spy();

    watchForMakefiles(cb);
    configListener(changeEvent);

    const [firstWatcher, lastWatcher] = createFileSystemWatcherStub.returnValues;

    firstWatcher.dispose.should.have.been.called;
    lastWatcher.dispose.should.not.have.been.called;
    cb.should.have.been.calledOnce;
  });

  it('should dispose internals when disposed', () => {
    const disposable = watchForMakefiles(sinon.spy());

    disposable.dispose();

    const [firstWatcher] = createFileSystemWatcherStub.returnValues;

    firstWatcher.dispose.should.have.been.called;
    onDidChangeConfigurationDisposableStub.should.have.been.called;
  });
});
