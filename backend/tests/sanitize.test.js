import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../src/middlewares/sanitizeMiddleware.js';

// Mock Express req/res/next
const mockReq = (body = {}, query = {}, params = {}) => ({ body, query, params });
const mockNext = () => {};

describe('XSS Sanitization Middleware', () => {
  it('should strip <script> tags from body strings', () => {
    const req = mockReq({ name: 'Hello<script>alert(1)</script>World' });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.name).toBe('HelloWorld');
  });

  it('should strip event handlers (onerror, onclick)', () => {
    const req = mockReq({ title: 'Test onerror="alert(1)" value' });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.title).not.toContain('onerror');
  });

  it('should strip javascript: URIs', () => {
    const req = mockReq({ url: 'javascript:alert(document.cookie)' });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.url).not.toContain('javascript');
  });

  it('should strip iframe tags', () => {
    const req = mockReq({ content: 'text<iframe src="http://evil.com"></iframe>more' });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.content).not.toContain('iframe');
  });

  it('should handle nested objects', () => {
    const req = mockReq({ user: { name: '<script>x</script>John' } });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.user.name).toBe('John');
  });

  it('should handle arrays', () => {
    const req = mockReq({ tags: ['safe', '<script>bad</script>'] });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.tags[1]).toBe('');
  });

  it('should pass through clean strings unchanged', () => {
    const req = mockReq({ name: 'Aarav Mehta', email: 'aarav@dtu.ac.in' });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.name).toBe('Aarav Mehta');
    expect(req.body.email).toBe('aarav@dtu.ac.in');
  });

  it('should sanitize query params', () => {
    const req = mockReq({}, { search: '<script>x</script>test' });
    sanitizeInput(req, {}, mockNext);
    expect(req.query.search).toBe('test');
  });

  it('should handle non-string values (numbers, booleans)', () => {
    const req = mockReq({ count: 42, active: true });
    sanitizeInput(req, {}, mockNext);
    expect(req.body.count).toBe(42);
    expect(req.body.active).toBe(true);
  });
});
