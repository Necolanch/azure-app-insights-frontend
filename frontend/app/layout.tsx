// app/layout.tsx
'use client';

import React, { useEffect } from 'react';
import './globals.css';
import { telemetry } from '@/lib/telemetry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    telemetry.init(process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING);
  }, []);

  return (
    <html lang="en">
      <body>
        <header className="bg-white shadow p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">Nico Demo — Feature Instrumentation</h1>
            <span className="text-sm text-slate-500">Next.js (App Router) + App Insights</span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}