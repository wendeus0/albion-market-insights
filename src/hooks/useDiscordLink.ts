import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DiscordLinkPayload {
  token: string;
  command: string;
  expiresAt: string;
}

export function useDiscordLink() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } =
        await supabase.functions.invoke<DiscordLinkPayload>(
          "generate-discord-link",
        );
      if (error) throw new Error(error.message);
      if (!data)
        throw new Error("Nao foi possivel gerar o link de vinculacao.");
      return data;
    },
  });
}
