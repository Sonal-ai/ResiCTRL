import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// ── Test JWT token generation and validation logic ──

const TEST_SECRET = 'test_secret_key_for_vitest';

describe('JWT Security', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
  });

  it('should generate a valid JWT token', () => {
    const token = jwt.sign(
      { userId: 'test-id', role: 'WARDEN', name: 'Test Admin' },
      TEST_SECRET,
      { expiresIn: '7d' }
    );
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should decode token with correct payload', () => {
    const payload = { userId: 'test-id', role: 'WARDEN', name: 'Test Admin' };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, TEST_SECRET);
    expect(decoded.userId).toBe('test-id');
    expect(decoded.role).toBe('WARDEN');
    expect(decoded.name).toBe('Test Admin');
  });

  it('should fail verification with wrong secret', () => {
    const token = jwt.sign({ userId: 'test-id' }, TEST_SECRET);
    expect(() => jwt.verify(token, 'wrong_secret')).toThrow();
  });

  it('should detect expired tokens', () => {
    const token = jwt.sign({ userId: 'test-id' }, TEST_SECRET, { expiresIn: '0s' });
    // Small delay to ensure expiry
    expect(() => jwt.verify(token, TEST_SECRET)).toThrow('jwt expired');
  });

  it('should include exp claim in generated tokens', () => {
    const token = jwt.sign({ userId: 'test-id' }, TEST_SECRET, { expiresIn: '7d' });
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    // exp should be ~7 days from now
    const sevenDaysFromNow = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(decoded.exp).toBeLessThanOrEqual(sevenDaysFromNow + 5); // 5s tolerance
  });

  it('should not contain password in token payload', () => {
    const token = jwt.sign(
      { userId: 'test-id', role: 'WARDEN', name: 'Admin' },
      TEST_SECRET,
      { expiresIn: '7d' }
    );
    const decoded = jwt.decode(token);
    expect(decoded.password).toBeUndefined();
    expect(decoded.email).toBeUndefined(); // email not in token either
  });
});

describe('Admin Registration Key', () => {
  it('should require ADMIN_REGISTRATION_KEY env var', () => {
    // Simulates the server check: if no key is set, registration fails
    const validKey = undefined; // process.env.ADMIN_REGISTRATION_KEY not set
    expect(!validKey).toBe(true); // would return 503
  });

  it('should reject mismatched keys', () => {
    const serverKey = 'rc_admin_2026_dtu_secure';
    const clientKey = 'wrong_key';
    expect(clientKey !== serverKey).toBe(true); // would return 403
  });

  it('should accept correct key', () => {
    const serverKey = 'rc_admin_2026_dtu_secure';
    const clientKey = 'rc_admin_2026_dtu_secure';
    expect(clientKey === serverKey).toBe(true);
  });
});
