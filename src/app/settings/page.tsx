export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-zinc-500 mt-1">Organization and pipeline configuration</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-sm text-zinc-300">Organization</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Organization Name</label>
            <input
              type="text"
              defaultValue="Default Org"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-sm text-zinc-300">Database</h3>
        <p className="text-xs text-zinc-500">
          Set the <code className="bg-zinc-800 px-1 py-0.5 rounded">DATABASE_URL</code> in{" "}
          <code className="bg-zinc-800 px-1 py-0.5 rounded">.env</code> and run{" "}
          <code className="bg-zinc-800 px-1 py-0.5 rounded">npx prisma db push</code>{" "}
          to initialize.
        </p>
        <p className="text-xs text-zinc-600">
          Example:{" "}
          <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">
            postgresql://user:pass@localhost:5432/wholesaler_crm
          </code>
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-sm text-zinc-300">Pipeline Stages</h3>
        <p className="text-xs text-zinc-500">
          Default pipeline: Lead → Contacted → Appointment → Offer → Contract → Closing → Closed
        </p>
        <p className="text-xs text-zinc-600">
          Custom stages can be configured via the API or database.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h3 className="font-medium text-sm text-zinc-300">Seed Data</h3>
        <p className="text-xs text-zinc-500">
          Populate demo data with realistic wholesaler scenarios.
        </p>
        <code className="block bg-zinc-950 px-3 py-2 rounded-md text-xs text-zinc-400">
          npm run db:seed
        </code>
      </div>
    </div>
  );
}
