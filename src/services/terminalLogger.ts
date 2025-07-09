interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  component: string;
  message: string;
  data?: any;
}

// Use the same base URL logic as the main API service
const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    // Fall back to production server instead of localhost
    return 'https://bm-branch-server.vercel.app/api';
  }
  return url.endsWith('/api') ? url : `${url}/api`;
};

class TerminalLogger {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  private async sendLog(entry: LogEntry) {
    try {
      await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if terminal logging fails
      console.log('Terminal Log:', entry.message, entry.data);
    }
  }

  info(component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      component,
      message,
      data,
    };
    this.sendLog(entry);
  }

  error(component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      component,
      message,
      data,
    };
    this.sendLog(entry);
  }

  warn(component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      component,
      message,
      data,
    };
    this.sendLog(entry);
  }

  debug(component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      component,
      message,
      data,
    };
    this.sendLog(entry);
  }
}

export const terminalLogger = new TerminalLogger(); 