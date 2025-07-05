const { toHex, cluster, extractColorTokens } = require('../tokenExtractor');

describe('toHex', () => {
  it('should convert named color to hex', () => {
    // This test is a placeholder, as toHex uses canvas and DOM
    expect(typeof toHex('red')).toBe('string');
  });
});

describe('cluster', () => {
  it('should cluster similar values', () => {
    const clustered = cluster(['10px', '12px', '11px', '30px', '31px']);
    expect(Object.keys(clustered).length).toBeGreaterThan(1);
  });
});

describe('extractColorTokens', () => {
  it('should return an array', () => {
    // This test is a placeholder, as extractColorTokens uses DOM
    expect(Array.isArray(extractColorTokens([]))).toBe(true);
  });
});
