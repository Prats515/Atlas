export default function SettingsPage() {
  return (
    <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Review your workspace integration status and core product settings.</p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Gmail integration</h2>
        <p className="mt-2 text-sm text-slate-700">Connected account: <span className="font-medium text-slate-900">Not connected</span></p>
        <p className="mt-1 text-sm text-slate-600">Once Gmail is connected, Atlas can sync messages and surface related candidates, companies, and jobs.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Sync status</h2>
        <p className="mt-2 text-sm text-slate-700">Last sync: <span className="font-medium text-slate-900">Not synced yet</span></p>
        <p className="mt-1 text-sm text-slate-600">Email sync will keep your inbox and matches up to date.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">AI settings</h2>
        <p className="mt-2 text-sm text-slate-700">Smart matching, email summarization, and inbox intelligence controls are coming soon.</p>
      </section>
    </div>
  );
}
