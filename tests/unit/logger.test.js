import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../lib/utils/logger.js';

describe('Structured Logger', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs info messages as structured JSON', () => {
    logger.info('User registered', { userId: 'user-123' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const loggedStr = consoleLogSpy.mock.calls[0][0];
    const parsed = JSON.parse(loggedStr);

    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('User registered');
    expect(parsed.userId).toBe('user-123');
    expect(parsed.timestamp).toBeDefined();
  });

  it('logs warn messages via console.warn', () => {
    logger.warn('Rate limit threshold approached', { count: 95 });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('WARN');
    expect(parsed.count).toBe(95);
  });

  it('logs error messages and serializes Error objects', () => {
    const error = new Error('Database timeout');
    error.code = 'ETIMEDOUT';
    logger.error('Failed to execute query', { error });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('ERROR');
    expect(parsed.message).toBe('Failed to execute query');
    expect(parsed.error.message).toBe('Database timeout');
    expect(parsed.error.code).toBe('ETIMEDOUT');
  });

  it('creates child logger preserving inherited context', () => {
    const requestLogger = logger.child({ requestId: 'req-abc', service: 'applications' });
    requestLogger.info('Application processed', { appId: 'app-999' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(parsed.requestId).toBe('req-abc');
    expect(parsed.service).toBe('applications');
    expect(parsed.appId).toBe('app-999');
  });
});
