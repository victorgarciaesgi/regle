import { httpUrl } from '../httpUrl';

describe('httpUrl validator', () => {
  it('should validate undefined', () => {
    expect(httpUrl.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(httpUrl.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(httpUrl.exec('')).toBe(true);
  });

  it('should validate http URL', () => {
    expect(httpUrl.exec('http://example.com')).toBe(true);
  });

  it('should validate https URL', () => {
    expect(httpUrl.exec('https://example.com')).toBe(true);
  });

  it('should validate URL with path and query', () => {
    expect(httpUrl.exec('http://example.com:8080/path?query=1')).toBe(true);
  });

  it('should not validate ftp URL', () => {
    expect(httpUrl.exec('ftp://example.com')).toBe(false);
  });

  it('should not validate mailto URL', () => {
    expect(httpUrl.exec('mailto:test@example.com')).toBe(false);
  });

  it('should validate https with custom protocol option', () => {
    expect(httpUrl({ protocol: /^https$/ }).exec('https://example.com')).toBe(true);
  });

  it('should not validate http when https required', () => {
    expect(httpUrl({ protocol: /^https$/ }).exec('http://example.com')).toBe(false);
  });
});
