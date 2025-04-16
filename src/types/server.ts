export type ServiceStatus = 'complete' | 'warning' | 'failed' | 'running';

export interface CaseStat {
  id: string;
  caseName: string;
  successRate: number;
  executionTime: string;
  lastExecution: string;
}

export interface ServerAlert {
  id: string;
  alertName: string;
  alertType: string; 
}
export interface Alert {
    id: string
    level: string
    message: string
    server: string
    timestamp: string
    acknowledged: boolean
  }
export interface Server {
  id: string;
  name: string;
  status: ServiceStatus;
  ip: string;
  type: string;
  lastUpdated: string;
}
