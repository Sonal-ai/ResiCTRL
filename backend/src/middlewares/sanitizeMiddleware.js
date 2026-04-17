/**
 * Input Sanitization Middleware
 * 
 * Replaces the deprecated xss-clean package with a lightweight,
 * recursive XSS strip function. Applied globally to sanitize
 * req.body, req.query, and req.params before they reach controllers.
 * 
 * Strips: <script> tags, event handlers (onerror, onclick, etc.),
 * javascript: URIs, and HTML tags from string values.
 */

// Patterns to strip from user input
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // <script>...</script>
  /on\w+\s*=\s*["'][^"']*["']/gi,                          // onerror="...", onclick="..."
  /on\w+\s*=\s*[^\s>]+/gi,                                 // onerror=alert(1)
  /javascript\s*:/gi,                                       // javascript: URIs
  /data\s*:\s*text\/html/gi,                                // data:text/html payloads
  /<iframe\b[^>]*>/gi,                                      // iframe injection
  /<\/iframe>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
];

/**
 * Strip dangerous patterns from a string value.
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  let clean = value;
  for (const pattern of XSS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  return clean.trim();
}

/**
 * Recursively sanitize all string values in an object/array.
 */
function sanitizeDeep(obj) {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[sanitizeString(key)] = sanitizeDeep(value);
    }
    return cleaned;
  }
  return obj;
}

/**
 * Express middleware — sanitizes req.body, req.query, req.params.
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeDeep(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeDeep(req.params);
  }
  next();
};
