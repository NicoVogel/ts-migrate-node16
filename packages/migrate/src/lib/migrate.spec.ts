import {describe, it, expect} from 'vitest';

import {migrate} from './migrate.ts';

describe('migrate', () => {
  it('should work', () => {
    expect(migrate()).toEqual('migrate');
  });
});
