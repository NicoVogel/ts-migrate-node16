import {migrate} from './migrate.ts';

describe('migrate', () => {
  it('should work', () => {
    expect(migrate()).toEqual('migrate');
  });
});
