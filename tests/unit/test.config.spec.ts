import { version } from 'vue';
import { version as piniaVersion } from 'pinia/package.json';

describe('ensure test is correctly configured', () => {
  it('should have correct vue version', () => {
    expect(version).toBe('3.5.45');
    expect(piniaVersion).toBe('4.1.0');
  });
});
