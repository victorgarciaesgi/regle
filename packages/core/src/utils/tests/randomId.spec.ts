import { randomId } from '../randomId';

describe('randomId', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should generate ids in non-browser environments', () => {
    vi.stubGlobal('window', undefined);
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(randomId()).toBe('500');
  });

  it('should generate ids using window.crypto in browser environments', () => {
    const getRandomValues = vi.fn(() => new Uint32Array([123456]));

    vi.stubGlobal('window', {
      crypto: {
        getRandomValues,
      },
    });

    expect(randomId()).toBe('123456');
    expect(getRandomValues).toHaveBeenCalledOnce();
  });
});
