import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    setSignupMessage(null);

    if (isSignUp) {
      const error = await signUp(values.email, values.password);

      if (error) {
        setServerError(error.message);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/alerts');
        return;
      }

      setSignupMessage('Conta criada. Verifique seu email para confirmar o cadastro antes de entrar.');
      return;
    }

    const error = await signIn(values.email, values.password);

    if (error) {
      setServerError(error.message);
      return;
    }
    navigate('/alerts');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-6">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? 'Criar conta' : 'Entrar'}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            {signupMessage && (
              <p className="text-sm text-muted-foreground">{signupMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? isSignUp ? 'Cadastrando...' : 'Entrando...'
                : isSignUp ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Button
            variant="ghost"
            type="button"
            onClick={() => setIsSignUp((v) => !v)}
          >
            {isSignUp ? 'Já tenho conta' : 'Criar conta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
