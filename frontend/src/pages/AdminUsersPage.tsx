import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";
import { fetchUserProfileStats, type ProfileStat } from "../services/api";

const PROFILE_CONFIG = {
  tech_enthusiast: { label: "Tech Enthusiast", color: "#6366f1", emoji: "💻" },
  fashion_shopper: { label: "Fashion Shopper", color: "#ec4899", emoji: "👗" },
  home_decor_lover: {
    label: "Home Decor Lover",
    color: "#f59e0b",
    emoji: "🏠",
  },
  bargain_hunter: { label: "Bargain Hunter", color: "#10b981", emoji: "🎯" },
  loyal_customer: { label: "Loyal Customer", color: "#06b6d4", emoji: "⭐" },
} as const;

type ProfileType = keyof typeof PROFILE_CONFIG;

function getProfileConfig(profileType: string) {
  return (
    PROFILE_CONFIG[profileType as ProfileType] ?? {
      label: profileType,
      color: "#94a3b8",
      emoji: "👤",
    }
  );
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<ProfileStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await fetchUserProfileStats();
      if (!mounted) return;
      setProfiles(data);
      setIsLoading(false);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedByPurchases = useMemo(
    () => [...profiles].sort((a, b) => b.total_purchases - a.total_purchases),
    [profiles],
  );

  const totalUsers = useMemo(
    () => profiles.reduce((sum, item) => sum + item.user_count, 0),
    [profiles],
  );

  const pieData = useMemo(
    () =>
      profiles.map((profile) => {
        const cfg = getProfileConfig(profile.profile_type);
        return {
          name: cfg.label,
          value: profile.total_events,
          color: cfg.color,
        };
      }),
    [profiles],
  );

  if (isLoading) {
    return (
      <div className="space-y-6 px-6 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 animate-pulse rounded-2xl bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {profiles.map((profile) => {
          const cfg = getProfileConfig(profile.profile_type);
          return (
            <article
              key={profile.profile_type}
              className="rounded-2xl bg-slate-800 p-5"
              style={{ borderLeft: `4px solid ${cfg.color}` }}
            >
              <div className="mb-3 flex items-center gap-2 text-white">
                <span className="text-xl">{cfg.emoji}</span>
                <h3 className="font-semibold">{cfg.label}</h3>
              </div>
              <p className="text-sm text-slate-300">
                {profile.user_count} usuários | {profile.total_purchases}{" "}
                compras
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {profile.avg_events_per_user.toFixed(1)} eventos/usuário
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="relative rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Distribuição de Eventos por Perfil
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  Number(value ?? 0).toLocaleString("pt-BR")
                }
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
              <p className="text-sm text-slate-400">Usuários</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Compras por Perfil
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={sortedByPurchases}
              layout="vertical"
              margin={{ left: 12 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                type="category"
                width={180}
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                dataKey="profile_type"
                tickFormatter={(value) => {
                  const cfg = getProfileConfig(value);
                  return `${cfg.emoji} ${cfg.label}`;
                }}
              />
              <Tooltip
                formatter={(value, _name, payload) => {
                  const cfg = getProfileConfig(payload?.payload?.profile_type);
                  return [`${Number(value ?? 0)} compras`, cfg.label];
                }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="total_purchases" radius={[0, 6, 6, 0]}>
                {sortedByPurchases.map((entry) => (
                  <Cell
                    key={entry.profile_type}
                    fill={getProfileConfig(entry.profile_type).color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-slate-800">
        <div className="border-b border-slate-700 px-4 py-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-cyan-400" />
            Engajamento por Perfil
          </h3>
        </div>
        <div className="grid grid-cols-12 border-b border-slate-700 bg-slate-900/50 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
          <div className="col-span-3">Perfil</div>
          <div className="col-span-1 text-right">Usuários</div>
          <div className="col-span-2 text-right">Total Eventos</div>
          <div className="col-span-2 text-right">Compras</div>
          <div className="col-span-2 text-right">Eventos/Usuário</div>
          <div className="col-span-2 text-right">Conversão</div>
        </div>
        {sortedByPurchases.map((profile, idx) => {
          const cfg = getProfileConfig(profile.profile_type);
          const conversion =
            profile.total_events > 0
              ? (profile.total_purchases / profile.total_events) * 100
              : 0;
          const highlight = profile.profile_type === "loyal_customer";

          return (
            <div
              key={profile.profile_type}
              className={`grid grid-cols-12 items-center px-4 py-3 text-sm ${
                highlight
                  ? "bg-indigo-500/10"
                  : idx % 2 === 0
                    ? "bg-slate-800"
                    : "bg-slate-800/50"
              }`}
            >
              <div className="col-span-3 flex items-center gap-2 text-slate-100">
                <span>{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </div>
              <div className="col-span-1 text-right text-slate-300">
                {profile.user_count}
              </div>
              <div className="col-span-2 text-right text-slate-300">
                {profile.total_events.toLocaleString("pt-BR")}
              </div>
              <div className="col-span-2 text-right text-slate-300">
                {profile.total_purchases.toLocaleString("pt-BR")}
              </div>
              <div className="col-span-2 text-right text-slate-300">
                {profile.avg_events_per_user.toFixed(0)}
              </div>
              <div className="col-span-2 text-right font-medium text-cyan-300">
                {conversion.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
