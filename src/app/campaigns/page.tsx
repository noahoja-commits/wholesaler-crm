"use client";

import { useApi } from "@/lib/hooks";
import { Plus, BarChart3, Mail, MessageSquare, Voicemail } from "lucide-react";

interface Campaign {
  id: string; name: string; type: string; status: string;
  subjectLine: string | null; totalSent: number; totalOpened: number;
  totalReplied: number; scheduledAt: string | null; createdAt: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DIRECT_MAIL: Mail, EMAIL: Mail, SMS: MessageSquare, RINGLESS_VOICEMAIL: Voicemail, MULTI_CHANNEL: BarChart3,
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400", SCHEDULED: "bg-blue-400/10 text-blue-400",
  IN_PROGRESS: "bg-emerald-400/10 text-emerald-400", COMPLETED: "bg-zinc-800 text-zinc-500",
  PAUSED: "bg-yellow-400/10 text-yellow-400", CANCELLED: "bg-red-400/10 text-red-400",
};

export default function CampaignsPage() {
  const { data, loading } = useApi<{ campaigns: Campaign[] }>("/api/campaigns?orgId=org_demo");
  const campaigns = data?.campaigns || [];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-zinc-500">Loading campaigns...</div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Campaigns</h2><p className="text-sm text-zinc-500 mt-1">Direct mail, SMS, email drip campaigns</p></div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"><Plus className="h-4 w-4" /> New Campaign</button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <BarChart3 className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-400">No campaigns yet</h3>
          <p className="text-xs text-zinc-600 mt-1 mb-4">Create your first marketing campaign to reach motivated sellers</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"><Plus className="h-4 w-4" /> Create Campaign</button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const Icon = TYPE_ICONS[campaign.type] || Mail;
            return (
              <div key={campaign.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center"><Icon className="h-5 w-5 text-zinc-400" /></div>
                    <div><h3 className="font-medium text-sm">{campaign.name}</h3><p className="text-xs text-zinc-500">{campaign.type.replace("_", " ")} • {campaign.subjectLine || "No subject"}</p></div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[campaign.status] || "bg-zinc-800 text-zinc-500"}`}>{campaign.status.replace("_", " ")}</span>
                </div>
                {campaign.status === "IN_PROGRESS" && (
                  <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-3 gap-4">
                    <div className="text-center"><div className="text-lg font-bold text-zinc-300">{campaign.totalSent.toLocaleString()}</div><div className="text-xs text-zinc-500">Sent</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-emerald-400">{campaign.totalOpened.toLocaleString()}</div><div className="text-xs text-zinc-500">Opened</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-blue-400">{campaign.totalReplied.toLocaleString()}</div><div className="text-xs text-zinc-500">Replied</div></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
