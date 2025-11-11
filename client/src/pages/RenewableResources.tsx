import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wind, Sun, Droplets, Battery, Zap, TrendingUp, Filter, Info, Leaf } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function RenewableResources() {
  // Estados para filtros
  const [typeFilter, setSourceTypeFilter] = useState<"all" | "solar" | "wind" | "hydro">("all");
  const [sortBy, setSortBy] = useState<"name" | "generation" | "efficiency">("generation");

  const { data: renewableGen, isLoading } = trpc.renewable.currentGeneration.useQuery();
  const { data: stats } = trpc.app.stats.useQuery();

  // Aplicar filtros y ordenamiento
  const filteredSources = (renewableGen || [])
    .filter(source => {
      if (typeFilter === "all") return true;
      return source.type === typeFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "generation") return b.currentGeneration - a.currentGeneration;
      if (sortBy === "efficiency") return b.efficiency - a.efficiency;
      return 0;
    });

  // Calcular estadísticas
  const totalCapacity = renewableGen?.reduce((sum, r) => sum + r.capacity, 0) || 0;
  const totalGeneration = renewableGen?.reduce((sum, r) => sum + r.currentGeneration, 0) || 0;
  const avgEfficiency = renewableGen && renewableGen.length > 0
    ? Math.round(renewableGen.reduce((sum, r) => sum + r.efficiency, 0) / renewableGen.length)
    : 0;

  const penetrationRate = stats && stats.currentDemand > 0
    ? Math.round((totalGeneration / stats.currentDemand) * 100)
    : 0;

  // Estadísticas por tipo
  const solarSources = renewableGen?.filter(r => r.type === "solar") || [];
  const windSources = renewableGen?.filter(r => r.type === "wind") || [];
  const hydroSources = renewableGen?.filter(r => r.type === "hydro") || [];

  const solarGeneration = solarSources.reduce((sum, r) => sum + r.currentGeneration, 0);
  const windGeneration = windSources.reduce((sum, r) => sum + r.currentGeneration, 0);
  const hydroGeneration = hydroSources.reduce((sum, r) => sum + r.currentGeneration, 0);

  // Datos para gráfico de torta
  const pieData = [
    { name: "Solar", value: solarGeneration, color: "#f59e0b" },
    { name: "Eólica", value: windGeneration, color: "#3b82f6" },
    { name: "Hidráulica", value: hydroGeneration, color: "#10b981" },
  ].filter(d => d.value > 0);

  // Datos para gráfico de barras
  const barData = filteredSources.map(source => ({
    name: source.name,
    "Generación Actual": source.currentGeneration,
    "Capacidad": source.capacity,
  }));

  // Calcular beneficios ambientales (CO2 evitado)
  const co2Avoided = Math.round(totalGeneration * 0.5); // 0.5 ton CO2/MWh aproximado

  // Función para obtener ícono según tipo
  const getSourceIcon = (type: string) => {
    switch (type) {
      case "solar": return <Sun className="h-5 w-5 text-orange-500" />;
      case "wind": return <Wind className="h-5 w-5 text-blue-500" />;
      case "hydro": return <Droplets className="h-5 w-5 text-green-500" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  // Función para obtener badge de eficiencia
  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
    if (efficiency >= 60) return <Badge className="bg-blue-500">Buena</Badge>;
    if (efficiency >= 40) return <Badge className="bg-yellow-500">Regular</Badge>;
    return <Badge variant="destructive">Baja</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recursos Renovables</h1>
        <p className="text-muted-foreground mt-2">
          Gestión y monitoreo de generación solar, eólica e hidráulica
        </p>
      </div>

      {/* Métricas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Capacidad instalada de todas las fuentes renovables</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalCapacity} MW</div>
                  <p className="text-xs text-muted-foreground">
                    {renewableGen?.length || 0} fuentes activas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generación Actual</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generación en tiempo real de todas las fuentes</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalGeneration} MW</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCapacity > 0 ? Math.round((totalGeneration / totalCapacity) * 100) : 0}% de capacidad
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Penetración</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Battery className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Porcentaje de la demanda cubierto por renovables</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{penetrationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    De la demanda total
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Evitado</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Leaf className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Emisiones de CO₂ evitadas por generación renovable</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-500">{co2Avoided}</div>
                  <p className="text-xs text-muted-foreground">
                    Toneladas CO₂/día
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filtros de Visualización</CardTitle>
          </div>
          <CardDescription>
            Personaliza la vista de fuentes renovables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-type">Tipo de Fuente</Label>
              <Select value={typeFilter} onValueChange={(v: any) => setSourceTypeFilter(v)}>
                <SelectTrigger id="source-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fuentes</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                  <SelectItem value="wind">Eólica</SelectItem>
                  <SelectItem value="hydro">Hidráulica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-by">Ordenar Por</Label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generation">Generación Actual</SelectItem>
                  <SelectItem value="efficiency">Eficiencia</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Generación</CardTitle>
            <CardDescription>Por tipo de fuente renovable</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos de generación disponibles
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Comparación generación vs capacidad */}
        <Card>
          <CardHeader>
            <CardTitle>Generación vs Capacidad</CardTitle>
            <CardDescription>Comparación por fuente</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : barData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Generación Actual" fill="hsl(var(--primary))" />
                  <Bar dataKey="Capacidad" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fuentes individuales */}
      <Card>
        <CardHeader>
          <CardTitle>Fuentes Renovables</CardTitle>
          <CardDescription>
            {filteredSources.length} fuente{filteredSources.length !== 1 ? "s" : ""} encontrada{filteredSources.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron fuentes con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSources.map(source => {
                const utilizationRate = source.capacity > 0
                  ? Math.round((source.currentGeneration / source.capacity) * 100)
                  : 0;

                return (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(source.type)}
                          <CardTitle className="text-lg">{source.name}</CardTitle>
                        </div>
                        {getEfficiencyBadge(source.efficiency)}
                      </div>
                      <CardDescription className="capitalize">
                        {source.type === "solar" ? "Energía Solar" : 
                         source.type === "wind" ? "Energía Eólica" : 
                         "Energía Hidráulica"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Generación Actual</p>
                            <p className="text-2xl font-bold">{source.currentGeneration} MW</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Capacidad</p>
                            <p className="text-2xl font-bold">{source.capacity} MW</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Utilización</span>
                            <span className="text-sm font-medium">{utilizationRate}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${utilizationRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Eficiencia</p>
                            <p className="font-medium">{source.efficiency}%</p>
                          </div>
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium capitalize">{source.type}</p>
                        </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficios ambientales */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            <CardTitle>Beneficios Ambientales</CardTitle>
          </div>
          <CardDescription>
            Impacto positivo de la generación renovable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Emisiones Evitadas</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CO₂: {co2Avoided} toneladas/día</li>
                <li>• Equivalente a {Math.round(co2Avoided / 0.4)} árboles plantados</li>
                <li>• Equivalente a {Math.round(co2Avoided * 2.5)} km no recorridos en auto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Recursos Ahorrados</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Combustibles fósiles: {Math.round(totalGeneration * 0.3)} toneladas/día</li>
                <li>• Agua: {Math.round(totalGeneration * 1.5)} m³/día</li>
                <li>• Reducción de contaminación del aire</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-600">Contribución a Metas</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Objetivo 2030: {penetrationRate}% de {50}%</li>
                <li>• Neutralidad carbono 2050</li>
                <li>• Acuerdo de París</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
