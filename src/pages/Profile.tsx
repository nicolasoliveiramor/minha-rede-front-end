import { useEffect, useState, useRef } from "react";
import { api, mediaUrl, type AuthUser } from "../api/client";
import { Title, ErrorText, SuccessText, PrimaryButton } from "../styles";
import * as LS from "./Login_styles";
import {
  UploadButton as FeedUploadButton,
  FileName as FeedFileName,
  UserName,
} from "./Feed_styles";
import {
  ProfileContainer,
  FollowingSection,
  FollowingList,
  FollowingRow,
  SmallAvatarPreview,
  HiddenFileInput,
} from "./Profile_styles";

type Props = {
  onUpdated?: (user: AuthUser) => void;
};

export default function Profile({ onUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  // Novos estados
  const [bio, setBio] = useState("");
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [followingUsers, setFollowingUsers] = useState<
    Array<{ id: number; username: string; profile_picture: string | null }>
  >([]);
  const [followingLoading, setFollowingLoading] = useState(false);

  // State para alterar a senha de usuário
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [passOk, setPassOk] = useState<string | null>(null);

  useEffect(() => {
    api.auth
      .profile()
      .then(async (u) => {
        setUsername(u.username || "");
        setEmail(u.email || "");
        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
        setBio(u.bio || "");
        setProfileUrl(u.profile_picture ? mediaUrl(u.profile_picture) : null);

        // Carrega quem estou seguindo
        try {
          setFollowingLoading(true);
          const list = await api.auth.following(u.id);
          const items = Array.isArray(list)
            ? list
            : Array.isArray(list?.results)
            ? list.results
            : [];
          setFollowingUsers(items);
        } catch (e) {
          console.warn("Falha ao carregar seguindo:", e);
        } finally {
          setFollowingLoading(false);
        }
      })
      .catch((e: any) => setErr(e.message || "Falha ao carregar perfil"))
      .finally(() => setLoading(false));
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setProfileFile(f);
    if (f) setProfileUrl(URL.createObjectURL(f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const resp = await api.auth.updateProfile({
        first_name: firstName,
        last_name: lastName,
        bio,
        profile_picture: profileFile || undefined,
      });
      const newUrl = resp?.user?.profile_picture
        ? mediaUrl(resp.user.profile_picture)
        : profileUrl;
      setProfileUrl(newUrl || null);
      setProfileFile(null);

      // Atualiza estado global no App para refletir na navbar
      if (resp?.user && onUpdated) onUpdated(resp.user);
    } catch (e: any) {
      setErr(e.message || "Falha ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  async function changePasswrod(e: React.FormEvent) {
    e.preventDefault();
    setPassErr(null);
    setPassOk(null);
    setPassSaving(true);

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPassErr("Preencha todos os campos");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPassErr("As senhas não coincidem");
      return;
    }

    setPassSaving(true);
    try {
      await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      setPassOk("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (e: any) {
      setPassErr(e.message || "Falha ao alterar senha");
    } finally {
      setPassSaving(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <ProfileContainer>
      <Title>Editar Perfil</Title>
      {err && <ErrorText>{err}</ErrorText>}

      <LS.Form onSubmit={save}>
        {/* Preview da foto de perfil */}
        <LS.AvatarPreview>
          {profileUrl ? (
            <img src={profileUrl} alt="Foto de perfil" />
          ) : (
            <span>{username?.[0]?.toUpperCase() || "U"}</span>
          )}
        </LS.AvatarPreview>

        {/* input de arquivo oculto + botão estilizado reaproveitado do Feed */}
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
        />
        <FeedUploadButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Escolher imagem
        </FeedUploadButton>
        {profileFile && <FeedFileName>{profileFile.name}</FeedFileName>}

        <LS.TextInput value={username} readOnly placeholder="Username" />
        <LS.TextInput value={email} readOnly placeholder="Email" />

        <LS.TextInput
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nome"
        />
        <LS.TextInput
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Sobrenome"
        />

        {/* Bio */}
        <LS.TextArea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          rows={4}
        />

        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </PrimaryButton>
      </LS.Form>

      <Title>Alterar Senha</Title>
      {passErr && <ErrorText>{passErr}</ErrorText>}
      {passOk && <SuccessText>{passOk}</SuccessText>}
      <LS.Form onSubmit={changePasswrod}>
        <LS.TextInput
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Senha atual"
        />
        <LS.TextInput
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nova senha"
        />
        <LS.TextInput
          type="password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
          placeholder="Confirmar nova senha"
        />
        <PrimaryButton type="submit" disabled={passSaving}>
          {passSaving ? "Alterando..." : "Alterar"}
        </PrimaryButton>
      </LS.Form>

      <FollowingSection>
        <Title>Seguindo</Title>
        {followingLoading && <div>Carregando...</div>}
        {followingUsers.length === 0 && !followingLoading && (
          <div>Você ainda não segue ninguém.</div>
        )}
        <FollowingList>
          {followingUsers.map((u) => (
            <FollowingRow key={u.id}>
              <SmallAvatarPreview>
                {u.profile_picture ? (
                  <img src={mediaUrl(u.profile_picture)} alt="Avatar" />
                ) : (
                  <span>{u.username?.[0]?.toUpperCase() || "U"}</span>
                )}
              </SmallAvatarPreview>
              <UserName>{u.username}</UserName>
            </FollowingRow>
          ))}
        </FollowingList>
      </FollowingSection>
    </ProfileContainer>
  );
}
