import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, Zap, DollarSign, Leaf, Globe, Filter, Info, RefreshCw } from "lucide-react";

export default function ColombiaData() {
  // Estados para filtros
  const [demandDays, setDemandDays] = useState(7);
  const [generationDays, setGenerationDays] = useState(7);
  const [pricesDays, setPricesDays] = useState(7);
  const [emissionsDays, setEmissionsDays] = useState(30);
  const [selectedSource, setSelectedSource] = useState<"all" | "hydro" | "thermal" | "wind" | "solar">("all");

  // Consultas a las APIs de Colombia con filtros
  const { data: demandData, isLoading: loadingDemand, refetch: refetchDemand } = trpc.colombia.demand.useQuery({ days: demandDays });
  const { data: generationData, isLoading: loadingGeneration, refetch: refetchGeneration } = trpc.colombia.generation.useQuery({ days: generationDays });
  const { data: pricesData, isLoading: loadingPrices, refetch: refetchPrices } = trpc.colombia.prices.useQuery({ days: pricesDays });
  const { data: emissionsData, isLoading: loadingEmissions, refetch: refetchEmissions } = trpc.colombia.emissions.useQuery({ days: emissionsDays });
  const { data: energyProfile, isLoading: loadingProfile } = trpc.colombia.energyProfile.useQuery();
  const { data: regionalRenewables, isLoading: loadingRegional } = trpc.colombia.regionalRenewables.useQuery();

  // Procesar datos de demanda para gráficos
  const demandChartData = demandData?.slice(-168).map((item: any) => ({
    time: new Date(item.timestamp).toLocaleDateString("es-CO", { month: "short", day: "numeric", hour: "2-digit" }),
    demanda: Math.round(item.value),
  })) || [];

  // Procesar datos de generación por fuente
  const generationBySource = generationData?.reduce((acc: any, item: any) => {
    const time = new Date(item.timestamp).toLocaleDateString("es-CO", { month: "short", day: "numeric" });
    if (!acc[time]) {
      acc[time] = { time };
    }
    acc[time][item.source] = Math.round(item.value);
    return acc;
  }, {} as Record<string, any>);

  const generationChartData = Object.values(generationBySource || {}).slice(-24);

  // Filtrar datos de generación por fuente seleccionada
  const filteredGenerationData = selectedSource === "all" 
    ? generationChartData
    : generationChartData.map((item: any) => ({
        time: item.time,
        [selectedSource]: item[selectedSource] || 0,
      }));

  // Procesar datos de precios
  const pricesChartData = pricesData?.slice(-168).map((item: any) => ({
    time: new Date(item.timestamp).toLocaleDateString("es-CO", { month: "short", day: "numeric", hour: "2-digit" }),
    precio: Math.round(item.price),
  })) || [];

  // Procesar datos de emisiones
  const emissionsChartData = emissionsData?.map((item: any) => ({
    fecha: new Date(item.timestamp).toLocaleDateString("es-CO", { month: "short", day: "numeric" }),
    co2: Math.round(item.co2),
    co2eq: Math.round(item.co2eq),
  })) || [];

  // Procesar comparación regional
  const regionalChartData = regionalRenewables?.map((item: any) => ({
    pais: item.country,
    renovables: Math.round(item.value * 10) / 10,
  })) || [];

  // Calcular estadísticas actuales
  const currentDemand = demandData?.[demandData.length - 1]?.value || 0;
  const avgPrice = (pricesData && pricesData.length > 0) 
    ? pricesData.reduce((sum: number, item: any) => sum + item.price, 0) / pricesData.length
    : 0;
  const totalEmissions = emissionsData?.[emissionsData?.length - 1]?.co2 || 0;

  // Calcular porcentaje de renovables
  const renewablePercentage = energyProfile?.RENEWABLE_ELECTRICITY?.value || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Datos del Sistema Eléctrico Colombiano</h1>
        <p className="text-muted-foreground mt-2">
          Información del Sistema Interconectado Nacional (SIN) - Fuente: XM y World Bank
        </p>
      </div>

      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Datos Simulados</AlertTitle>
        <AlertDescription>
          Los datos mostrados son simulaciones basadas en patrones reales del sistema eléctrico colombiano.
          Para acceder a datos reales en tiempo real, se requiere autenticación con la API de XM (SINERGOX).
        </AlertDescription>
      </Alert>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demanda Actual SIN</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Demanda del Sistema Interconectado Nacional</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(currentDemand).toLocaleString()} MW</div>
              <p className="text-xs text-muted-foreground mt-1">Tiempo real</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Precio promedio en Bolsa Nacional de Energía</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(avgPrice)} COP/kWh</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos {pricesDays} días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emisiones CO₂</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Leaf className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Emisiones totales del sector eléctrico</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalEmissions).toLocaleString()} ton</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos {emissionsDays} días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renovables</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Porcentaje de generación renovable</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{Math.round(renewablePercentage)}%</div>
              <p className="text-xs text-muted-foreground mt-1">De la matriz energética</p>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Tabs con datos */}
      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demanda</TabsTrigger>
          <TabsTrigger value="generation">Generación</TabsTrigger>
          <TabsTrigger value="prices">Precios</TabsTrigger>
          <TabsTrigger value="emissions">Emisiones</TabsTrigger>
        </TabsList>

        {/* Tab de Demanda */}
        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filtros de Demanda</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchDemand()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demand-days">Período de Tiempo</Label>
                  <Select value={demandDays.toString()} onValueChange={(v) => setDemandDays(parseInt(v))}>
                    <SelectTrigger id="demand-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Último día</SelectItem>
                      <SelectItem value="3">Últimos 3 días</SelectItem>
                      <SelectItem value="7">Última semana</SelectItem>
                      <SelectItem value="14">Últimas 2 semanas</SelectItem>
                      <SelectItem value="30">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Demanda del SIN</CardTitle>
              <CardDescription>Demanda horaria del Sistema Interconectado Nacional</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDemand ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={demandChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="demanda" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Generación */}
        <TabsContent value="generation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filtros de Generación</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchGeneration()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="generation-days">Período de Tiempo</Label>
                  <Select value={generationDays.toString()} onValueChange={(v) => setGenerationDays(parseInt(v))}>
                    <SelectTrigger id="generation-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Último día</SelectItem>
                      <SelectItem value="3">Últimos 3 días</SelectItem>
                      <SelectItem value="7">Última semana</SelectItem>
                      <SelectItem value="14">Últimas 2 semanas</SelectItem>
                      <SelectItem value="30">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source-filter">Tipo de Generación</Label>
                  <Select value={selectedSource} onValueChange={(v: any) => setSelectedSource(v)}>
                    <SelectTrigger id="source-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las fuentes</SelectItem>
                      <SelectItem value="hydro">Hidráulica</SelectItem>
                      <SelectItem value="thermal">Térmica</SelectItem>
                      <SelectItem value="wind">Eólica</SelectItem>
                      <SelectItem value="solar">Solar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generación por Fuente</CardTitle>
              <CardDescription>
                {selectedSource === "all" 
                  ? "Todas las fuentes de generación" 
                  : `Generación ${selectedSource === "hydro" ? "hidráulica" : selectedSource === "thermal" ? "térmica" : selectedSource === "wind" ? "eólica" : "solar"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGeneration ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredGenerationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {selectedSource === "all" ? (
                      <>
                        <Bar dataKey="hydro" name="Hidráulica" fill="#3b82f6" stackId="a" />
                        <Bar dataKey="thermal" name="Térmica" fill="#ef4444" stackId="a" />
                        <Bar dataKey="wind" name="Eólica" fill="#10b981" stackId="a" />
                        <Bar dataKey="solar" name="Solar" fill="#f59e0b" stackId="a" />
                      </>
                    ) : (
                      <Bar 
                        dataKey={selectedSource} 
                        name={selectedSource === "hydro" ? "Hidráulica" : selectedSource === "thermal" ? "Térmica" : selectedSource === "wind" ? "Eólica" : "Solar"}
                        fill={selectedSource === "hydro" ? "#3b82f6" : selectedSource === "thermal" ? "#ef4444" : selectedSource === "wind" ? "#10b981" : "#f59e0b"}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Precios */}
        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filtros de Precios</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchPrices()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prices-days">Período de Tiempo</Label>
                  <Select value={pricesDays.toString()} onValueChange={(v) => setPricesDays(parseInt(v))}>
                    <SelectTrigger id="prices-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Último día</SelectItem>
                      <SelectItem value="3">Últimos 3 días</SelectItem>
                      <SelectItem value="7">Última semana</SelectItem>
                      <SelectItem value="14">Últimas 2 semanas</SelectItem>
                      <SelectItem value="30">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precios de Bolsa</CardTitle>
              <CardDescription>Precio horario en la Bolsa Nacional de Energía (COP/kWh)</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPrices ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pricesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="precio" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Emisiones */}
        <TabsContent value="emissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filtros de Emisiones</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchEmissions()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emissions-days">Período de Tiempo</Label>
                  <Select value={emissionsDays.toString()} onValueChange={(v) => setEmissionsDays(parseInt(v))}>
                    <SelectTrigger id="emissions-days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Última semana</SelectItem>
                      <SelectItem value="14">Últimas 2 semanas</SelectItem>
                      <SelectItem value="30">Último mes</SelectItem>
                      <SelectItem value="90">Últimos 3 meses</SelectItem>
                      <SelectItem value="180">Últimos 6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emisiones de CO₂</CardTitle>
              <CardDescription>Emisiones del sector eléctrico colombiano</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmissions ? (
                <div className="h-[300px] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={emissionsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="co2" name="CO₂" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="co2eq" name="CO₂ equivalente" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparación regional */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Comparación Regional - Suramérica</CardTitle>
          </div>
          <CardDescription>
            Porcentaje de energías renovables por país (Fuente: World Bank)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRegional ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="pais" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="renovables" name="% Renovables" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Información de las APIs */}
      <Card>
        <CardHeader>
          <CardTitle>Fuentes de Datos</CardTitle>
          <CardDescription>
            APIs utilizadas para obtener información del sistema eléctrico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">API XM (SINERGOX)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Operador del mercado energético colombiano</li>
                <li>• Datos de demanda, generación y precios del SIN</li>
                <li>• Actualización en tiempo real</li>
                <li>• Requiere autenticación para datos reales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">World Bank Data API</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Indicadores energéticos regionales</li>
                <li>• Comparación entre países de Suramérica</li>
                <li>• Datos históricos y proyecciones</li>
                <li>• Acceso público sin autenticación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
