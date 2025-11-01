import { LOG_LEVEL, DEBUG_MODE } from '../utils/app-config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log Levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Logger Configuration
 */
export interface LoggerConfig {
  /** Minimum log level to display */
  level: LogLevel;
  /** Whether to write logs to file */
  writeToFile: boolean;
  /** Log file path */
  logFilePath: string;
  /** Whether to include timestamps */
  includeTimestamp: boolean;
  /** Whether to colorize console output */
  colorize: boolean;
}

/**
 * Logger Helper
 * Provides structured logging with multiple levels and file output
 */
export class Logger {
  private config: LoggerConfig;
  private static instance: Logger;

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getLogLevelFromEnv(),
      writeToFile: true,
      logFilePath: 'test-results/logs/test-execution.log',
      includeTimestamp: true,
      colorize: true,
      ...config,
    };

    // Ensure log directory exists
    if (this.config.writeToFile) {
      this.ensureLogDirectory();
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Get log level from environment variable
   */
  private getLogLevelFromEnv(): LogLevel {
    const levelMap: { [key: string]: LogLevel } = {
      error: LogLevel.ERROR,
      warn: LogLevel.WARN,
      info: LogLevel.INFO,
      debug: LogLevel.DEBUG,
    };

    return levelMap[LOG_LEVEL.toLowerCase()] ?? LogLevel.INFO;
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.config.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   */
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = this.config.includeTimestamp
      ? `[${new Date().toISOString()}]`
      : '';
    const levelStr = `[${level.toUpperCase()}]`;
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';

    return `${timestamp} ${levelStr} ${message}${dataStr}`;
  }

  /**
   * Get console color for log level
   */
  private getColor(level: LogLevel): string {
    if (!this.config.colorize) return '';

    const colors: { [key in LogLevel]: string } = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[90m', // Gray
    };

    return colors[level];
  }

  /**
   * Reset console color
   */
  private resetColor(): string {
    return this.config.colorize ? '\x1b[0m' : '';
  }

  /**
   * Write log to file
   */
  private writeToFile(message: string): void {
    if (!this.config.writeToFile) return;

    try {
      fs.appendFileSync(this.config.logFilePath, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level > this.config.level) return;

    const formattedMessage = this.formatMessage(levelName, message, data);
    const color = this.getColor(level);
    const reset = this.resetColor();

    // Console output with color
    console.log(`${color}${formattedMessage}${reset}`);

    // File output without color
    this.writeToFile(formattedMessage);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  /**
   * Log debug message (only in debug mode)
   */
  debug(message: string, data?: any): void {
    if (!DEBUG_MODE) return;
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Log test step (special info level for test steps)
   */
  step(stepName: string, description?: string): void {
    const message = description ? `${stepName}: ${description}` : stepName;
    this.log(LogLevel.INFO, 'STEP', message);
  }

  /**
   * Log test start
   */
  testStart(testName: string): void {
    this.log(LogLevel.INFO, 'TEST START', testName);
    this.writeToFile('='.repeat(80));
  }

  /**
   * Log test end
   */
  testEnd(testName: string, passed: boolean, duration?: number): void {
    const status = passed ? 'PASSED' : 'FAILED';
    const durationStr = duration ? ` (${duration}ms)` : '';
    this.log(
      passed ? LogLevel.INFO : LogLevel.ERROR,
      'TEST END',
      `${testName} - ${status}${durationStr}`
    );
    this.writeToFile('='.repeat(80));
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: any): void {
    this.log(LogLevel.DEBUG, `API ${method}`, url, data);
  }

  /**
   * Log API response
   */
  apiResponse(status: number, url: string, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API ${status}`, url, data);
  }

  /**
   * Log element interaction
   */
  interaction(action: string, element: string, value?: any): void {
    const message = value ? `${action} on ${element}: ${value}` : `${action} on ${element}`;
    this.debug(message);
  }

  /**
   * Log navigation
   */
  navigation(url: string): void {
    this.info(`Navigating to: ${url}`);
  }

  /**
   * Log assertion
   */
  assertion(description: string, passed: boolean): void {
    const level = passed ? LogLevel.DEBUG : LogLevel.ERROR;
    const status = passed ? 'PASSED' : 'FAILED';
    this.log(level, 'ASSERT', `${description} - ${status}`);
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.debug(`Performance - ${metric}: ${value}${unit}`);
  }

  /**
   * Create a child logger with context
   */
  child(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * Clear log file
   */
  clearLogFile(): void {
    if (this.config.writeToFile && fs.existsSync(this.config.logFilePath)) {
      fs.writeFileSync(this.config.logFilePath, '', 'utf8');
      this.info('Log file cleared');
    }
  }
}

/**
 * Context Logger
 * Logger with automatic context prefix
 */
export class ContextLogger {
  constructor(private logger: Logger, private context: string) {}

  error(message: string, data?: any): void {
    this.logger.error(`[${this.context}] ${message}`, data);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(`[${this.context}] ${message}`, data);
  }

  info(message: string, data?: any): void {
    this.logger.info(`[${this.context}] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    this.logger.debug(`[${this.context}] ${message}`, data);
  }

  step(stepName: string, description?: string): void {
    this.logger.step(`[${this.context}] ${stepName}`, description);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
