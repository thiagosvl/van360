import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Configurações
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Configs.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta área será desenvolvida em breve para configurações do
              sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
