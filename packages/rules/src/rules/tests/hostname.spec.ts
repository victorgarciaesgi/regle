import { hostname } from '../hostname';

describe('hostname validator', () => {
  it('should validate undefined', () => {
    expect(hostname.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(hostname.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(hostname.exec('')).toBe(true);
  });

  it('should validate localhost', () => {
    expect(hostname.exec('localhost')).toBe(true);
  });

  it('should validate simple domain', () => {
    expect(hostname.exec('example.com')).toBe(true);
  });

  it('should validate subdomain', () => {
    expect(hostname.exec('sub.domain.example.com')).toBe(true);
  });

  it('should validate hostname with hyphen', () => {
    expect(hostname.exec('my-server')).toBe(true);
  });

  it('should not validate hostname starting with hyphen', () => {
    expect(hostname.exec('-invalid.com')).toBe(false);
  });

  it('should not validate hostname ending with hyphen', () => {
    expect(hostname.exec('invalid-.com')).toBe(false);
  });

  it('should not validate double dots', () => {
    expect(hostname.exec('invalid..com')).toBe(false);
  });

  it('should not validate URL with protocol', () => {
    expect(hostname.exec('http://example.com')).toBe(false);
  });
});
