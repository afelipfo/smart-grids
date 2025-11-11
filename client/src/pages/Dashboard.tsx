import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, AlertTriangle, TrendingUp, Battery, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.app.stats.useQuery();
  const { data: alerts, isLoading: alertsLoading } = trpc.alerts.active.useQuery();
  const { data: renewableGen } = trpc.renewable.currentGeneration.useQuery();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalRenewable = renewableGen?.reduce((sum, r) => sum + r.currentGeneration, 0) || 0;
  const renewablePercentage = stats && stats.currentDemand > 0 
    ? Math.round((totalRenewable / stats.currentDemand) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Vista general del sistema de gestión de redes eléctricas inteligentes
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCapacity || 0} MW</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalNodes || 0} nodos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demanda Actual</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.currentDemand || 0} MW</div>
            <p className="text-xs text-muted-foreground">
              Factor de carga: {stats?.loadFactor || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generación Renovable</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRenewable} MW</div>
            <p className="text-xs text-muted-foreground">
              {renewablePercentage}% de la demanda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAlerts || 0}</div>
            <p className="text-xs text-destructive">
              {stats?.criticalAlerts || 0} críticas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas recientes */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recientes</CardTitle>
            <CardDescription>Eventos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${
                    alert.severity === "critical" ? "bg-destructive" :
                    alert.severity === "high" ? "bg-orange-500" :
                    alert.severity === "medium" ? "bg-yellow-500" :
                    "bg-blue-500"
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de equipos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Equipos</CardTitle>
            <CardDescription>Resumen de salud operacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">Equipos Operacionales</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.operationalEquipment || 0} de {stats?.totalEquipment || 0}
                  </p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats && stats.totalEquipment > 0
                    ? Math.round((stats.operationalEquipment / stats.totalEquipment) * 100)
                    : 0}%
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-600 transition-all"
                  style={{
                    width: stats && stats.totalEquipment > 0
                      ? `${(stats.operationalEquipment / stats.totalEquipment) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuentes Renovables</CardTitle>
            <CardDescription>Generación por tipo de fuente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {renewableGen?.map((source) => (
                <div key={source.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {source.type === "solar" ? (
                      <Battery className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Wind className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{source.currentGeneration} MW</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((source.currentGeneration / source.capacity) * 100)}% capacidad
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
