import type { JoinDiscriminatedUnions } from '@regle/core';

describe('type utils', () => {
  it('JoinDiscriminatedUnions should bind unions correctly', () => {
    type Union = { name: string } & (
      | { type: 'ONE'; firstName: string }
      | { type: 'TWO'; firstName: number; lastName: string }
      | { type?: undefined }
    );

    expectTypeOf<JoinDiscriminatedUnions<Union>>().toEqualTypeOf<{
      name: string;
      type?: 'ONE' | 'TWO' | undefined;
      firstName?: string | number | undefined;
      lastName?: string | undefined;
    }>();
  });
});
