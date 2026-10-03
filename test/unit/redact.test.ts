import { describe, it, expect } from 'vitest';
import { redactString, isSecretKeyName } from '../../src/util/redact.js';

describe('Redaction Utility', () => {
  it('identifies secret key names without modifying key names', () => {
    expect(isSecretKeyName('DB_PASSWORD')).toBe(true);
    expect(isSecretKeyName('API_SECRET_KEY')).toBe(true);
    expect(isSecretKeyName('USER_NAME')).toBe(false);
  });

  it('redacts secret values in connection strings and tokens', () => {
    const raw = 'Password=MySuperSecretPass123;User=admin;';
    const redacted = redactString(raw);
    expect(redacted).toContain('Password=[REDACTED]');
    expect(redacted).not.toContain('MySuperSecretPass123');
  });
});
