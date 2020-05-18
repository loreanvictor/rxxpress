import { should, expect } from 'chai'; should();

import { noop } from '../noop';


describe('noop', () => {
  it('should be an observable without emissions.', done => {
    noop.subscribe(() => done(), undefined, () => done());
  });
});