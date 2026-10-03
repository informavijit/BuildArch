/**
 * Redacts secrets, tokens, connection strings, and sensitive key values.
 */

const SECRET_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api_?key/i,
  /auth/i,
  /connection_?string/i,
  /credential/i,
  /private_?key/i,
];

const VALUE_SECRET_PATTERNS = [
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT
  /(?:sk|pk|api)_(?:live|test)_[0-9a-zA-Z]{20,}/g, // Stripe/API keys
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
  /[a-zA-Z0-9+/=]{40,}/g, // High entropy base64 strings
];

export function isSecretKeyName(keyName: string): boolean {
  return SECRET_KEY_PATTERNS.some((pat) => pat.test(keyName));
}

export function redactString(input: string): string {
  if (!input) return input;
  let text = input;

  // Redact key=value or "key": "value"
  text = text.replace(
    /((?:password|secret|token|api_?key|auth|connection_?string|credential|private_?key)\s*[:=]\s*)(['"]?)([^'"\s\r\n;]+)(['"]?)/gi,
    '$1$2[REDACTED]$4'
  );

  // Redact connection strings (e.g. Server=myServer;User Id=myUser;Password=myPassword;)
  text = text.replace(/(Password|pwd|Secret|Key)=([^;]+)/gi, '$1=[REDACTED]');

  // Redact known secret value patterns
  for (const pat of VALUE_SECRET_PATTERNS) {
    text = text.replace(pat, '[REDACTED_SECRET_TOKEN]');
  }

  return text;
}
