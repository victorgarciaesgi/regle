import { defineRegleConfig, useRegle } from '@regle/core';
import { url } from '../url';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { applyIf, withMessage } from '../..';

describe('url exec', () => {
  it('should validate empty string', () => {
    expect(url.exec('')).toBe(true);
  });

  const correctUrls = [
    'http://foo.com/blah_blah',
    'HTTP://FOO.COM/BLAH_BLAH',
    'HTTP://FOO.COM/blah_blah',
    'http://foo.com/blah_blah/',
    /** domains ending with a dot at the end are valid, {@see http://www.dns-sd.org/trailingdotsindomainnames.html} */
    'http://www.foo.bar./',
    'http://www.foo.bar.',
    'http://foo.bar.',
    'http://foo.bar./',
    'http://foo.com/blah_blah_(wikipedia)',
    'http://foo.com/blah_blah_(wikipedia)_(again)',
    'http://www.example.com/wpstyle/?p=364',
    'https://www.example.com/foo/?bar=baz&inga=42&quux',
    'http://✪df.ws/123',
    'http://userid:password@example.com:8080',
    'http://userid:password@example.com:8080/',
    'http://userid@example.com',
    'http://userid@example.com/',
    'http://userid@example.com:8080',
    'http://userid@example.com:8080/',
    'http://userid:password@example.com',
    'http://userid:password@example.com/',
    'http://142.42.1.1/',
    'http://142.42.1.1:8080/',
    'http://➡.ws/䨹',
    'http://⌘.ws',
    'http://⌘.ws/',
    'http://foo.com/blah_(wikipedia)#cite-1',
    'http://foo.com/blah_(wikipedia)_blah#cite-1',
    'http://foo.com/unicode_(✪)_in_parens',
    'http://foo.com/(something)?after=parens',
    'http://☺.damowmow.com/',
    'http://code.google.com/events/#&product=browser',
    'http://j.mp',
    'ftp://foo.bar/baz',
    'http://foo.bar/?q=Test%20URL-encoded%20stuff',
    'http://مثال.إختبار',
    'http://例子.测试',
    'http://उदाहरण.परीक्षा',
    "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
    'http://1337.net',
    'http://a.b-c.de',
    'http://223.255.255.254',
  ];
  const incorrectUrls = [
    'http://',
    'http://.',
    'http://..',
    'http://../',
    'http://?',
    'http://??',
    'http://??/',
    'http://#',
    'http://##',
    'http://##/',
    'http://foo.bar?q=Spaces should be encoded',
    '//',
    '//a',
    '///a',
    '///',
    'http:///a',
    'foo.com',
    'rdar://1234',
    'h://test',
    'http:// shouldfail.com',
    ':// should fail',
    'http://foo.bar/foo(bar)baz quux',
    'ftps://foo.bar/',
    'http://-error-.invalid/',
    'http://-a.b.co',
    'http://a.b-.co',
    'http://0.0.0.0',
    'http://10.1.1.0',
    'http://10.1.1.255',
    'http://224.1.1.1',
    'http://1.1.1.1.1',
    'http://123.123.123',
    'http://3628126748',
    'http://.www.foo.bar/',
    'http://.www.foo.bar./',
  ];

  it.each(correctUrls)('should validate correct url %s', (urlString) => {
    expect(url.exec(urlString)).toBe(true);
  });

  it.each(incorrectUrls)('should not validate incorrect url %s', (urlString) => {
    expect(url.exec(urlString)).toBe(false);
  });

  it('should work with protocol option', () => {
    expect(url({ protocol: /^https?$/ }).exec('http://example.com')).toBe(true);
    expect(url({ protocol: /^https?$/ }).exec('https://example.com')).toBe(true);
    expect(url({ protocol: /^https?$/ }).exec('ftp://example.com')).toBe(false);
    expect(url({ protocol: /^https?$/ }).exec('mailto:test@example.com')).toBe(false);

    expect(url({ protocol: /^ftp$/ }).exec('http://example.com')).toBe(false);
    expect(url({ protocol: /^ftp$/ }).exec('https://example.com')).toBe(false);
    expect(url({ protocol: /^ftp$/ }).exec('ftp://example.com')).toBe(true);
    expect(url({ protocol: /^ftp$/ }).exec('mailto:test@example.com')).toBe(false);
  });
});

describe('url on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '', foo: '' }, { name: { url }, foo: { url: applyIf(() => true, url) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'notaurl';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be a valid URL']);

    vm.r$.name.$value = 'http://example.com';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'notaurl';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value must be a valid URL']);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = null as any;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});

describe('url on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          url: withMessage(url, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
