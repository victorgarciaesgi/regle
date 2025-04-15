import { macAddress } from '../macAddress';

describe('macAddress validator', () => {
  it('should validate undefined', () => {
    expect(macAddress().exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(macAddress().exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(macAddress().exec('')).toBe(true);
  });

  it('should validate empty string', () => {
    expect(macAddress.exec('')).toBe(true);
  });

  it('should not validate number', () => {
    expect(macAddress().exec(112233445566 as any)).toBe(false);
  });

  it('should validate zero mac', () => {
    expect(macAddress().exec('00:00:00:00:00:00')).toBe(true);
    expect(macAddress().exec('00:00:00:00:00:00:00:00')).toBe(true);
  });

  it('should validate zero mac', () => {
    expect(macAddress.exec('00:00:00:00:00:00')).toBe(true);
    expect(macAddress.exec('00:00:00:00:00:00:00:00')).toBe(true);
  });

  it('should validate correct mac', () => {
    expect(macAddress().exec('de:ad:be:ef:ba:ad')).toBe(true);
    expect(macAddress().exec('de:ad:be:ef:ba:ad:f0:0d')).toBe(true);
  });

  it('should not validate mac with too many parts', () => {
    expect(macAddress().exec('00:00:00:00:00:00:00')).toBe(false);
    expect(macAddress().exec('00:00:00:00:00:00:00:00:00')).toBe(false);
  });

  it('should not validate mac with not enough parts', () => {
    expect(macAddress().exec('00')).toBe(false);
    expect(macAddress().exec('00:00:00:00:00:00:00')).toBe(false);
  });

  it('should not validate mac with too big numbers', () => {
    expect(macAddress().exec('ff0:123:22:33:44:00')).toBe(false);
    expect(macAddress().exec('ff0:123:22:33:44:00:00:00')).toBe(false);
  });

  it('should not validate mac with single zero', () => {
    expect(macAddress().exec('de:ad:be:ef:0:00')).toBe(false);
    expect(macAddress().exec('de:ad:be:ef:0:00:00:00')).toBe(false);
  });

  it('should not validate mac with negative numbers', () => {
    expect(macAddress().exec('00:11:22:33:44:-5')).toBe(false);
    expect(macAddress().exec('00:11:22:33:44:-5:66:77')).toBe(false);
  });

  it('should not validate mac with bad hex numbers', () => {
    expect(macAddress().exec('he:ll:ow:or:ld:00')).toBe(false);
    expect(macAddress().exec('be:ef:ba:ad:fo:od')).toBe(false);
    expect(macAddress().exec('he:ll:ow:or:ld:00:00:00')).toBe(false);
    expect(macAddress().exec('de:ad:be:ef:ba:ad:fo:od')).toBe(false);
  });

  it('should not validate mac with bad separator', () => {
    expect(macAddress().exec('00;00;00;00;00;00')).toBe(false);
    expect(macAddress().exec('00;00;00;00;00;00;00;00')).toBe(false);
  });

  it('should validate mac with custom separator', () => {
    expect(macAddress(';').exec('00;00;00;00;00;00')).toBe(true);
    expect(macAddress(';').exec('00;00;00;00;00;00;00;00')).toBe(true);
  });

  it('should validate mac with empty separator', () => {
    expect(macAddress('').exec('000000000000')).toBe(true);
    expect(macAddress('').exec('deadbeefdead')).toBe(true);
    expect(macAddress('').exec('00ff00112233')).toBe(true);
    expect(macAddress('').exec('0000000000000000')).toBe(true);
    expect(macAddress('').exec('deadbeefdeadbeef')).toBe(true);
    expect(macAddress('').exec('00ff001122334455')).toBe(true);
  });

  it('should not validate bad mac with empty separator', () => {
    expect(macAddress('').exec('00000000z000')).toBe(false);
    expect(macAddress('').exec('00000000z0000000')).toBe(false);
  });

  it('should not validate too short mac with empty separator', () => {
    expect(macAddress('').exec('00')).toBe(false);
    expect(macAddress('').exec('000000000000000')).toBe(false);
  });

  it('should not validate too long mac with empty separator', () => {
    expect(macAddress('').exec('00000000000000000')).toBe(false);
  });
});
