import React from "react";
import { LegalLayout } from "./LegalLayout";
import { TermsOfUseContent } from "@/components/legal/TermsOfUseContent";
import { useSEO } from "@/hooks/useSEO";

const TermsOfUsePage = () => {
  useSEO({
    title: "Termos de Uso | Van360",
    description: "Leia os termos e condições de uso da plataforma Van360.",
  });

  return (
    <LegalLayout 
      title="Termos de Uso" 
      subtitle="Última atualização: 01/04/2026"
    >
      <TermsOfUseContent />
    </LegalLayout>
  );
};

export default TermsOfUsePage;
