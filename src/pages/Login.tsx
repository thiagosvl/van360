import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createClient } from '@supabase/supabase-js';
import { cpfCnpjMask } from '@/utils/masks';
import { useToast } from '@/hooks/use-toast';

const supabaseUrl = "https://jztyffakurtekwxurclw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dHlmZmFrdXJ0ZWt3eHVyY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkwNDMsImV4cCI6MjA3MjQyNTA0M30.n7PD7-FMXJ7ZmBUzpwu5rqHU4ak6g_pKm85pRWr551E";

const supabase = createClient(supabaseUrl, supabaseKey);

const loginSchema = z.object({
  cpfCnpj: z.string()
    .min(1, 'CPF/CNPJ é obrigatório')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 11 || digits.length === 14;
    }, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'),
  senha: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema, { mode: 'sync' }),
    defaultValues: {
      cpfCnpj: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      // Clean CPF/CNPJ to digits only
      const cpfCnpjDigits = data.cpfCnpj.replace(/\D/g, '');

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
        form.setError('cpfCnpj', {
          type: 'manual',
          message: 'Usuário não encontrado'
        });
        setLoading(false);
        return;
      }

      const usuario = usuarios[0];

      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: data.senha,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          form.setError('senha', {
            type: 'manual',
            message: 'Senha incorreta'
          });
        } else {
          form.setError('root', {
            type: 'manual',
            message: 'Erro inesperado: ' + signInError.message
          });
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
      form.setError('root', {
        type: 'manual',
        message: 'Erro inesperado'
      });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        autoComplete="username"
                        {...field}
                        onChange={(e) => {
                          const masked = cpfCnpjMask(e.target.value);
                          field.onChange(masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}