import React from 'react';
import clsx from 'clsx';

export function FeatureCard({ title, description, onPrimary, onSecondary, primaryLabel='Use', secondaryLabel='Details' }: any) {
  return (
    <div className="bg-white rounded-md shadow p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-800">{title}</h3>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={onPrimary} className="px-3 py-1 rounded bg-sky-600 text-white">{primaryLabel}</button>
        <button onClick={onSecondary} className="px-3 py-1 rounded border">{secondaryLabel}</button>
      </div>
    </div>
  );
}