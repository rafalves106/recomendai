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

// ✅ Nomes corretos dos perfis (corrigidos de casual/active/bargain/etc)
const PROFILE_DESCRIPTIONS: Record<string, { icon: string; desc: string }> = {
  tech_enthusiast: { icon: "💻", desc: "Foco em eletrônicos, compra eventual" },
  fashion_shopper: { icon: "👗", desc: "Moda e acessórios, compra impulsiva" },
  home_decor_lover: { icon: "🏠", desc: "Casa e decoração, alta conversão" },
  bargain_hunter: { icon: "🎯", desc: "Busca promoções, abandona carrinho" },
  loyal_customer: { icon: "⭐", desc: "Eletrônicos + Casa, alta fidelidade" },
};

export default function AdminSimulationPage() {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [simUsers, setSimUsers] = useState<SimulatedUser[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

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

  const loadUsers = async () => {
    try {
      const data = await getSimulatedUsers();
      setSimUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  const loadLiveEvents = async () => {
    try {
      const data = await fetchLiveEvents();
      setLiveEvents(data.slice(0, 20));
    } catch (error) {
      console.error("Failed to load events", error);
    }
  };

  const triggerBatch = async (clear: boolean) => {
    setIsRunning(true);
    try {
      await triggerBatchSimulation(clear, 0.05);

      let elapsed = 0;
      const pollInterval = setInterval(async () => {
        elapsed += 1500;
        await loadStatus();
        await loadLiveEvents();
        if (elapsed >= 60000) {
          clearInterval(pollInterval);
          setIsRunning(false);
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to trigger simulation", error);
      setIsRunning(false);
    }
  };

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
    loadUsers();
  }, []);

  // ✅ Polling mais rápido: 1500ms em vez de 3000ms
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLiveEvents();
    const interval = setInterval(loadLiveEvents, 1500);
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

  const eventLabels: Record<string, string> = {
    view: "Visualização",
    purchase: "Compra",
    add_to_cart: "Adicionou ao Carrinho",
    click: "Clique",
    remove_from_cart: "Removeu do Carrinho",
    search: "Busca",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Simulação de Usuários</h1>
              <p className="text-slate-400 text-sm mt-1">
                Gere comportamento sintético para alimentar o motor de IA
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => triggerBatch(false)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg transition"
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Executando..." : "Executar"}
            </button>
            <button
              onClick={() => triggerBatch(true)}
              disabled={isRunning}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-4 py-2 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Resetar + Simular
            </button>
            <button
              onClick={handleClear}
              disabled={isRunning}
              className="flex items-center gap-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 px-4 py-2 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Atualizado em {lastRefresh.toLocaleTimeString("pt-BR")}
          {isLoadingStatus && " · atualizando..."}
        </p>
      </div>

      {/* Stat Cards */}
      {status && (
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
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
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Produto Mais Visto</p>
                <p className="text-lg font-bold text-emerald-400 truncate max-w-[160px]">
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

      {/* Eventos por Tipo + Feed ao Vivo */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Eventos por Tipo */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Eventos por Tipo
          </h2>
          <div className="space-y-4">
            {status && Object.entries(status.events_by_type).length > 0 ? (
              Object.entries(status.events_by_type)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">
                        {eventLabels[type] ?? type}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {(count as number).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          eventColors[type] ?? "bg-slate-500"
                        }`}
                        style={{
                          width: `${((count as number) / (status.total_events || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-center py-4">Sem dados ainda</p>
            )}
          </div>
        </div>

        {/* Feed ao Vivo */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Feed ao Vivo
            {/* ✅ Indicador pulsante de atividade */}
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {liveEvents.length > 0 ? (
              liveEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-700/60 rounded-xl p-3 flex items-start gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      eventColors[event.event_type] ?? "bg-slate-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-300 shrink-0">
                        {event.user_label}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {eventLabels[event.event_type] ?? event.event_type}
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
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Nenhum evento ainda.</p>
                <p className="text-slate-600 text-xs mt-1">
                  Execute a simulação para ver o feed ao vivo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Perfis de Usuário */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Perfis de Usuários Simulados
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(PROFILE_DESCRIPTIONS).map(
            ([profile, { icon, desc }]) => {
              const usersOfProfile = simUsers.filter(
                (u) => u.profile_type === profile,
              );
              const userCount = usersOfProfile.length;
              const totalPurchases = usersOfProfile.reduce(
                (sum, u) => sum + u.total_purchases,
                0,
              );

              return (
                <div
                  key={profile}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-cyan-600/50 transition"
                >
                  <div className="text-3xl mb-2">{icon}</div>
                  <h3 className="font-bold text-cyan-400 text-sm mb-1 capitalize">
                    {profile.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {desc}
                  </p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>👥 {userCount || 10} usuários</p>
                    <p>🛒 {totalPurchases} compras</p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Indicador de execução */}
      {isRunning && (
        <div className="fixed bottom-8 right-8 bg-indigo-600 rounded-xl p-4 flex items-center gap-3 shadow-2xl">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="font-medium">Simulação em execução...</span>
        </div>
      )}
    </div>
  );
}
