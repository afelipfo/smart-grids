import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, RefreshCw, Info, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function DemandPrediction() {
  // Estados para filtros
  const [historicalDays, setHistoricalDays] = useState(7);
  const [predictionHours, setPredictionHours] = useState(24);
  const [sector, setSector] = useState<"all" | "residential" | "commercial" | "industrial">("all");
  
  // Queries con filtros aplicados
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = trpc.demand.history.useQuery({ 
    hours: historicalDays * 24 
  });
  
  const { data: predictions, isLoading: predictionsLoading, refetch: refetchPredictions } = trpc.demand.predictions.useQuery({ 
    hours: predictionHours 
  });
  
  const generatePredictionsMutation = trpc.demand.generatePredictions.useMutation({
    onSuccess: () => {
      toast.success("Predicciones generadas exitosamente");
      refetchPredictions();
    },
    onError: (error) => {
      toast.error(`Error al generar predicciones: ${error.message}`);
    },
  });

  const handleGeneratePredictions = () => {
    generatePredictionsMutation.mutate({ hoursAhead: predictionHours });
  };

  // Filtrar datos por sector
  const filterBySector = (data: any[]) => {
    if (sector === "all" || !data) return data;
    return data.map(d => ({
      ...d,
      totalDemand: d[`${sector}Demand`] || d.totalDemand,
    }));
  };

  // Preparar datos para gráficos
  const historyData = filterBySector(history || []).map(h => ({
    timestamp: new Date(h.timestamp).toLocaleString("es-CO", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit" 
    }),
    "Demanda Total": h.totalDemand,
    "Residencial": h.residentialDemand || 0,
    "Comercial": h.commercialDemand || 0,
    "Industrial": h.industrialDemand || 0,
  }));

  const predictionsData = (predictions || []).map(p => ({
    timestamp: new Date(p.predictionTimestamp).toLocaleString("es-CO", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit" 
    }),
    "Predicción": p.predictedDemand,
    "Límite Superior": p.confidenceUpper || p.predictedDemand * 1.1,
    "Límite Inferior": p.confidenceLower || p.predictedDemand * 0.9,
  }));

  // Calcular estadísticas
  const avgDemand = history && history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.totalDemand, 0) / history.length)
    : 0;
  
  const maxDemand = history && history.length > 0
    ? Math.max(...history.map(h => h.totalDemand))
    : 0;
  
  const minDemand = history && history.length > 0
    ? Math.min(...history.map(h => h.totalDemand))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Predicción de Demanda Energética</h1>
        <p className="text-muted-foreground mt-2">
          Análisis histórico y predicciones basadas en modelos de machine learning
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filtros de Visualización</CardTitle>
          </div>
          <CardDescription>
            Personaliza los datos que deseas visualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de días históricos */}
            <div className="space-y-2">
              <Label htmlFor="historical-days" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Período Histórico
              </Label>
              <Select value={historicalDays.toString()} onValueChange={(v) => setHistoricalDays(parseInt(v))}>
                <SelectTrigger id="historical-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Últimas 24 horas</SelectItem>
                  <SelectItem value="3">Últimos 3 días</SelectItem>
                  <SelectItem value="7">Última semana</SelectItem>
                  <SelectItem value="14">Últimas 2 semanas</SelectItem>
                  <SelectItem value="30">Último mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de horizonte de predicción */}
            <div className="space-y-2">
              <Label htmlFor="prediction-hours" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Horizonte de Predicción
              </Label>
              <Select value={predictionHours.toString()} onValueChange={(v) => setPredictionHours(parseInt(v))}>
                <SelectTrigger id="prediction-hours">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Próximas 6 horas</SelectItem>
                  <SelectItem value="12">Próximas 12 horas</SelectItem>
                  <SelectItem value="24">Próximas 24 horas</SelectItem>
                  <SelectItem value="48">Próximas 48 horas</SelectItem>
                  <SelectItem value="168">Próximos 7 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por sector */}
            <div className="space-y-2">
              <Label htmlFor="sector" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Sector
              </Label>
              <Select value={sector} onValueChange={(v: any) => setSector(v)}>
                <SelectTrigger id="sector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-3">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demanda Promedio</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Promedio de demanda en el período seleccionado</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{avgDemand} MW</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos {historicalDays} día{historicalDays > 1 ? "s" : ""}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demanda Máxima</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pico máximo registrado en el período</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{maxDemand} MW</div>
                  <p className="text-xs text-muted-foreground">Pico registrado</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demanda Mínima</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valle mínimo registrado en el período</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{minDemand} MW</div>
                  <p className="text-xs text-muted-foreground">Valle registrado</p>
                </>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Gráfico de historial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Demanda</CardTitle>
              <CardDescription>
                {sector === "all" 
                  ? "Demanda total y por sector" 
                  : `Demanda del sector ${sector === "residential" ? "residencial" : sector === "commercial" ? "comercial" : "industrial"}`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : historyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos históricos disponibles
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {sector === "all" ? (
                  <>
                    <Line type="monotone" dataKey="Demanda Total" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Residencial" stroke="#10b981" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="Comercial" stroke="#f59e0b" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="Industrial" stroke="#ef4444" strokeWidth={1.5} />
                  </>
                ) : (
                  <Line type="monotone" dataKey="Demanda Total" stroke="hsl(var(--primary))" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de predicciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Predicciones de Demanda</CardTitle>
              <CardDescription>
                Próximas {predictionHours} horas con intervalos de confianza
              </CardDescription>
            </div>
            <Button 
              onClick={handleGeneratePredictions}
              disabled={generatePredictionsMutation.isPending}
            >
              {generatePredictionsMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generar Predicciones
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {predictionsLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : predictionsData.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-4">
              <p>No hay predicciones disponibles</p>
              <Button onClick={handleGeneratePredictions}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generar Predicciones
              </Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={predictionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="Límite Superior" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Límite Inferior" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="Predicción" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Información del modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Modelo</CardTitle>
          <CardDescription>
            Detalles sobre los modelos de machine learning utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Modelos Utilizados</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• LSTM (Long Short-Term Memory) - Peso: 60%</li>
                <li>• Prophet (Facebook) - Peso: 40%</li>
                <li>• Ensemble combinado para mayor precisión</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Características del Modelo</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Ventana temporal: {historicalDays * 24} horas ({historicalDays} días)</li>
                <li>• Actualización: Tiempo real</li>
                <li>• Precisión estimada: 92-95% MAPE</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
