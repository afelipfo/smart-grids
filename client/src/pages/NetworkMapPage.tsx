import { NetworkMap } from '@/components/NetworkMap';
import { trpc } from '@/lib/trpc';
import { Loader2, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NetworkMapPage() {
  // Consultar datos con actualización automática cada 30 segundos
  const { data: substations, isLoading: loadingSubstations, refetch: refetchSubstations } = 
    trpc.networkMap.getSubstations.useQuery(undefined, {
      refetchInterval: 30000, // 30 segundos
      refetchIntervalInBackground: true,
    });

  const { data: transmissionLines, isLoading: loadingLines, refetch: refetchLines } = 
    trpc.networkMap.getTransmissionLines.useQuery(undefined, {
      refetchInterval: 30000, // 30 segundos
      refetchIntervalInBackground: true,
    });

  const handleRefresh = async () => {
    await Promise.all([refetchSubstations(), refetchLines()]);
  };

  if (loadingSubstations || loadingLines) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando mapa de red eléctrica...</p>
        </div>
      </div>
    );
  }

  if (!substations || !transmissionLines) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No se pudieron cargar los datos</h3>
          <p className="text-muted-foreground">
            Por favor, intenta nuevamente más tarde
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Mapa de Red Eléctrica</h1>
        <p className="text-muted-foreground">
          Visualización en tiempo real del Sistema Interconectado Nacional (SIN) de Colombia
        </p>
      </div>

      <NetworkMap
        substations={substations}
        transmissionLines={transmissionLines}
        onRefresh={handleRefresh}
        autoRefresh={true}
        refreshInterval={30}
      />

      <div className="mt-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Información del Mapa</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • Los datos se actualizan automáticamente cada 30 segundos
            </p>
            <p>
              • Haz clic en las subestaciones y líneas para ver información detallada
            </p>
            <p>
              • Los colores indican el estado operativo: verde (normal), amarillo (congestionado), rojo (sobrecargado)
            </p>
            <p>
              • STN: Sistema de Transmisión Nacional (≥220 kV) | STR: Sistema de Transmisión Regional (&lt;220 kV)
            </p>
            <p>
              • Fuente de datos: XM - Operador del Mercado Energético Colombiano
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
