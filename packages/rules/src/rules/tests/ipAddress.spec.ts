import { ipAddress } from '../ipAddress';

describe('ipAddress validator', () => {
  it('should validate undefined', () => {
    expect(ipAddress.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(ipAddress.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(ipAddress.exec('')).toBe(true);
  });

  it('should not validate number', () => {
    expect(ipAddress.exec(123123123123 as any)).toBe(false);
  });

  it('should validate basic loopback', () => {
    expect(ipAddress.exec('127.0.0.1')).toBe(true);
  });

  it('should validate public address 1', () => {
    expect(ipAddress.exec('8.8.8.8')).toBe(true);
  });

  it('should validate public address 2', () => {
    expect(ipAddress.exec('123.41.12.168')).toBe(true);
  });

  it('should validate private address', () => {
    expect(ipAddress.exec('10.0.0.1')).toBe(true);
  });

  it('should validate private address with multiple zeros', () => {
    expect(ipAddress.exec('10.0.0.0')).toBe(true);
  });

  it('should not validate padded loopback', () => {
    expect(ipAddress.exec(' 127.0.0.1 ')).toBe(false);
  });

  it('should not validate nonzero nibbles starting with 0', () => {
    expect(ipAddress.exec('127.0.00.1')).toBe(false);
  });

  it('should not validate not enough nibbles', () => {
    expect(ipAddress.exec('127.0.1')).toBe(false);
  });

  it('should not validate too many nibbles', () => {
    expect(ipAddress.exec('10.0.1.2.3')).toBe(false);
  });

  it('should not validate negatives', () => {
    expect(ipAddress.exec('1.2.3.-4')).toBe(false);
  });

  it('should not validate too big values', () => {
    expect(ipAddress.exec('1.256.3.4')).toBe(false);
  });

  it('should not validate masks', () => {
    expect(ipAddress.exec('10.0.0.1/24')).toBe(false);
  });
});
