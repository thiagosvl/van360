import { usePassageiroExternalForm } from "@/hooks/form/usePassageiroExternalForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";
import { PassageiroFormDadosCadastrais } from "@/components/features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormEndereco } from "@/components/features/passageiro/form/PassageiroFormEndereco";
import { PassageiroFormResponsavel } from "@/components/features/passageiro/form/PassageiroFormResponsavel";
import { PassageiroFormFinanceiro } from "@/components/features/passageiro/form/PassageiroFormFinanceiro";

export default function PassageiroExternalForm() {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full p-12 text-center border-none shadow-2xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Cadastro Enviado!
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
            Muito obrigado! Os dados do passageiro foram enviados para o condutor{" "}
            <span className="font-bold text-[#1a3a5c]">{motoristaApelido}</span>.
          </p>
          <div className="pt-4 space-y-4">
            <Button
              onClick={handleNewCadastro}
              className="w-full h-12 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Fazer novo cadastro
            </Button>
            <p className="text-sm text-slate-400 font-medium italic">
              Você já pode fechar esta aba com segurança.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-[#1a3a5c]/10 pb-32">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">

        <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2rem] bg-white overflow-hidden mb-12">
          {/* Top border decorativo */}
          <div className="h-2 w-full bg-gradient-to-r from-[#1a3a5c] via-[#2a5582] to-[#1a3a5c]" />

          <div className="p-6 md:p-12 relative">
            {/* Botão de Mock discreto */}
            <div className="absolute right-6 top-6 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-200 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-full transition-all"
                onClick={handleFillMock}
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Logo integrated into the card */}
            <div className="flex flex-col items-center justify-center border-b border-slate-50">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src="/assets/logo-van360.png"
                  alt="Van360"
                  className="h-12 w-auto select-none drop-shadow-sm"
                />
              </div>
              <div className="inline-flex items-center mt-4 gap-2 px-4 py-2 rounded-full bg-slate-100/80 text-slate-600 text-sm font-semibold mb-6 border border-slate-200/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-[#1a3a5c] animate-pulse" />
                Cadastro de Passageiro
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit, onFormError)}
                className="space-y-12 mt-4"
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

                <hr className="border-slate-100" />

                {/* DADOS DO RESPONSÁVEL */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-75">
                  <PassageiroFormResponsavel />
                </section>

                <hr className="border-slate-100" />

                {/* MENSALIDADE */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                  <PassageiroFormFinanceiro isExternal editingPassageiro={null} />
                </section>

                <hr className="border-slate-100" />

                {/* ENDEREÇO E OBSERVAÇÕES */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                  <PassageiroFormEndereco />
                </section>
              </form>
            </Form>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center pb-12">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Van360 • Gestão Inteligente para Transporte Escolar
          </p>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 border-t border-slate-100 backdrop-blur-md z-50">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
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
