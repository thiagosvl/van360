import React from "react";
import { LegalLayout } from "./LegalLayout";
import { PrivacyPolicyContent } from "@/components/legal/PrivacyPolicyContent";
import { useSEO } from "@/hooks/useSEO";

const PrivacyPolicyPage = () => {
  useSEO({
    title: "Política de Privacidade | Van360",
    description: "Saiba como o Van360 protege seus dados e garante sua privacidade conforme a LGPD.",
  });

  return (
    <LegalLayout 
      title="Política de Privacidade" 
      subtitle="Última atualização: 01/04/2026 · Em conformidade com a LGPD"
    >
      <PrivacyPolicyContent />
    </LegalLayout>
  );
};

export default PrivacyPolicyPage;
