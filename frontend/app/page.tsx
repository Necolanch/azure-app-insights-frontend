"use client";
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
            <button className="px-3 py-1 rounded bg-amber-600 text-white" onClick={() => send('manual emit open','open')}>emit open</button>
            <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={() => send('manual emit submit','submit',{ success: false, errorCode: 'VALIDATION_MISSING_FIELD' })}>emit failed submit</button>
            <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => send('sermon-notes','success',{ success: true })}>emit success</button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-slate-800">Notes for reviewers</h3>
            <ul className="text-sm text-slate-600 list-disc pl-5">
              <li>Event name: <code>FeatureUsed</code> with property <code>featureId</code> + <code>event</code>.</li>
              <li>Properties include <code>userId</code>, <code>featureVersion</code>, <code>appVersion</code>, and contextual data.</li>
              <li>Keep events unsampled or excluded from adaptive sampling so counts are accurate for funnels.</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-md shadow p-4">
          <h3 className="font-medium text-slate-800">How to demo to manager</h3>
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