import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import {
  useProfile,
  useSyncDiscordProfile,
  useUpdateProfile,
} from "@/hooks/useProfile";
import { getDiscordSessionIdentity } from "@/lib/discordAuth";
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
  const { profile, isLoading, error, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const syncDiscordProfile = useSyncDiscordProfile();
  const {
    mutateAsync: syncDiscordProfileAsync,
    isPending: isSyncPending,
    isError: hasSyncError,
  } = syncDiscordProfile;

  const discordIdentity = getDiscordSessionIdentity(user);
  const isDiscordProvider = discordIdentity.isDiscordProvider;
  const hasDiscordMetadata = Boolean(discordIdentity.discordId);
  const hasLinkedDiscord = Boolean(profile?.discordId);
  const isReplacementPending =
    Boolean(profile?.discordId) &&
    Boolean(discordIdentity.discordId) &&
    profile?.discordId !== discordIdentity.discordId;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { discordWebhookUrl: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ discordWebhookUrl: profile.discordWebhookUrl ?? "" });
    }
  }, [profile, form]);

  useEffect(() => {
    if (
      !profile ||
      !isDiscordProvider ||
      !hasDiscordMetadata ||
      hasLinkedDiscord ||
      isReplacementPending ||
      isSyncPending ||
      hasSyncError
    ) {
      return;
    }

    void syncDiscordProfileAsync({
      discordId: discordIdentity.discordId!,
      username: discordIdentity.username,
      discordWebhookUrl: profile.discordWebhookUrl,
    });
  }, [
    discordIdentity.discordId,
    discordIdentity.username,
    hasDiscordMetadata,
    hasLinkedDiscord,
    isDiscordProvider,
    isReplacementPending,
    profile,
    isSyncPending,
    hasSyncError,
    syncDiscordProfileAsync,
  ]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync({
        discordWebhookUrl: values.discordWebhookUrl ?? null,
      });
      toast.success("Perfil salvo com sucesso");
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  }

  async function onConfirmReplacement() {
    if (!profile || !discordIdentity.discordId) {
      toast.error("Não foi possível confirmar a troca agora");
      return;
    }

    try {
      await syncDiscordProfileAsync({
        discordId: discordIdentity.discordId,
        username: discordIdentity.username,
        discordWebhookUrl: profile.discordWebhookUrl,
      });
      toast.success("Conta Discord atualizada com sucesso");
    } catch {
      toast.error("Não foi possível confirmar a troca agora");
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

        {hasLinkedDiscord && !isReplacementPending && (
          <>
            <p className="text-sm text-muted-foreground">
              Vinculado pelo login com Discord.
            </p>
            <p className="text-sm text-muted-foreground">
              Notificações por DM estão habilitadas.
            </p>
          </>
        )}

        {isReplacementPending && (
          <>
            <p className="font-medium">Troca pendente</p>
            <p className="text-sm text-muted-foreground">
              A conta atual será trocada somente após sua confirmação.
            </p>
            <p className="text-sm text-muted-foreground">
              O vínculo atual @{profile?.discordUsername} será trocado.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void onConfirmReplacement()}
              disabled={isSyncPending}
            >
              {isSyncPending
                ? "Confirmando..."
                : "Confirmar troca"}
            </Button>
          </>
        )}

        {!hasLinkedDiscord && !isReplacementPending && !isDiscordProvider && (
          <p className="text-sm text-muted-foreground">
            Faça login com Discord para concluir a vinculação.
          </p>
        )}

        {!hasLinkedDiscord &&
          !isReplacementPending &&
          isDiscordProvider &&
          !hasDiscordMetadata && (
            <>
              <p className="text-sm text-muted-foreground">
                A vinculação não pôde ser concluída automaticamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Vinculação pendente.
              </p>
              <p className="text-sm text-muted-foreground">DM não habilitada.</p>
            </>
          )}

        {!hasLinkedDiscord &&
          !isReplacementPending &&
          isDiscordProvider &&
          hasDiscordMetadata && (
            <>
              <p className="text-sm text-muted-foreground">
                A vinculação acontece pelo login no app.
              </p>
              <p className="text-sm text-muted-foreground">
                {isError || hasSyncError
                  ? "Não foi possível concluir a vinculação agora."
                  : "DM não habilitada até a sincronização ser refletida com sucesso."}
              </p>
              {(isError || hasSyncError) && (
                <p className="text-sm text-muted-foreground">
                  O webhook continua disponível como fallback.
                </p>
              )}
            </>
          )}

        {error && !isDiscordProvider && (
          <p className="text-sm text-muted-foreground">{error.message}</p>
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
