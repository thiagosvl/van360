import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { PagamentoSucessoDialog } from "@/components/dialogs/PagamentoSucessoDialog";
import { PlanSelectionStep } from "@/components/features/register/steps/PlanSelectionStep";
import { RegistrationFormStep } from "@/components/features/register/steps/RegistrationFormStep";
import { useRegisterController } from "@/hooks/register/useRegisterController";
import { useSEO } from "@/hooks/useSEO";
import { Loader2 } from "lucide-react";

export default function Register() {
  useSEO({
    noindex: false,
    title: "Cadastro - Van360 | Crie sua conta grátis",
    description: "Cadastre-se no Van360 e comece a gerenciar seu transporte escolar. Planos gratuitos e pagos disponíveis. Sem fidelidade.",
  });

  const {
    form,
    loading,
    currentStep,
    setCurrentStep,
    planosDataTyped,
    loadingPlanos,
    selectedPlanoId,
    selectedSubPlanoId,
    selectedPlano,
    selectedSubPlano,
    quantidadePersonalizada,
    setQuantidadePersonalizada,
    isCalculandoPreco,
    precoCalculadoPreview,
    pagamentoDialog,
    setPagamentoDialog,
    pagamentoSucessoDialog,
    setPagamentoSucessoDialog,
    handleNextStep,
    handleSelectSubPlano,
    handleQuantidadePersonalizadaConfirm,
    handlePaymentSuccess,
    getQuantidadeMinima,
    requiresPayment,
  } = useRegisterController();

  const finalStep = 2;

  // Render Logic
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PlanSelectionStep
            form={form}
            loadingPlanos={loadingPlanos}
            planosDataTyped={planosDataTyped}
            selectedPlanoId={selectedPlanoId}
            selectedSubPlanoId={selectedSubPlanoId}
            quantidadePersonalizada={quantidadePersonalizada}
            setQuantidadePersonalizada={setQuantidadePersonalizada}
            precoCalculadoPreview={precoCalculadoPreview}
            isCalculandoPreco={isCalculandoPreco}
            getQuantidadeMinima={getQuantidadeMinima}
            handleSelectSubPlano={handleSelectSubPlano}
            handleQuantidadePersonalizadaConfirm={handleQuantidadePersonalizadaConfirm}
            handleNextStep={handleNextStep}
          />
        );
      case 2:
        return (
          <RegistrationFormStep
            form={form}
            loading={loading}
            selectedPlano={selectedPlano}
            requiresPayment={requiresPayment}
            onBack={() => {
                setCurrentStep(1);
                form.clearErrors();
            }}
            onNext={async () => {
                await handleNextStep();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {currentStep === 1 && "Escolha o plano ideal"}
            {currentStep === 2 && "Crie sua conta"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentStep === 1 && "Comece grátis ou potencialize sua gestão com automação."}
            {currentStep === 2 && "Preencha seus dados para acessar o sistema."}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Progress Bar */}
          <div className="relative h-1.5 bg-gray-100 w-full">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `${(currentStep / finalStep) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            {/* Step Indicator Text */}
            <div className="flex items-center justify-between mb-8 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <span>Passo {currentStep} de {finalStep}</span>
              <span>
                {currentStep === 1 && "Plano"}
                {currentStep === 2 && "Cadastro"}
              </span>
            </div>

            {loadingPlanos ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-gray-500">Carregando planos...</p>
              </div>
            ) : (
              renderStep()
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Van360. Todos os direitos reservados.
          </p>
        </div>
      
      {/* Dialogs */}

      
      {pagamentoDialog && pagamentoDialog.cobrancaId && (
        <PagamentoAssinaturaDialog
          isOpen={pagamentoDialog.isOpen}
          onClose={() => setPagamentoDialog(null)}
          cobrancaId={String(pagamentoDialog.cobrancaId)}
          valor={Number(pagamentoDialog.valor || 0)}
          onPaymentSuccess={handlePaymentSuccess}
          usuarioId={undefined}
          nomePlano={selectedPlano?.nome}
          quantidadeAlunos={
            selectedSubPlano
              ? selectedSubPlano.franquia_cobrancas_mes
              : form.getValues("quantidade_personalizada")
              ? form.getValues("quantidade_personalizada")
              : undefined
          }
          context="register"
          onIrParaInicio={async () => {
            await handlePaymentSuccess();
            setPagamentoDialog(null);
            // navigate is handled inside handlePaymentSuccess/onSuccess logic usually, but here manually
          }}
          onIrParaAssinatura={async () => {
             // same
            await handlePaymentSuccess();
            setPagamentoDialog(null);
          }}
        />
      )}

      {pagamentoSucessoDialog.isOpen && (
        <PagamentoSucessoDialog
          isOpen={pagamentoSucessoDialog.isOpen}
          onClose={() => setPagamentoSucessoDialog({ isOpen: false })}
          nomePlano={pagamentoSucessoDialog.nomePlano || ""}
          quantidadeAlunos={pagamentoSucessoDialog.quantidadeAlunos || 0}
        />
      )}

    </div>
    </div>
  );
}
