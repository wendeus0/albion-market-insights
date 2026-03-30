import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";

interface LoginLocationState {
  error?: string;
}

const Login = () => {
  const { signInWithDiscord, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/alerts", { replace: true });
    }
  }, [user, loading, navigate]);

  const callbackError = useMemo(() => {
    return (location.state as LoginLocationState | null)?.error ?? null;
  }, [location.state]);

  async function onDiscordLogin() {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const error = await signInWithDiscord();

      if (error) {
        setServerError(error.message);
      }
    } catch {
      setServerError("Nao foi possivel iniciar o login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground" role="status">
          Carregando...
        </p>
      </div>
    );
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
          <p className="text-sm text-destructive" role="alert">
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
