import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { WHATSAPP_STATUS } from "@/config/constants";
import { useWhatsapp } from "@/hooks/useWhatsapp";
import { Smartphone } from "lucide-react";
import { useEffect } from "react";
import { WhatsappStatusView } from "./WhatsappStatusView";

export function WhatsappConnect() {
  const { state, qrCode, isLoading, connect, disconnect, refresh, instanceName, requestPairingCode, userPhone } = useWhatsapp();

  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line

  const isConnected = state === WHATSAPP_STATUS.OPEN || state === WHATSAPP_STATUS.CONNECTED || state === WHATSAPP_STATUS.PAIRED; 
  // Só consideramos "conectando" para fins de UI (bloqueio) se tivermos um QR Code para mostrar
  // ou se estivermos de fato esperando a mutation de conectar.
  const isConnecting = ((state as string) === WHATSAPP_STATUS.CONNECTING || (state as string) === WHATSAPP_STATUS.OPEN.replace("open", "connecting")) && qrCode !== null;

  return (
    <Card className={`border-l-4 ${isConnected ? "border-l-green-500" : "border-l-orange-500"}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle>Conexão WhatsApp</CardTitle>
        </div>
        <CardDescription>
          Conecte seu WhatsApp para enviar notificações automáticas aos pais e passageiros.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <WhatsappStatusView 
            state={state}
            qrCode={qrCode}
            isLoading={isLoading}
            instanceName={instanceName}
            onConnect={connect}
            onRequestPairingCode={requestPairingCode}
            userPhone={userPhone}
          />
      </CardContent>
      {isConnected && (
        <CardFooter className="flex justify-end gap-2 bg-gray-50/50 p-4">
            <Button variant="destructive" onClick={disconnect} disabled={isLoading}>
                Desconectar
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
