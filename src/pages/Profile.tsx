import { useEffect, useState } from "react";
import { api, mediaUrl } from "../api/client";
import { Title, ErrorText, PrimaryButton } from "../styles";
import * as LS from "./Login_styles";
import { UploadButton as FeedUploadButton, FileName as FeedFileName } from "./Feed_styles";

type Props = {
  onUpdated?: (user: any) => void;
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

  const [followingUsers, setFollowingUsers] = useState<Array<{ id: number; username: string; profile_picture: string | null }>>([]);
  const [followingLoading, setFollowingLoading] = useState(false);

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
      const newUrl =
        resp?.user?.profile_picture
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
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
        <input
          type="file"
          accept="image/*"
          onChange={onPickFile}
          style={{ display: "none" }}
          id="profile-file-input"
        />
        <label htmlFor="profile-file-input">
          <FeedUploadButton type="button">Escolher imagem</FeedUploadButton>
        </label>
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

      <div style={{ marginTop: 16 }}>
        <Title>Seguindo</Title>
        {followingLoading && <div>Carregando...</div>}
        {followingUsers.length === 0 && !followingLoading && <div>Você ainda não segue ninguém.</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {followingUsers.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LS.AvatarPreview style={{ width: 36, height: 36 }}>
                {u.profile_picture ? (
                  <img src={mediaUrl(u.profile_picture)} alt="Avatar" />
                ) : (
                  <span>{u.username?.[0]?.toUpperCase() || "U"}</span>
                )}
              </LS.AvatarPreview>
              <div style={{ fontWeight: 700 }}>{u.username}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}