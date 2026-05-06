import { useEffect, useState } from "react";
import {
  Bot,
  Play,
  Trash2,
  Users,
  Zap,
  Activity,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import {
  triggerBatchSimulation,
  getSimulationStatus,
  clearSimulatedEvents,
  getSimulatedUsers,
  fetchLiveEvents,
  type SimulationStatus,
  type SimulatedUser,
  type LiveEvent,
} from "../services/api";

const PROFILE_DESCRIPTIONS: Record<string, { icon: string; desc: string }> = {
  casual: { icon: "🛍️", desc: "Browsea ocasionalmente, clica pouco" },
  active: { icon: "🔥", desc: "Navega muito, compra frequentemente" },
  bargain: { icon: "💰", desc: "Busca descontos e promoções" },
  technical: { icon: "🔬", desc: "Pesquisa detalhadamente antes de comprar" },
  impulse: { icon: "⚡", desc: "Compra rápido sem muita deliberação" },
};

export default function AdminSimulationPage() {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [simUsers, setSimUsers] = useState<SimulatedUser[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load simulation status
  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await getSimulationStatus();
      setStatus(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to load status", error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Load simulated users
  const loadUsers = async () => {
    try {
      const data = await getSimulatedUsers();
      setSimUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  // Load live events
  const loadLiveEvents = async () => {
    try {
      const data = await fetchLiveEvents();
      setLiveEvents(data.slice(0, 20));
    } catch (error) {
      console.error("Failed to load events", error);
    }
  };

  // Trigger batch simulation
  const triggerBatch = async (clear: boolean) => {
    setIsRunning(true);
    try {
      await triggerBatchSimulation(clear);
      // Poll status every 2 seconds for 30 seconds
      let elapsed = 0;
      const pollInterval = setInterval(async () => {
        elapsed += 2000;
        await loadStatus();
        if (elapsed >= 30000) {
          clearInterval(pollInterval);
          setIsRunning(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to trigger simulation", error);
      setIsRunning(false);
    }
  };

  // Clear simulation
  const handleClear = async () => {
    if (
      confirm(
        "Limpar todos os eventos simulados? Esta ação não pode ser desfeita.",
      )
    ) {
      try {
        await clearSimulatedEvents();
        await loadStatus();
        await loadUsers();
      } catch (error) {
        console.error("Failed to clear events", error);
      }
    }
  };

  // Load on mount
  useEffect(() => {
    loadStatus();
    loadUsers();
  }, []);

  // Poll live events every 3 seconds
  useEffect(() => {
    loadLiveEvents();
    const interval = setInterval(loadLiveEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const eventColors: Record<string, string> = {
    view: "bg-blue-500",
    purchase: "bg-green-500",
    add_to_cart: "bg-yellow-500",
    click: "bg-purple-500",
    remove_from_cart: "bg-red-500",
    search: "bg-indigo-500",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Simulação de Usuários</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => triggerBatch(false)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              <Play className="w-4 h-4" />
              Executar
            </button>
            <button
              onClick={() => triggerBatch(true)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Resetar + Simular
            </button>
            <button
              onClick={handleClear}
              disabled={isRunning}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>
        <p className="text-slate-400 mt-2">
          Atualizado em {lastRefresh.toLocaleTimeString("pt-BR")}
          {isLoadingStatus && " (atualizando...)"}
        </p>
      </div>

      {/* Stat Cards */}
      {status && (
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Eventos</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {status.total_events.toLocaleString("pt-BR")}
                </p>
              </div>
              <Activity className="w-8 h-8 text-cyan-600" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Eventos Simulados</p>
                <p className="text-3xl font-bold text-purple-400">
                  {status.simulated_events.toLocaleString("pt-BR")}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Usuários Ativos</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {status.unique_simulated_users}
                </p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Produto Mais Visto</p>
                <p className="text-lg font-bold text-emerald-400 truncate">
                  {status.most_viewed_product?.product_name || "—"}
                </p>
                {status.most_viewed_product && (
                  <p className="text-xs text-slate-500">
                    {status.most_viewed_product.views} visualizações
                  </p>
                )}
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* Middle Section: Events by Type + Live Feed */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Events by Type */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Eventos por Tipo
          </h2>
          <div className="space-y-4">
            {status && Object.entries(status.events_by_type).length > 0 ? (
              Object.entries(status.events_by_type).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 capitalize">{type}</span>
                    <span className="text-slate-400 text-sm">{count}</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        eventColors[type as keyof typeof eventColors] ||
                        "bg-slate-500"
                      }`}
                      style={{
                        width: `${
                          ((count as number) / (status.total_events || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">Sem dados</p>
            )}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Feed ao Vivo
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveEvents.length > 0 ? (
              liveEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-700 rounded p-3 flex items-start gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      eventColors[
                        event.event_type as keyof typeof eventColors
                      ] || "bg-slate-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-300">
                        {event.user_label}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">
                        {event.event_type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 truncate">
                      {event.product_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">
                Sem eventos no momento
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Perfis de Usuários (10 usuários cada)
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(PROFILE_DESCRIPTIONS).map(
            ([profile, { icon, desc }]) => {
              const userCount = simUsers.filter(
                (u) => u.profile_type === profile,
              ).length;
              const totalPurchases = simUsers
                .filter((u) => u.profile_type === profile)
                .reduce((sum, u) => sum + u.total_purchases, 0);

              return (
                <div
                  key={profile}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-600 transition"
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <h3 className="font-bold capitalize text-cyan-400 mb-1">
                    {profile}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">{desc}</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>👥 {userCount} usuários</p>
                    <p>🛒 {totalPurchases} compras</p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Running Indicator */}
      {isRunning && (
        <div className="fixed bottom-8 right-8 bg-indigo-600 rounded-lg p-4 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Simulação em execução...</span>
        </div>
      )}
    </div>
  );
}
