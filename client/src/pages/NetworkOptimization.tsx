import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Network, Play, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function NetworkOptimization() {
  const [objectives, setObjectives] = useState({
    minimizeLosses: true,
    minimizeCosts: true,
    maximizeRenewables: true,
    balanceLoad: true,
  });

  const { data: topology, isLoading: topologyLoading } = trpc.grid.topology.useQuery();
  const { data: history } = trpc.optimization.history.useQuery({ limit: 5 });

  const optimizeMutation = trpc.optimization.optimizePowerFlow.useMutation({
    onSuccess: (result) => {
      toast.success(`Optimización completada: $${result.estimatedSavings.toLocaleString()} en ahorros estimados`);
    },
    onError: (error) => {
      toast.error("Error en optimización: " + error.message);
    },
  });

  const handleOptimize = () => {
    optimizeMutation.mutate(objectives);
  };

  if (topologyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const latestOptimization = optimizeMutation.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optimización de Redes</h1>
          <p className="text-muted-foreground">
            Algoritmos de flujo de potencia óptimo y reconfiguración de red
          </p>
        </div>
      </div>

      {/* Configuración de objetivos */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos de Optimización</CardTitle>
          <CardDescription>Seleccione los objetivos para el algoritmo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="minimizeLosses"
                checked={objectives.minimizeLosses}
                onCheckedChange={(checked) =>
                  setObjectives({ ...objectives, minimizeLosses: checked as boolean })
                }
              />
              <label
                htmlFor="minimizeLosses"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Minimizar pérdidas de transmisión
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="minimizeCosts"
                checked={objectives.minimizeCosts}
                onCheckedChange={(checked) =>
                  setObjectives({ ...objectives, minimizeCosts: checked as boolean })
                }
              />
              <label
                htmlFor="minimizeCosts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Minimizar costos operacionales
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="maximizeRenewables"
                checked={objectives.maximizeRenewables}
                onCheckedChange={(checked) =>
                  setObjectives({ ...objectives, maximizeRenewables: checked as boolean })
                }
              />
              <label
                htmlFor="maximizeRenewables"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Maximizar integración de renovables
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="balanceLoad"
                checked={objectives.balanceLoad}
                onCheckedChange={(checked) =>
                  setObjectives({ ...objectives, balanceLoad: checked as boolean })
                }
              />
              <label
                htmlFor="balanceLoad"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Balancear carga entre nodos
              </label>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending}
              size="lg"
            >
              {optimizeMutation.isPending ? (
                <>
                  <Play className="mr-2 h-4 w-4 animate-pulse" />
                  Optimizando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Ejecutar Optimización
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de optimización */}
      {latestOptimization && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ahorros Estimados</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${latestOptimization.estimatedSavings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Por año</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Objetivo</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestOptimization.objectiveValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Menor es mejor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de Ejecución</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestOptimization.executionTime}ms
                </div>
                <p className="text-xs text-muted-foreground">Algoritmo OPF</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Optimización</CardTitle>
              <CardDescription>
                Acciones sugeridas para mejorar la eficiencia de la red
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestOptimization.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <Badge
                      variant={
                        rec.priority === "high"
                          ? "destructive"
                          : rec.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {rec.priority === "high"
                        ? "Alta"
                        : rec.priority === "medium"
                        ? "Media"
                        : "Baja"}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {rec.type === "redistribute_load"
                          ? "Redistribuir Carga"
                          : rec.type === "adjust_voltage"
                          ? "Ajustar Voltaje"
                          : rec.type === "switch_line"
                          ? "Reconfigurar Línea"
                          : "Aumentar Renovables"}
                      </p>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Impacto estimado: {rec.estimatedImpact.toFixed(2)} MW
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Topología de red */}
      <Card>
        <CardHeader>
          <CardTitle>Topología de la Red</CardTitle>
          <CardDescription>
            {topology?.nodes.length || 0} nodos, {topology?.lines.length || 0} líneas de transmisión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold mb-3">Nodos de Red</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topology?.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span className="font-medium">{node.name}</span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {node.voltage} kV | {node.capacity} MW
                      </p>
                      <Badge variant={node.status === "active" ? "default" : "secondary"} className="text-xs">
                        {node.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Líneas de Transmisión</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topology?.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span className="font-medium">{line.name}</span>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {line.capacity} MW | {line.length} km
                      </p>
                      <Badge variant={line.status === "active" ? "default" : "secondary"} className="text-xs">
                        {line.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
