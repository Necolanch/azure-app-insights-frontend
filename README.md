# azure-app-insights-frontend
Demo app to show app insights code implementation and Usage section features for user session and behavior data

I asked ChatGPT to generate a Next.js app to get some telemetry in an Application Insights instance to demo the full features of the Usage section, particularly Funnels, Workbooks, and Dashboards via KQL queries. I wanted to focus on the App Insights features and infrastructure work via Terraform. It returned the below virtual project file. The actual code in the repository and this are different as it gave me conflicting information with the app router and pages router so I had to correct that further.
// Next.js demo app showing App Insights instrumentation
// Project: nextjs-appinsights-demo
// Author: generated for Nicholas Cruz
// Purpose: Frontend-only demo to show custom event instrumentation patterns, KQL examples, and Workbooks guidance.

/*
Instructions:
- This is a single-file presentation containing multiple virtual project files separated by comments.
- To use: copy the relevant files into a Next.js + TypeScript project (Next 13+), install dependencies shown in package.json, configure APPINSIGHTS_INSTRUMENTATION_KEY (or connection string) in .env.local, then run `npm run dev`.
- Tailwind is used for styling (optional). The UI is simple and focused on events.
*/

////////////////////////////////////////////////////////////////////////////////
// package.json
////////////////////////////////////////////////////////////////////////////////

// {
//   "name": "nextjs-appinsights-demo",
//   "version": "0.1.0",
//   "private": true,
//   "scripts": {
//     "dev": "next dev",
//     "build": "next build",
//     "start": "next start"
//   },
//   "dependencies": {
//     "next": "13.4.10",
//     "react": "18.2.0",
//     "react-dom": "18.2.0",
//     "@microsoft/applicationinsights-web": "^2.8.14",
//     "@microsoft/applicationinsights-react-js": "^3.0.8",
//     "clsx": "^1.2.1"
//   },
//   "devDependencies": {
//     "typescript": "^5.5.0",
//     "tailwindcss": "^4.4.3",
//     "postcss": "^8.4.21",
//     "autoprefixer": "^10.4.14"
//   }
// }

////////////////////////////////////////////////////////////////////////////////
// .env.local (example - DO NOT CHECK INTO VCS)
////////////////////////////////////////////////////////////////////////////////

// NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://centralus-0.in.applicationinsights.azure.com/
// NEXT_PUBLIC_APP_VERSION=0.1.0

////////////////////////////////////////////////////////////////////////////////
// lib/telemetry.ts - wrapper around Application Insights
////////////////////////////////////////////////////////////////////////////////

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { reactPlugin } from '@microsoft/applicationinsights-react-js';

