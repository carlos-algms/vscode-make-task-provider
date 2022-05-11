import sinon from 'sinon';
import vscode from 'vscode';

import { COMMANDS } from '../shared/config';

import CommandsRegistration from './CommandsRegistration';

describe('Commands Registration', () => {
  let registerCommandMocked: sinon.SinonStub;

  beforeEach(() => {
    registerCommandMocked = sinon.stub(vscode.commands, 'registerCommand');
  });

  it('should properly register the commands', () => {
    const instance = new CommandsRegistration();

    instance.disposables.should.have.length(4);

    registerCommandMocked.should.have.callCount(3);
    registerCommandMocked.should.have.been.calledWith(COMMANDS.runTarget, instance.handleRunTarget);
    registerCommandMocked.should.have.been.calledWith(COMMANDS.refresh, instance.handleRefresh);
    registerCommandMocked.should.have.been.calledWith(
      COMMANDS.executeTarget,
      instance.handleExecuteTarget,
    );
  });

  it('should fire the refresh Event', () => {
    const instance = new CommandsRegistration();

    const spy = sinon.spy();
    instance.onRunRefresh(spy);

    instance.handleRefresh();
    expect(spy).to.have.been.calledOnce;
  });
});
