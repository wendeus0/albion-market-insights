import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const OAUTH_CANCELLED_MESSAGE = "Login cancelado. Tente novamente.";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Conectando sua conta do Discord...");

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
          state: { error: OAUTH_CANCELLED_MESSAGE },
        });
        return;
      }

      navigate("/alerts", { replace: true });
    }

    exchange().catch(() => {
      if (cancelled) return;
      setMessage("Nao foi possivel concluir o login.");
      navigate("/login", {
        replace: true,
        state: { error: OAUTH_CANCELLED_MESSAGE },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default AuthCallback;
