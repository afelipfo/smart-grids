import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function InitializeData() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const initializeMutation = trpc.app.initialize.useMutation({
    onSuccess: () => {
      setStatus("success");
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: () => {
      setStatus("error");
    },
  });

  const handleInitialize = () => {
    setStatus("loading");
    initializeMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <CardTitle>Inicializar Sistema</CardTitle>
          </div>
          <CardDescription>
            El sistema necesita datos iniciales para funcionar correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <p className="text-sm text-muted-foreground">
                Este proceso creará:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• 10 nodos de red eléctrica</li>
                <li>• 15 líneas de transmisión</li>
                <li>• 20 equipos (transformadores, generadores)</li>
                <li>• Datos históricos de demanda (7 días)</li>
                <li>• Fuentes de generación renovable</li>
                <li>• Mediciones en tiempo real</li>
              </ul>
              <Button onClick={handleInitialize} className="w-full" size="lg">
                Inicializar Datos
              </Button>
            </>
          )}

          {status === "loading" && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">
                Generando datos del sistema...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-semibold text-green-500">¡Datos inicializados!</p>
                <p className="text-sm text-muted-foreground">
                  Redirigiendo al dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <p className="font-semibold text-destructive">Error al inicializar</p>
                <p className="text-sm text-muted-foreground">
                  Por favor, intenta nuevamente
                </p>
              </div>
              <Button onClick={handleInitialize} className="w-full">
                Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
