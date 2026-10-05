/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - LIVE SESSION MANAGER
 * Manages real-time bidirectional audio/video sessions via Live API.
 */

export interface LiveSessionConfig {
  sessionId: string;
  model: 'gemini-3.8-live' | 'gemini-3.8-live-extended-thinking' | 'gemini-3.5-transcribe-live';
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  thinkingLevel?: 'HIGH' | 'LOW';
  systemInstruction?: string;
  targetLanguageCode?: string;
}

export interface LiveSessionState {
  sessionId: string;
  model: string;
  status: 'INITIALIZING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  createdAt: number;
  lastActive: number;
  packetsReceived: number;
  packetsSent: number;
  error?: string;
}

export class LiveSessionManager {
  private static instance: LiveSessionManager;
  private activeSessions: Map<string, LiveSessionState> = new Map();

  private constructor() {}

  public static getInstance(): LiveSessionManager {
    if (!LiveSessionManager.instance) {
      LiveSessionManager.instance = new LiveSessionManager();
    }
    return LiveSessionManager.instance;
  }

  public createSession(config: LiveSessionConfig): LiveSessionState {
    const state: LiveSessionState = {
      sessionId: config.sessionId,
      model: config.model,
      status: 'INITIALIZING',
      createdAt: Date.now(),
      lastActive: Date.now(),
      packetsReceived: 0,
      packetsSent: 0
    };

    this.activeSessions.set(config.sessionId, state);
    return state;
  }

  public updateSession(sessionId: string, patch: Partial<LiveSessionState>): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      Object.assign(session, patch, { lastActive: Date.now() });
    }
  }

  public getSession(sessionId: string): LiveSessionState | undefined {
    return this.activeSessions.get(sessionId);
  }

  public closeSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'DISCONNECTED';
      this.activeSessions.delete(sessionId);
    }
  }

  public getAllActiveSessions(): LiveSessionState[] {
    return Array.from(this.activeSessions.values());
  }
}

export const liveSessionManager = LiveSessionManager.getInstance();
