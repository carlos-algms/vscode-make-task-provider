import { assert, expect } from 'chai';

describe('Extension Test Suite', () => {
  it('Sample test', () => {
    const v = true;
    v.should.be.equal(true);
    expect(true).to.be.ok;
    assert(true);
  });
});
