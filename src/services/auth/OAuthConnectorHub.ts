/**
 * NAVIX AI — PERMISSION-SCORED OAUTH & API CONNECTOR HUB
 * 
 * Secure credential vault and granular permission manager for external APIs
 * (Vercel, Stripe, Firebase, Supabase, GitHub, PostHog, Firecrawl, Mapbox).
 */

export interface ConnectorCredential {
  providerId: string;
  providerName: string;
  category: string;
  iconName: string;
  apiKey?: string;
  authToken?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'NEEDS_VERIFICATION';
  grantedPermissions: string[];
  lastUsed?: string;
}

export class OAuthConnectorHub {
  private storageKey = 'navix_oauth_credentials_vault_v1';
  private credentials: Map<string, ConnectorCredential> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          Object.entries(parsed).forEach(([k, v]) => {
            this.credentials.set(k, v as ConnectorCredential);
          });
        }
      }
    } catch (e) {
      console.warn('[OAuthConnectorHub] Could not read credentials vault', e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, any> = {};
        this.credentials.forEach((val, key) => {
          obj[key] = val;
        });
        window.localStorage.setItem(this.storageKey, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('[OAuthConnectorHub] Could not save credentials vault', e);
    }
  }

  public getAllConnectors(): ConnectorCredential[] {
    const defaultConnectors: ConnectorCredential[] = [
      { providerId: 'stripe', providerName: 'Stripe Payments', category: 'Fintech', iconName: 'CreditCard', status: 'DISCONNECTED', grantedPermissions: ['read_charges', 'create_payment_links'] },
      { providerId: 'vercel', providerName: 'Vercel Cloud Hosting', category: 'DevOps', iconName: 'Cloud', status: 'DISCONNECTED', grantedPermissions: ['deploy_project', 'read_deployments'] },
      { providerId: 'firebase', providerName: 'Firebase Firestore', category: 'Database', iconName: 'Database', status: 'CONNECTED', grantedPermissions: ['firestore_read_write'] },
      { providerId: 'firecrawl', providerName: 'Firecrawl Web Extraction', category: 'Search', iconName: 'Search', status: 'DISCONNECTED', grantedPermissions: ['scrape_markdown'] },
      { providerId: 'posthog', providerName: 'PostHog Analytics', category: 'Telemetry', iconName: 'BarChart3', status: 'DISCONNECTED', grantedPermissions: ['capture_events'] },
      { providerId: 'github', providerName: 'GitHub Repositories', category: 'DevOps', iconName: 'GitBranch', status: 'CONNECTED', grantedPermissions: ['read_repos', 'execute_actions'] }
    ];

    return defaultConnectors.map(def => {
      const stored = this.credentials.get(def.providerId);
      return stored ? { ...def, ...stored } : def;
    });
  }

  public setCredential(providerId: string, apiKey: string, grantedPermissions?: string[]): void {
    const existing = this.credentials.get(providerId) || {
      providerId,
      providerName: providerId.toUpperCase(),
      category: 'General',
      iconName: 'Key',
      status: 'DISCONNECTED',
      grantedPermissions: []
    };

    existing.apiKey = apiKey;
    existing.status = apiKey.trim() ? 'CONNECTED' : 'DISCONNECTED';
    if (grantedPermissions) existing.grantedPermissions = grantedPermissions;
    existing.lastUsed = new Date().toISOString();

    this.credentials.set(providerId, existing);
    this.saveToStorage();
  }

  public disconnect(providerId: string): void {
    this.credentials.delete(providerId);
    this.saveToStorage();
  }

  public getCredential(providerId: string): string | undefined {
    return this.credentials.get(providerId)?.apiKey;
  }
}

export const oauthConnectorHub = new OAuthConnectorHub();
