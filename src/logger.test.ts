/**
 * Tests for Logger
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, LogLevel } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create logger with default settings', () => {
    const logger = new Logger();
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should create logger with custom prefix and level', () => {
    const logger = new Logger('TestLogger', LogLevel.DEBUG);
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should set log level', () => {
    const logger = new Logger();
    logger.setLevel(LogLevel.ERROR);
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should log error messages', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = new Logger('Test', LogLevel.ERROR);
    logger.error('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Test] ERROR:', 'Test error message');
  });

  it('should log warn messages when level permits', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new Logger('Test', LogLevel.WARN);
    logger.warn('Test warning');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should not log debug when level is INFO', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = new Logger('Test', LogLevel.INFO);
    logger.debug('Debug message');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});
