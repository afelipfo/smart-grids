import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, AlertTriangle, CheckCircle, Clock, Search, Filter, Info, ArrowUpDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function PredictiveMaintenance() {
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "operational" | "maintenance" | "faulty">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "failureProbability" | "lastMaintenance">("failureProbability");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: equipment, isLoading } = trpc.equipment.list.useQuery();
  const utils = trpc.useUtils();

  const handlePredictFailures = () => {
    toast.promise(
      utils.maintenance.predictFailures.fetch(),
      {
        loading: "Analizando equipos...",
        success: "Predicciones actualizadas",
        error: "Error al actualizar predicciones",
      }
    );
  };

  // Aplicar filtros y ordenamiento
  const filteredEquipment = (equipment || [])
    .filter(eq => {
      // Filtro de búsqueda
      if (searchQuery && !eq.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Filtro de estado
      if (statusFilter !== "all" && eq.status !== statusFilter) {
        return false;
      }
      // Filtro de tipo
      if (typeFilter !== "all" && eq.equipmentType !== typeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "failureProbability") {
        comparison = (a.failureProbability || 0) - (b.failureProbability || 0);
      } else if (sortBy === "lastMaintenance") {
        const dateA = a.lastMaintenanceDate ? new Date(a.lastMaintenanceDate).getTime() : 0;
        const dateB = b.lastMaintenanceDate ? new Date(b.lastMaintenanceDate).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Estadísticas
  const totalEquipment = equipment?.length || 0;
  const operationalCount = equipment?.filter(eq => eq.status === "operational").length || 0;
  const maintenanceCount = equipment?.filter(eq => eq.status === "maintenance").length || 0;
  const highRiskCount = equipment?.filter(eq => (eq.failureProbability || 0) >= 70).length || 0;

  // Función para obtener color según probabilidad
  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-red-500";
    if (prob >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  // Función para obtener badge de estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Operacional</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Mantenimiento</Badge>;
      case "faulty":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Falla</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Función para obtener nivel de riesgo
  const getRiskLevel = (prob: number) => {
    if (prob >= 70) return { label: "Crítico", variant: "destructive" as const, color: "bg-red-500" };
    if (prob >= 50) return { label: "Alto", variant: "default" as const, color: "bg-orange-500" };
    if (prob >= 30) return { label: "Medio", variant: "secondary" as const, color: "bg-yellow-500" };
    return { label: "Bajo", variant: "secondary" as const, color: "bg-green-500" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mantenimiento Predictivo</h1>
          <p className="text-muted-foreground mt-2">
            Monitoreo y predicción de fallos en equipos críticos de la red
          </p>
        </div>
        <Button onClick={handlePredictFailures}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Actualizar Predicciones
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Número total de equipos monitoreados</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEquipment}</div>
              <p className="text-xs text-muted-foreground">Equipos en sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operacionales</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{operationalCount}</div>
              <p className="text-xs text-muted-foreground">
                {totalEquipment > 0 ? Math.round((operationalCount / totalEquipment) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{maintenanceCount}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Equipos con probabilidad de fallo &gt; 70%</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{highRiskCount}</div>
              <p className="text-xs text-muted-foreground">Prioridad crítica</p>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </div>
          <CardDescription>
            Encuentra equipos específicos y ordena por prioridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda por nombre */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search">Buscar Equipo</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre del equipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="faulty">Con Falla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="transformer">Transformador</SelectItem>
                  <SelectItem value="generator">Generador</SelectItem>
                  <SelectItem value="breaker">Interruptor</SelectItem>
                  <SelectItem value="capacitor">Capacitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div className="space-y-2">
              <Label htmlFor="sort">Ordenar Por</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="failureProbability">Riesgo</SelectItem>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="lastMaintenance">Último Mant.</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de equipos */}
      <Card>
        <CardHeader>
          <CardTitle>Equipos Monitoreados</CardTitle>
          <CardDescription>
            {filteredEquipment.length} equipo{filteredEquipment.length !== 1 ? "s" : ""} encontrado{filteredEquipment.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron equipos con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEquipment.map(eq => {
                const failureProb = eq.failureProbability || 0;
                const healthScore = eq.healthScore || 0;
                const risk = getRiskLevel(failureProb);

                return (
                  <div
                    key={eq.id}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className={`h-3 w-3 rounded-full ${risk.color}`} />
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{eq.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {eq.equipmentType}
                        </Badge>
                        {getStatusBadge(eq.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {eq.manufacturer} {eq.model}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Salud:</span>
                        <span className="text-sm font-bold">{healthScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Fallo:</span>
                        <span className={`text-sm font-bold ${getProbabilityColor(failureProb)}`}>
                          {failureProb}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground">Último mantenimiento</p>
                      <p className="text-xs font-medium">
                        {eq.lastMaintenanceDate
                          ? new Date(eq.lastMaintenanceDate).toLocaleDateString("es-CO")
                          : "N/A"}
                      </p>
                    </div>

                    <Badge variant={risk.variant}>
                      {risk.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Predicción</CardTitle>
          <CardDescription>
            Metodología de cálculo de probabilidad de fallo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold mb-2">Algoritmo</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Random Forest Classifier</li>
                <li>• Entrenado con datos históricos de fallos</li>
                <li>• Actualización continua con nuevos datos</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Características Analizadas</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Edad del equipo y horas de operación</li>
                <li>• Historial de mantenimiento</li>
                <li>• Temperatura y vibración</li>
                <li>• Factor de carga promedio</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Niveles de Riesgo:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Bajo (0-29%): Operación normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Medio (30-49%): Monitoreo frecuente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-muted-foreground">Alto (50-69%): Planificar mantenimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Crítico (70-100%): Mantenimiento urgente</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
