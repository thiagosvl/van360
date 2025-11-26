import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

interface CarteirinhaObservacoesProps {
  obsText: string;
  isEditing: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onStartEditing: () => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CarteirinhaObservacoes = ({
  obsText,
  isEditing,
  textareaRef,
  onStartEditing,
  onTextChange,
  onSave,
  onCancel,
}: CarteirinhaObservacoesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-0 shadow-md bg-[#fffdf5] ring-1 ring-black/5 relative overflow-hidden">
        {/* Decorative top strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400/50" />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Observações
          </CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              title="Editar Observações"
              onClick={onStartEditing}
              className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-yellow-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={obsText}
              onChange={(e) => onTextChange(e.target.value)}
              rows={6}
              className="bg-white border-yellow-200 focus-visible:ring-yellow-400 resize-none text-gray-700 leading-relaxed"
              placeholder="Ex: Alergia a amendoim, deixar na casa da avó às sextas, precisa de ajuda para colocar o cinto..."
            />
          ) : obsText ? (
            <div 
              className="text-sm text-gray-700 whitespace-pre-line leading-relaxed p-1 cursor-pointer hover:bg-yellow-50/50 rounded-md transition-colors"
              onClick={onStartEditing}
              title="Clique para editar"
            >
              {obsText}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-yellow-200 rounded-xl text-muted-foreground cursor-pointer hover:bg-yellow-50 transition-colors group"
              onClick={onStartEditing}
            >
              <div className="bg-yellow-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                 <Pencil className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="font-semibold text-gray-800">Adicionar Nota</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                Toque aqui para adicionar informações importantes sobre o passageiro.
              </p>
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onSave}
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
            >
              Salvar Nota
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

