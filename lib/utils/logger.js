// Lightweight structured JSON logger with context support

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const minLevelValue = LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info;

function safeSerialize(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({ message: 'Unable to serialize log object' });
  }
}

function normalizeMeta(meta) {
  if (!meta) return {};
  if (meta instanceof Error) {
    return {
      error: meta.message,
      stack: meta.stack,
      name: meta.name,
      code: meta.code,
    };
  }
  if (typeof meta !== 'object') {
    return { value: meta };
  }
  const clean = { ...meta };
  if (clean.error instanceof Error) {
    clean.error = {
      message: clean.error.message,
      stack: clean.error.stack,
      name: clean.error.name,
      code: clean.error.code,
    };
  }
  return clean;
}

function log(level, message, meta = {}, baseContext = {}) {
  const levelValue = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  if (levelValue >= minLevelValue) {
    const timestamp = new Date().toISOString();
    const logObj = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...baseContext,
      ...normalizeMeta(meta),
    };

    const serialized = safeSerialize(logObj);
    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }
}

function createLoggerInstance(baseContext = {}) {
  return {
    debug: (msg, meta) => log('debug', msg, meta, baseContext),
    info: (msg, meta) => log('info', msg, meta, baseContext),
    warn: (msg, meta) => log('warn', msg, meta, baseContext),
    error: (msg, meta) => log('error', msg, meta, baseContext),
    child: (extraContext = {}) => createLoggerInstance({ ...baseContext, ...extraContext }),
  };
}

export const logger = createLoggerInstance();
export default logger;
