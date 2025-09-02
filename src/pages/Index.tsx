import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bus, Users, DollarSign, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Bus className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">VanControl</span>
            </div>
            <Link to="/dashboard">
              <Button>Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Organize suas cobranças com facilidade
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Sistema feito para motoristas de van escolar gerenciarem alunos e mensalidades de forma simples e intuitiva
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar Agora
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 sm:mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Gestão de Alunos
                  </h3>
                  <p className="text-muted-foreground">
                    Cadastre e organize todos os seus alunos com informações completas dos responsáveis
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Controle Financeiro
                  </h3>
                  <p className="text-muted-foreground">
                    Acompanhe os recebimentos mensais e tenha visibilidade total da sua receita
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 sm:col-span-2 lg:col-span-1">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Status das Cobranças
                  </h3>
                  <p className="text-muted-foreground">
                    Monitore facilmente quais mensalidades estão em dia, pendentes ou em atraso
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 sm:mt-20 text-center">
            <div className="bg-card border rounded-lg p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Simplifique sua gestão hoje mesmo
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Não perca mais tempo com planilhas complicadas. Nosso sistema foi pensado especialmente para motoristas de van escolar.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  Começar Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