// Lightweight telemetry wrapper. Keeps a stable API for the demo.
class Telemetry {
  private ai: ApplicationInsights | null = null;
  private isInitialized = false;
  private reactPlugin = reactPlugin;

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
    const name = 'FeatureUsed';
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

////////////////////////////////////////////////////////////////////////////////
// pages/_app.tsx - initialize telemetry and provide simple layout
////////////////////////////////////////////////////////////////////////////////

import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  // initialize telemetry once on client
  React.useEffect(() => {
    try {
      const conn = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;
      telemetry.init(conn);
    } catch (e) {
      console.warn('telemetry init failed', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <h1 className="text-xl font-semibold">Nico Demo — Feature Instrumentation</h1>
          <span className="text-sm text-slate-500">Next.js + App Insights sample</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;

////////////////////////////////////////////////////////////////////////////////
// components/FeatureCard.tsx - small UI component used on the demo page
////////////////////////////////////////////////////////////////////////////////

import React from 'react';
import clsx from 'clsx';

export function FeatureCard({ title, description, onPrimary, onSecondary, primaryLabel='Use', secondaryLabel='Details' }: any) {
  return (
    <div className="bg-white rounded-md shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={onPrimary} className="px-3 py-1 rounded bg-sky-600 text-white">{primaryLabel}</button>
        <button onClick={onSecondary} className="px-3 py-1 rounded border">{secondaryLabel}</button>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// pages/index.tsx - demo page implementing multiple features tied to "Nicholas Cruz" attributes
////////////////////////////////////////////////////////////////////////////////

import React from 'react';
import { FeatureCard } from '../components/FeatureCard';
import { telemetry } from '../lib/telemetry';

export default function Home() {
  // demo user info (in real app obtain from auth)
  const user = {
    id: 'nico-123-hash',
    displayName: 'Nicholas Cruz',
    traits: ['Jesus', 'Azure', 'TypeScript', 'React/NextJS', 'C#/.NET', 'video games', 'pop punk']
  };

  // small helper to send events
  function send(featureId: string, event: string, extra?: any) {
    telemetry.trackFeatureEvent({
      featureId,
      event,
      userId: user.id,
      featureVersion: 'v1',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      extra
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Showcase features (instrumented)</h2>
        <div className="flex flex-col gap-4">
          <FeatureCard
            title="Sermon Notes"
            description="Quickly jot a note tied to a sermon or devotional. Reflect, tag, and share."
            primaryLabel="Open"
            onPrimary={() => { send('sermon-notes','open'); alert('Opened Sermon Notes (demo)'); }}
            onSecondary={() => send('sermon-notes','details')}
          />

          <FeatureCard
            title="Azure Tips"
            description="Short, practical Azure tips and patterns (Nico-style)."
            primaryLabel="View Tip"
            onPrimary={() => { send('azure-tips','view',{ tipId: 'kusto-fast-joins' }); }}
            onSecondary={() => send('azure-tips','bookmark')}
          />

          <FeatureCard
            title="TypeScript Playground"
            description="Run a small TS transform. Used to demo behavior-driven adoption for dev features."
            primaryLabel="Run"
            onPrimary={() => { const t0=Date.now(); /* simulate */ setTimeout(()=>{ send('ts-playground','run',{ durationMs: Date.now()-t0 }); alert('Ran snippet (demo)'); },200); }}
            onSecondary={() => send('ts-playground','save')}
          />

          <FeatureCard
            title="Pop Punk Playlist"
            description="A tiny playlist widget for mood — great for product demos (and morale)."
            primaryLabel="Play"
            onPrimary={() => send('pop-punk-playlist','play',{ playlist: '2000s-essentials' })}
            onSecondary={() => send('pop-punk-playlist','share')}
          />

          <FeatureCard
            title="Game Night Signup"
            description="A tiny RSVP for game nights (helps show adoption for community features)."
            primaryLabel="Sign Up"
            onPrimary={() => send('game-night','signup',{ game: 'Among Us' })}
            onSecondary={() => send('game-night','view')}
          />
        </div>
      </div>

      <aside>
        <h2 className="text-lg font-semibold mb-2">Telemetry playground</h2>
        <div className="bg-white rounded-md shadow p-4 flex flex-col gap-3">
          <p className="text-sm text-slate-600">Manual telemetry actions—useful to demo funnels and failed attempts.</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-amber-600 text-white" onClick={() => send('sermon-notes','open')}>emit open</button>
            <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={() => send('sermon-notes','submit',{ success: false, errorCode: 'VALIDATION_MISSING_FIELD' })}>emit failed submit</button>
            <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => send('sermon-notes','success',{ success: true })}>emit success</button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium">Notes for reviewers</h3>
            <ul className="text-sm text-slate-600 list-disc pl-5">
              <li>Event name: <code>FeatureUsed</code> with property <code>featureId</code> + <code>event</code>.</li>
              <li>Properties include <code>userId</code>, <code>featureVersion</code>, <code>appVersion</code>, and contextual data.</li>
              <li>Keep events unsampled or excluded from adaptive sampling so counts are accurate for funnels.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-md shadow p-4">
          <h3 className="font-medium">How to demo to manager</h3>
          <ol className="text-sm text-slate-600 list-decimal pl-5">
            <li>Open App Insights Usage & create a funnel: <em>sermon-notes open → submit → success</em>.</li>
            <li>Show DAU/MAU and unique users KQL (provided in the workbook section below).</li>
            <li>Pin a workbook panel for conversion rate and a retention heatmap for newly released features.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// styles/globals.css (tailwind minimal)
////////////////////////////////////////////////////////////////////////////////

/*
@tailwind base;
@tailwind components;
@tailwind utilities;
*/

////////////////////////////////////////////////////////////////////////////////
// KQL & Workbooks notes (place into Workbooks or Logs queries)
////////////////////////////////////////////////////////////////////////////////

/*
Copy these KQL snippets into App Insights Logs or a Workbook query control. Replace featureId values with the ones used above.

1) Unique users last 7 days (feature-level):

customEvents
| where name == "FeatureUsed"
| where timestamp >= ago(7d)
| where tostring(customDimensions.featureId) == "sermon-notes"
| summarize UniqueUsers = dcount(tostring(customDimensions.userId))

2) DAU (daily active users) for a feature:

customEvents
| where name == "FeatureUsed"
| where tostring(customDimensions.featureId) == "ts-playground"
| summarize DAU = dcount(tostring(customDimensions.userId)) by bin(timestamp, 1d)
| order by timestamp asc

3) Simple funnel (counts per step — distinct users):

let stepOpen = customEvents | where name=="FeatureUsed" and tostring(customDimensions.featureId)=="sermon-notes" and tostring(customDimensions.event)=="open" | summarize users_open=dcount(tostring(customDimensions.userId));
let stepSubmit = customEvents | where name=="FeatureUsed" and tostring(customDimensions.featureId)=="sermon-notes" and tostring(customDimensions.event)=="submit" | summarize users_submit=dcount(tostring(customDimensions.userId));
let stepSuccess = customEvents | where name=="FeatureUsed" and tostring(customDimensions.featureId)=="sermon-notes" and tostring(customDimensions.event)=="success" | summarize users_success=dcount(tostring(customDimensions.userId));
union (stepOpen | extend step="open"), (stepSubmit | extend step="submit"), (stepSuccess | extend step="success")

4) Cohort retention skeleton (first use per week -> retention):

let firstUse = customEvents
| where name=="FeatureUsed" and tostring(customDimensions.featureId)=="sermon-notes"
| summarize firstUse=min(startofday(timestamp)) by user=tostring(customDimensions.userId);
customEvents
| where name=="FeatureUsed" and tostring(customDimensions.featureId)=="sermon-notes"
| summarize uses=dcount(startofday(timestamp)) by user=tostring(customDimensions.userId), week=startofday(bin(timestamp,7d))
| join kind=inner firstUse on user
| extend cohortWeek = firstUse
| summarize RetainedUsers = dcountif(user, week > cohortWeek) by cohortWeek, week
| order by cohortWeek asc


Workbook / Dashboard guidance:
- Create tiles: Unique Users (7d, 30d), DAU/MAU, Funnel (open→submit→success), Errors by feature.
- Provide filters for featureVersion, appVersion, and releaseRing. Parameterize queries with workbook parameters.
- Pin the funnel and DAU chart to a shared dashboard for PMs.
- If needing long-term retention or joins to business data (billing, segments), export Logs to Storage/ADLS and ingest into Power BI / Synapse.

Privacy & Sampling notes:
- Ensure these custom events are excluded from adaptive sampling or use an ingestion-side rule to retain them. Otherwise counts will be underestimated.
- Hash user identifiers to comply with privacy requirements. Do not send PII in customDimensions.
*/

////////////////////////////////////////////////////////////////////////////////
// End of virtual project file
////////////////////////////////////////////////////////////////////////////////
