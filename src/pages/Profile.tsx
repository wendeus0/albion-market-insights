import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useDiscordLink } from "@/hooks/useDiscordLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/sonnerToast";

const profileSchema = z.object({
  discordWebhookUrl: z
    .string()
    .url("URL inválida")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const discordLink = useDiscordLink();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { discordWebhookUrl: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ discordWebhookUrl: profile.discordWebhookUrl ?? "" });
    }
  }, [profile, form]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync({
        discordId: profile?.discordId ?? null,
        discordUsername: profile?.discordUsername ?? null,
        discordDmEnabled: profile?.discordDmEnabled ?? false,
        discordWebhookUrl: values.discordWebhookUrl ?? null,
      });
      toast.success("Perfil salvo com sucesso");
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  }

  async function onGenerateDiscordLink() {
    try {
      const payload = await discordLink.mutateAsync();
      await navigator.clipboard.writeText(payload.command);
      toast.success("Comando copiado para a area de transferencia");
    } catch {
      toast.error("Erro ao gerar o link de vinculacao");
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Email</p>
        <p className="font-medium">{user?.email}</p>
      </div>

      <div className="mb-6 rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Discord vinculado</p>
          <p className="font-medium">
            {profile?.discordUsername
              ? `@${profile.discordUsername}`
              : "Nao vinculado"}
          </p>
        </div>

        {!profile?.discordId && (
          <>
            <p className="text-sm text-muted-foreground">
              Gere um token temporario, abra o Discord e execute o comando no
              bot `AlbionMarketBot`.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateDiscordLink}
              disabled={discordLink.isPending}
            >
              {discordLink.isPending
                ? "Gerando comando..."
                : "Vincular Discord"}
            </Button>
            {discordLink.data && (
              <div className="space-y-2">
                <Input readOnly value={discordLink.data.command} />
                <p className="text-xs text-muted-foreground">
                  Expira em:{" "}
                  {new Date(discordLink.data.expiresAt).toUTCString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="discordWebhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discord Webhook URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://discord.com/api/webhooks/..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Profile;
