import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';
import { cpfCnpjMask } from '@/utils/masks';
import { useToast } from '@/hooks/use-toast';

const supabaseUrl = "https://jztyffakurtekwxurclw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dHlmZmFrdXJ0ZWt3eHVyY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkwNDMsImV4cCI6MjA3MjQyNTA0M30.n7PD7-FMXJ7ZmBUzpwu5rqHU4ak6g_pKm85pRWr551E";

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Login() {
  const [formData, setFormData] = useState({
    cpfCnpj: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cpfCnpj') {
      setFormData(prev => ({ ...prev, [field]: cpfCnpjMask(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean CPF/CNPJ to digits only
      const cpfCnpjDigits = formData.cpfCnpj.replace(/\D/g, '');
      
      if (!cpfCnpjDigits || !formData.senha) {
        setError('CPF/CNPJ e senha são obrigatórios');
        setLoading(false);
        return;
      }

      // Find user by CPF/CNPJ in usuarios table using fetch directly
      const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?cpfcnpj=eq.${cpfCnpjDigits}&select=email,role`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      const usuarios = await response.json();

      if (!usuarios || usuarios.length === 0) {
        setError('Usuário não encontrado');
        setLoading(false);
        return;
      }

      const usuario = usuarios[0];

      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: formData.senha,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Senha incorreta');
        } else {
          setError('Erro inesperado: ' + signInError.message);
        }
        setLoading(false);
        return;
      }

      // Success - redirect will be handled by AppGate based on role
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo!',
      });

    } catch (error) {
      console.error('Login error:', error);
      setError('Erro inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com seu CPF/CNPJ e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                type="text"
                value={formData.cpfCnpj}
                onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}