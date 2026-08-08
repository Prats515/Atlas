'use client';

import { useEffect, useState } from 'react';
import { fetchJson, postJson } from '@/services/api';
import { Card } from '../components/ui/primitives';
import { Mail, Briefcase, CalendarDays, AlertCircle } from 'lucide-react';

interface DashboardKPIs {
  emails_today: number;
  needs_reply: number;
  active_apps: number;
  interviews: number;
}

interface DashboardData {
  kpis: DashboardKPIs;
  briefing: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [intelligence, setIntelligence] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const [kpiData, intelligenceData] = await Promise.all([
        postJson<DashboardData>('/brain/dashboard', {}),
        fetchJson<{ summary: string }>('/brain/inbox-intelligence'),
      ]);
      if (kpiData) setKpis(kpiData.kpis);
      if (intelligenceData) setIntelligence(intelligenceData.summary);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Morning Brief</h1>
        <p className="text-zinc-500 mt-1">Here is what you need to know today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Briefcase size={16} /> Applications</div>
          <div className="text-3xl font-bold mt-2">{kpis?.active_apps ?? '-'}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-zinc-500 flex items-center gap-2"><CalendarDays size={16} /> Interviews</div>
          <div className="text-3xl font-bold mt-2">{kpis?.interviews ?? '-'}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-zinc-500 flex items-center gap-2"><Mail size={16} /> Unread</div>
          <div className="text-3xl font-bold mt-2">{kpis?.needs_reply ?? '-'}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-zinc-500 flex items-center gap-2"><AlertCircle size={16} /> Actions</div>
          <div className="text-3xl font-bold mt-2">{kpis?.emails_today ?? '-'}</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Recent AI Insights</h2>
        {isLoading ? (
          <div className="text-sm text-zinc-500">Analyzing your inbox...</div>
        ) : intelligence ? (
          <div className="text-zinc-700 leading-relaxed">{intelligence}</div>
        ) : (
          <div className="text-sm text-zinc-500">No new insights.</div>
        )}
      </Card>
    </div>
  );
}
