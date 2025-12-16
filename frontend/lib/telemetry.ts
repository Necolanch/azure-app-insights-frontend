import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Lightweight telemetry wrapper. Keeps a stable API for the demo.
class Telemetry {
  private ai: ApplicationInsights | null = null;
  private isInitialized = false;
  private reactPlugin = new ReactPlugin();

  init(connectionString?: string) {
    if (!connectionString) {
      console.warn('App Insights connection string missing — telemetry will be a no-op in demo.');
      return;
    }
    if (this.isInitialized) return;
    this.ai = new ApplicationInsights({ config: {
      connectionString,
      extensions: [this.reactPlugin],
      enableAutoRouteTracking: true,
      maxBatchInterval: 15000
    }});
    this.ai.loadAppInsights();
    this.isInitialized = true;
  }

  // track a custom feature event with structured properties
  trackFeatureEvent(props: {
    featureId: string,
    event: string,
    userId?: string,
    sessionId?: string,
    featureVersion?: string,
    appVersion?: string,
    variant?: string,
    success?: boolean,
    errorCode?: string,
    durationMs?: number,
    extra?: Record<string, any>
  }) {
    const { featureId, event, extra, ...rest } = props;
    const name = featureId;
    const properties: Record<string,string> = {
      featureId,
      event,
      featureVersion: rest.featureVersion || process.env.NEXT_PUBLIC_FEATURE_VERSION || 'v1',
      appVersion: rest.appVersion || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      variant: rest.variant || 'stable',
      userId: rest.userId || 'anon-nico',
      sessionId: rest.sessionId || 'session-demo'
    };
    if (rest.success !== undefined) properties['success'] = String(rest.success);
    if (rest.errorCode) properties['errorCode'] = rest.errorCode;
    if (rest.durationMs !== undefined) properties['durationMs'] = String(rest.durationMs);
    if (extra) {
      for (const k of Object.keys(extra)) properties[k] = String(extra[k]);
    }

    if (!this.isInitialized || !this.ai) {
      // fall back to console for demo environments without connection string
      console.info('[telemetry]', name, properties);
      return;
    }

    this.ai.trackEvent({ name, properties });
  }
}

export const telemetry = new Telemetry();