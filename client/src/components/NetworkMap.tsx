import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Zap, Activity, AlertTriangle } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Substation {
  id: string;
  name: string;
  voltage: number;
  lat: number;
  lng: number;
  region: string;
  operator: string;
  capacity: number;
  type: 'STN' | 'STR';
  // Datos en tiempo real
  currentLoad?: number;
  status?: 'operational' | 'maintenance' | 'fault';
  temperature?: number;
}

interface TransmissionLine {
  id: string;
  name: string;
  from: string;
  to: string;
  voltage: number;
  capacity: number;
  length: number;
  type: 'Aérea' | 'Subterránea';
  // Datos en tiempo real
  currentFlow?: number;
  status?: 'normal' | 'congested' | 'overloaded';
}

interface NetworkMapProps {
  substations: Substation[];
  transmissionLines: TransmissionLine[];
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // en segundos
}

export function NetworkMap({ 
  substations, 
  transmissionLines, 
  onRefresh,
  autoRefresh = true,
  refreshInterval = 30 
}: NetworkMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<Map<string, L.Polyline>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear mapa centrado en Colombia
    const map = L.map(mapContainerRef.current).setView([4.5709, -74.2973], 6);

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Actualizar marcadores de subestaciones
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Agregar nuevos marcadores
    substations.forEach(sub => {
      const icon = createSubstationIcon(sub);
      const marker = L.marker([sub.lat, sub.lng], { icon })
        .addTo(map)
        .bindPopup(createSubstationPopup(sub));

      markersRef.current.set(sub.id, marker);
    });
  }, [substations]);

  // Actualizar líneas de transmisión
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Limpiar líneas anteriores
    linesRef.current.forEach(line => line.remove());
    linesRef.current.clear();

    // Crear mapa de subestaciones para búsqueda rápida
    const subMap = new Map(substations.map(s => [s.id, s]));

    // Agregar nuevas líneas
    transmissionLines.forEach(line => {
      const fromSub = subMap.get(line.from);
      const toSub = subMap.get(line.to);

      if (!fromSub || !toSub) return;

      const color = getLineColor(line);
      const weight = getLineWeight(line.voltage);

      const polyline = L.polyline(
        [[fromSub.lat, fromSub.lng], [toSub.lat, toSub.lng]],
        {
          color,
          weight,
          opacity: 0.7,
          dashArray: line.type === 'Subterránea' ? '10, 10' : undefined,
        }
      )
        .addTo(map)
        .bindPopup(createLinePopup(line));

      linesRef.current.set(line.id, polyline);
    });
  }, [substations, transmissionLines]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      setLastUpdate(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Panel de control */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Red Eléctrica de Colombia</p>
                <p className="text-xs text-muted-foreground">
                  Sistema Interconectado Nacional (SIN)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs font-medium">{substations.length} Subestaciones</p>
                <p className="text-xs text-muted-foreground">
                  {transmissionLines.length} Líneas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Última actualización</p>
              <p className="text-xs font-medium">
                {lastUpdate.toLocaleTimeString('es-CO')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Leyenda */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium mb-2">Tipo de Subestación</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">STN (≥220 kV)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">STR (&lt;220 kV)</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2">Estado de Línea</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <span className="text-xs">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-yellow-500"></div>
                <span className="text-xs">Congestionada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <span className="text-xs">Sobrecargada</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2">Voltaje de Línea</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-purple-500"></div>
                <span className="text-xs">500 kV</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-purple-500"></div>
                <span className="text-xs">220-230 kV</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-purple-500"></div>
                <span className="text-xs">110-115 kV</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-2">Tipo de Línea</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-500"></div>
                <span className="text-xs">Aérea</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-500" style={{ borderTop: '2px dashed' }}></div>
                <span className="text-xs">Subterránea</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Mapa */}
      <Card className="p-0 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-[600px]" />
      </Card>
    </div>
  );
}

// Funciones auxiliares

function createSubstationIcon(sub: Substation): L.DivIcon {
  const color = sub.type === 'STN' ? 'bg-red-500' : 'bg-blue-500';
  const size = sub.voltage >= 500 ? 'w-4 h-4' : sub.voltage >= 220 ? 'w-3 h-3' : 'w-2 h-2';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="${size} ${color} rounded-full border-2 border-white shadow-lg"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createSubstationPopup(sub: Substation): string {
  const loadPercentage = sub.currentLoad 
    ? Math.round((sub.currentLoad / sub.capacity) * 100)
    : 0;
  
  const statusColor = sub.status === 'operational' ? 'green' : 
                      sub.status === 'maintenance' ? 'yellow' : 'red';
  
  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-bold text-sm mb-2">${sub.name}</h3>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">Voltaje:</span>
          <span class="font-medium">${sub.voltage} kV</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Capacidad:</span>
          <span class="font-medium">${sub.capacity} MVA</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Carga actual:</span>
          <span class="font-medium">${sub.currentLoad || 0} MVA (${loadPercentage}%)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Región:</span>
          <span class="font-medium">${sub.region}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Operador:</span>
          <span class="font-medium">${sub.operator}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Tipo:</span>
          <span class="font-medium">${sub.type}</span>
        </div>
        ${sub.status ? `
          <div class="flex justify-between items-center mt-2 pt-2 border-t">
            <span class="text-gray-600">Estado:</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium" style="background-color: ${statusColor}20; color: ${statusColor}">
              ${sub.status === 'operational' ? 'Operacional' : 
                sub.status === 'maintenance' ? 'Mantenimiento' : 'Falla'}
            </span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function createLinePopup(line: TransmissionLine): string {
  const flowPercentage = line.currentFlow 
    ? Math.round((line.currentFlow / line.capacity) * 100)
    : 0;
  
  const statusText = line.status === 'normal' ? 'Normal' :
                     line.status === 'congested' ? 'Congestionada' : 'Sobrecargada';
  
  const statusColor = line.status === 'normal' ? 'green' :
                      line.status === 'congested' ? 'yellow' : 'red';
  
  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-bold text-sm mb-2">${line.name}</h3>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">Voltaje:</span>
          <span class="font-medium">${line.voltage} kV</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Capacidad:</span>
          <span class="font-medium">${line.capacity} MW</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Flujo actual:</span>
          <span class="font-medium">${line.currentFlow || 0} MW (${flowPercentage}%)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Longitud:</span>
          <span class="font-medium">${line.length} km</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Tipo:</span>
          <span class="font-medium">${line.type}</span>
        </div>
        ${line.status ? `
          <div class="flex justify-between items-center mt-2 pt-2 border-t">
            <span class="text-gray-600">Estado:</span>
            <span class="px-2 py-0.5 rounded text-xs font-medium" style="background-color: ${statusColor}20; color: ${statusColor}">
              ${statusText}
            </span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getLineColor(line: TransmissionLine): string {
  if (line.status === 'overloaded') return '#ef4444'; // red
  if (line.status === 'congested') return '#eab308'; // yellow
  return '#22c55e'; // green
}

function getLineWeight(voltage: number): number {
  if (voltage >= 500) return 4;
  if (voltage >= 220) return 2.5;
  return 1.5;
}
