interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  component: string;
  message: string;
  data?: any;
}

class TerminalLogger {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private async sendLog(entry: LogEntry) {
    try {
      await fetch(`${this.baseUrl}/api/logs`, {
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