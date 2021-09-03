import sinon from 'sinon';

import DisposeManager from './DisposeManager';

class TestClass extends DisposeManager {}

describe('Dispose Manager', () => {
  it('should dispose all disposables', () => {
    const instance = new TestClass();

    const disposables = [
      { dispose: sinon.spy() },
      { dispose: sinon.spy() },
      { dispose: sinon.spy() },
    ];

    instance.disposables.push(...disposables);

    instance.dispose();

    disposables.forEach(({ dispose }) => {
      dispose.should.have.been.called;
    });
  });
});
