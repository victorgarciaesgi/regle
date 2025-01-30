import { version } from 'vue';

describe('ensure test is correctly configured', () => {
  it('should have correct vue version', () => {
    if (process.env.VUE_VERSION === '3.4') {
      // To be sure the version switching works
      expect(version).toBe('3.4.38');
    } else {
      // To be sure the version switching works
      expect(version).toBe('3.5.13');
    }
  });
});
