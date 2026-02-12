import { version } from 'vue';
import { version as piniaVersion } from 'pinia/package.json';

describe('ensure test is correctly configured', () => {
  it('should have correct vue version', () => {
    if (process.env.VUE_VERSION === '3.4') {
      // To be sure the version switching works
      expect(version).toBe('3.4.38');
      expect(piniaVersion).toBe('2.2.5');
    } else {
      // To be sure the version switching works
      expect(version).toBe('3.5.28');
      expect(piniaVersion).toBe('3.0.4');
    }
  });
});
