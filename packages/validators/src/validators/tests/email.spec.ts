import { email } from '../email';

describe('email validator', () => {
  it('should validate undefined', () => {
    expect(email.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(email.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(email.exec('')).toBe(true);
  });

  it('should not validate numbers', () => {
    expect(email.exec('12345')).toBe(false);
  });

  it('should not validate strings', () => {
    expect(email.exec('asdf12345')).toBe(false);
  });

  it('should not validate space', () => {
    expect(email.exec(' ')).toBe(false);
  });

  it('should not validate incomplete addresses', () => {
    expect(email.exec('someone@')).toBe(false);
    expect(email.exec('someone@gmail')).toBe(false);
    expect(email.exec('someone@gmail.')).toBe(false);
    expect(email.exec('someone@gmail.c')).toBe(false);
    expect(email.exec('gmail.com')).toBe(false);
    expect(email.exec('@gmail.com')).toBe(false);
  });

  it('should not validate addresses that contain unsupported characters', () => {
    expect(email.exec('someone@g~mail.com')).toBe(false);
    expect(email.exec('someone@g=ail.com')).toBe(false);
    expect(email.exec('"someone@gmail.com')).toBe(false);
    expect(email.exec('nonvalid±@gmail.com')).toBe(false);
    expect(email.exec('joão@gmail.com')).toBe(false);
    expect(email.exec('someõne@gmail.com')).toBe(false);
  });

  it('should not validate addresses that contain spaces', () => {
    expect(email.exec('someone@gmail.com ')).toBe(false);
    expect(email.exec('someone@gmail.com    ')).toBe(false);
    expect(email.exec(' someone@gmail.com')).toBe(false);
    expect(email.exec('some one@gmail.com')).toBe(false);
  });

  it('should validate real addresses', () => {
    expect(email.exec('someone@gmail.com')).toBe(true);
    expect(email.exec('someone@g-mail.com')).toBe(true);
    expect(email.exec('some!one@gmail.com')).toBe(true);
    expect(email.exec('soMe12_one@gmail.com')).toBe(true);
    expect(email.exec('someone@gmail.co')).toBe(true);
    expect(email.exec('someone@g.cn')).toBe(true);
    expect(email.exec('someone@g.accountants')).toBe(true);
    expect(email.exec('"some@one"@gmail.com')).toBe(true);
    expect(email.exec('"some one"@gmail.com')).toBe(true);
    expect(email.exec('user.name+tag+sorting@example.com')).toBe(true);
    expect(email.exec('"john..doe"@example.org')).toBe(true);
    expect(email.exec('someone@Example.com')).toBe(true);
  });
});
