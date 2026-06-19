import React from "react";
import { LegalLayout } from "./LegalLayout";
import { TermsOfUseContent } from "@/components/legal/TermsOfUseContent";
import { useSEO } from "@/hooks/useSEO";

const TermsOfUsePage = () => {
  useSEO({
    title: "Termos de Uso | Van360",
    description: "Leia os Termos de Uso da plataforma Van360 e entenda nossas políticas de serviço.",
    noindex: true,
  });

  return (
    <LegalLayout 
      title="Termos de Uso" 
    >
      <TermsOfUseContent />
    </LegalLayout>
  );
};

export default TermsOfUsePage;
