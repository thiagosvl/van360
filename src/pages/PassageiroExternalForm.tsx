import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";
import { usePassageiroExternalForm } from "@/hooks/form/usePassageiroExternalForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InitialLoading } from "@/components/auth/InitialLoading";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";
import { PassageiroFormDadosCadastrais } from "@/components/features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormEndereco } from "@/components/features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormResponsavel } from "@/components/features/passageiro/form/PassageiroFormResponsavel";
import { PassageiroFormFinanceiro } from "@/components/features/passageiro/form/PassageiroFormFinanceiro";

export default function PassageiroExternalForm() {
  useAnalyticsInjector({ clarity: true, force: true });
  const {
    form,
    loading,
    motoristaApelido,
    submitting,
    success,
    escolasList,
    handleSubmit,
    onFormError,
    handleNewCadastro,
    handleFillMock,
  } = usePassageiroExternalForm();

  if (loading) {
    return <InitialLoading />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#e8ecf1] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 text-center bg-slate-50 border border-slate-200 shadow-xl rounded-[2.5rem] relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1a3a5c] mb-3 tracking-tight">
            Cadastro Enviado!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed text-base font-medium">
            Tudo certo! Os dados do passageiro foram enviados com sucesso ao motorista.
          </p>
          <div className="pt-2 space-y-4">
            <Button
              onClick={handleNewCadastro}
              className="w-full h-12 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Fazer novo cadastro
            </Button>
            <p className="text-xs text-slate-400 font-medium italic">
              Você já pode fechar esta aba com segurança.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8ecf1] flex flex-col justify-center items-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-[max(1rem,var(--safe-area-top))] pb-[max(5rem,var(--safe-area-bottom))]">
      <div className="w-full max-w-2xl relative z-10 space-y-6">

        <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-200">
          <div className="text-center p-6 pb-2 relative">
            {/* Botão de Mock discreto */}
            {import.meta.env.DEV && (
              <div className="absolute right-2 top-2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-full transition-all"
                  onClick={handleFillMock}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Header Logo, Title & Subtitle */}
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/assets/logo-van360.webp"
                  alt="Van360"
                  className="h-12 w-auto select-none drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a3a5c] drop-shadow-sm">
                  Cadastro de Passageiro
                </h1>
                <p className="text-slate-500 text-sm sm:text-base font-medium text-center px-4 max-w-md">
                  Preencha as informações abaixo para enviar o cadastro diretamente ao motorista.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 lg:pt-6 lg:pb-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-4"
              >
                {/* DADOS DO PASSAGEIRO */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <PassageiroFormDadosCadastrais
                    profile={null}
                    escolas={escolasList || []}
                    veiculos={[]}
                    hideVeiculo={true}
                    hideAtivo={true}
                    isExternal={true}
                  />
                </section>

                {/* DADOS DO RESPONSÁVEL */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
                  <PassageiroFormResponsavel isExternal={true} />
                </section>

                {/* PARCELAS (Ocultado temporariamente no form externo a pedido dos motoristas) */}
                {/* <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                  <PassageiroFormFinanceiro isExternal editingPassageiro={null} />
                </section> */}

                {/* ENDEREÇO E OBSERVAÇÕES */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                  <PassageiroFormEndereco isExternal={true} />
                </section>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pb-12">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © 2026 Van360 • Você só Dirige. A gente cuida da burocracia.
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/90 border-t border-slate-200 backdrop-blur-md z-50">
        <div className="max-w-2xl mx-auto px-4 md:px-0">
          <Button
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-lg shadow-lg shadow-[#1a3a5c]/20 hover:shadow-[#1a3a5c]/30 transition-all active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Concluir Cadastro"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
