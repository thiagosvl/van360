import PlanosDialog from "@/components/dialogs/PlanosDialog";
import { createContext, ReactNode, useContext, useState } from 'react';

interface LayoutContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSubtitle: string;
  setPageSubtitle: (subtitle: string) => void;
  openPlanosDialog: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Carregando...');
  const [pageSubtitle, setPageSubtitle] = useState('Por favor, aguarde.');
  const [isPlanosDialogOpen, setIsPlanosDialogOpen] = useState(false);

  const openPlanosDialog = () => setIsPlanosDialogOpen(true);

  return (
    <LayoutContext.Provider value={{ pageTitle, setPageTitle, pageSubtitle, setPageSubtitle, openPlanosDialog }}>
      {children}
      <PlanosDialog 
        isOpen={isPlanosDialogOpen} 
        onOpenChange={setIsPlanosDialogOpen} 
      />
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};