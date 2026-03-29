import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";

interface LoginLocationState {
  error?: string;
}

const Login = () => {
  const { signInWithDiscord } = useAuth();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callbackError = useMemo(() => {
    return (location.state as LoginLocationState | null)?.error ?? null;
  }, [location.state]);

  async function onDiscordLogin() {
    setIsSubmitting(true);
    setServerError(null);

    const error = await signInWithDiscord();

    if (error) {
      setServerError(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Use sua conta do Discord para acessar alertas e vincular
            notificacoes por DM.
          </p>
        </div>

        {(serverError ?? callbackError) && (
          <p className="text-sm text-destructive">
            {serverError ?? callbackError}
          </p>
        )}

        <Button
          className="w-full"
          onClick={onDiscordLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Conectando com Discord..." : "Entrar com Discord"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Ao continuar, o app solicita apenas `identify` e `email` no Discord.
        </p>
      </div>
    </div>
  );
};

export default Login;
