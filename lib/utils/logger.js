// Simple console logger wrapper for MVP
const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = process.env.LOG_LEVEL || 'info';

function log(level, message, meta = {}) {
  if (levels[level] >= levels[currentLevel]) {
    const timestamp = new Date().toISOString();
    const logObj = { timestamp, level, message, ...meta };
    
    if (level === 'error') {
      console.error(JSON.stringify(logObj));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logObj));
    } else {
      console.log(JSON.stringify(logObj));
    }
  }
}

export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};
