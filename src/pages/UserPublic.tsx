import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api, mediaUrl } from "../api/client"
import { Title } from "../styles"
import * as LS from "./Login_styles"

export default function UserPublic() {
  const { id } = useParams()
  const userId = Number(id)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.auth.userDetail(userId)
      .then(setUser)
      .catch((e: any) => setErr(e.message || "Falha ao carregar usuário"))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div>Carregando...</div>
  if (err) return <div>{err}</div>
  if (!user) return <div>Usuário não encontrado</div>

  return (
    <div>
      <Title>Perfil de {user.username}</Title>
      <LS.AvatarPreview>
        {user.profile_picture ? (
          <img src={mediaUrl(user.profile_picture)} alt="Avatar" />
        ) : (
          <span>{user.username?.[0]?.toUpperCase() || "U"}</span>
        )}
      </LS.AvatarPreview>
      <div style={{ marginTop: 12, fontWeight: 700 }}>{user.first_name} {user.last_name}</div>
      <div style={{ marginTop: 6 }}>{user.bio || ""}</div>
      <div style={{ marginTop: 8, color: "#657786" }}>Seguidores • {user.followers_count} | Seguindo • {user.following_count}</div>
      <div style={{ marginTop: 16 }}>
        <Link to="/">Voltar ao feed</Link>
      </div>
    </div>
  )
}