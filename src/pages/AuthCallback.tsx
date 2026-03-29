import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const OAUTH_CANCELLED_MESSAGE = "Login cancelado. Tente novamente.";
const OAUTH_EXCHANGE_FAILED_MESSAGE =
  "Nao foi possivel concluir o login. Tente novamente.";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function exchange() {
      const code = searchParams.get("code");

      if (!code) {
        navigate("/login", {
          replace: true,
          state: { error: OAUTH_CANCELLED_MESSAGE },
        });
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (error) {
        navigate("/login", {
          replace: true,
          state: { error: OAUTH_EXCHANGE_FAILED_MESSAGE },
        });
        return;
      }

      navigate("/alerts", { replace: true });
    }

    exchange().catch(() => {
      if (cancelled) return;
      navigate("/login", {
        replace: true,
        state: { error: OAUTH_EXCHANGE_FAILED_MESSAGE },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <p className="text-sm text-muted-foreground" role="status">
        Conectando sua conta do Discord...
      </p>
    </main>
  );
};

export default AuthCallback;
