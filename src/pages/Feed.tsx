import { useState, useEffect, useRef } from "react";
import { api, mediaUrl } from "../api/client";
import { Link } from "react-router-dom";

import { Title, ErrorText } from "../styles";

import * as S from "./Feed_styles";

type Props = {
  // usuário opcional para permitir feed público
  user?: { id: number; username: string };
};

type Post = {
  id: number;
  author: number;
  author_username: string;
  author_profile_picture: string | null;
  content: string;
  image: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  retweets_count: number;
  liked_by_me: boolean;
  retweeted_by_me: boolean;
};

export default function Feed({ user }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de comentários
  type Comment = {
    id: number;
    author: number;
    author_username: string;
    author_profile_picture: string | null;
    post: number;
    content: string;
    created_at: string;
  };
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [commenting, setCommenting] = useState<Record<number, boolean>>({});
  const [busyDeleteComment, setBusyDeleteComment] = useState<Record<number, boolean>>({});

  // Lista de usuários na sidebar
  type UserItem = {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    profile_picture: string | null;
    followers_count: number;
    following_count: number;
    followed_by_me: boolean;
  };
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [busyFollow, setBusyFollow] = useState<Record<number, boolean>>({});
  const [busyDelete, setBusyDelete] = useState<Record<number, boolean>>({});

  function normalizePostsResponse(resp: any): Post[] {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray(resp.results)) return resp.results;
    if (resp && Array.isArray(resp.data)) return resp.data;
    if (resp && Array.isArray(resp.items)) return resp.items;
    if (resp && Array.isArray(resp.posts)) return resp.posts;
    return [];
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return `${days} d`;
  }

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const data = await api.posts.feed();
      setPosts(normalizePostsResponse(data));
    } catch (e: any) {
      setErr(e.message || "Falha ao carregar feed");
    }
    setLoading(false);
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await api.auth.listUsers();
      const list: UserItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setUsersList(list);
    } catch (e: any) {
      // não quebra feed; apenas loga erro
      console.warn("Falha ao carregar usuários:", e?.message || e);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    load();
    loadUsers();
  }, []);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setErr("Faça login para publicar.");
      return;
    }
    if (!content.trim() && !image) return;
    setPosting(true);
    setErr(null);
    try {
      await api.posts.create({ content, image });
      setContent("");
      setImage(null);
      await load();
    } catch (e: any) {
      setErr(e.message || "Erro ao publicar");
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(p: Post) {
    if (!user) {
      setErr("Faça login para curtir/descurtir.");
      return;
    }
    try {
      if (!p.liked_by_me) {
        await api.posts.like(p.id);
      } else {
        await api.posts.unlike(p.id);
      }
      const fresh = await api.posts.get(p.id);
      setPosts((prev) => prev.map((it) => (it.id === p.id ? { ...it, ...fresh } : it)));
    } catch (e: any) {
      setErr(e.message || "Erro ao curtir/descurtir");
    }
  }

  async function toggleRetweet(p: Post) {
    if (!user) {
      setErr("Faça login para retweetar/desretweetar.");
      return;
    }
    try {
      if (!p.retweeted_by_me) {
        await api.posts.retweet(p.id);
      } else {
        await api.posts.unretweet(p.id);
      }
      const fresh = await api.posts.get(p.id);
      setPosts((prev) => prev.map((it) => (it.id === p.id ? { ...it, ...fresh } : it)));
    } catch (e: any) {
      setErr(e.message || "Erro ao retweetar/desretweetar");
    }
  }

  // Abrir/fechar comentários e carregar ao abrir
  async function toggleComments(postId: number) {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    const isOpening = !openComments[postId];
    if (isOpening && !commentsByPost[postId]) {
      try {
        const list = await api.posts.comments(postId);
        setCommentsByPost((prev) => ({ ...prev, [postId]: list }));
      } catch (e: any) {
        setErr(e.message || "Falha ao carregar comentários");
      }
    }
  }

  async function deleteComment(commentId: number, postId: number) {
    if (!user) {
      setErr("Faça login para excluir comentários.");
      return;
    }
    setBusyDeleteComment((prev) => ({ ...prev, [commentId]: true }));
    try {
      await api.posts.deleteComment(commentId);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
      const newLen = (commentsByPost[postId]?.length || 1) - 1;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments_count: Math.max(0, newLen) } : p)));
    } catch (e: any) {
      setErr(e.message || "Erro ao excluir comentário");
    } finally {
      setBusyDeleteComment((prev) => ({ ...prev, [commentId]: false }));
    }
  }

  async function deletePost(postId: number) {
    if (!user) {
      setErr("Faça login para excluir.");
      return;
    }
    if (!window.confirm("Excluir este post?")) return;
    setBusyDelete((prev) => ({ ...prev, [postId]: true }));
    try {
      await api.posts.delete(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e: any) {
      setErr(e.message || "Erro ao excluir");
    } finally {
      setBusyDelete((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function submitComment(postId: number) {
    const text = (commentText[postId] || "").trim();
    if (!text) return;
    setCommenting((prev) => ({ ...prev, [postId]: true }));
    setErr(null);
    try {
      const newComment = await api.posts.addComment(postId, text);
      // Atualiza lista local
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])],
      }));
      // Incrementa contador do post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        )
      );
      // Limpa campo
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (e: any) {
      setErr(e.message || "Erro ao comentar");
    } finally {
      setCommenting((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function toggleFollow(u: UserItem) {
    if (!user) {
      setErr("Faça login para seguir usuários.");
      return;
    }
    setBusyFollow((prev) => ({ ...prev, [u.id]: true }));
    try {
      if (!u.followed_by_me) {
        await api.auth.follow(u.id);
        setUsersList((prev) =>
          prev.map((it) =>
            it.id === u.id
              ? { ...it, followed_by_me: true, followers_count: it.followers_count + 1 }
              : it
          )
        );
      } else {
        await api.auth.unfollow(u.id);
        setUsersList((prev) =>
          prev.map((it) =>
            it.id === u.id
              ? { ...it, followed_by_me: false, followers_count: Math.max(0, it.followers_count - 1) }
              : it
          )
        );
      }
    } catch (e: any) {
      setErr(e.message || "Erro ao seguir/desseguir");
    } finally {
      setBusyFollow((prev) => ({ ...prev, [u.id]: false }));
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <>
      <Title>Feed - {user ? user.username : "Público"}</Title>
      <S.PageGrid>
        <S.MainColumn>
          <S.FeedContainer>
            {/* Compositor de post */}
            <S.ComposerForm onSubmit={submitPost}>
              <S.Textarea
                placeholder="O que está acontecendo?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
              <S.UploadRow>
                {/* input nativo escondido */}
                <S.HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                <S.UploadButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Escolher imagem
                </S.UploadButton>
                {image && <S.FileName>{image.name}</S.FileName>}
                <S.ActionButton type="submit" disabled={posting || (!content.trim() && !image)}>
                  {posting ? "Publicando..." : "Publicar"}
                </S.ActionButton>
              </S.UploadRow>
            </S.ComposerForm>

            {/* Exibição de erros globais do feed */}
            {err && <ErrorText>{err}</ErrorText>}

            {/* Estado vazio */}
            {posts.length === 0 && (
              <S.EmptyState>Seu feed está vazio. Publique algo para começar!</S.EmptyState>
            )}

            {/* Lista de posts */}
            {posts.map((p) => (
              <S.PostCard key={p.id}>
                {(user && (p.author === user.id || p.author_username === user.username)) && (
                  <S.DeleteIcon
                    aria-label="Excluir"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      deletePost(p.id);
                    }}
                    disabled={!!busyDelete[p.id]}
                  >
                    {busyDelete[p.id] ? "…" : "×"}
                  </S.DeleteIcon>
                )}
                <S.HeaderRow>
                  <Link to={`/user/${p.author}`} style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
                    <S.Avatar>
                      {p.author_profile_picture ? (
                        <img src={mediaUrl(p.author_profile_picture)} alt="Avatar" />
                      ) : (
                        p.author_username?.[0]?.toUpperCase() || "U"
                      )}
                    </S.Avatar>
                    <div>
                      <S.AuthorName>{p.author_username}</S.AuthorName>
                      <S.Timestamp>{timeAgo(p.created_at)}</S.Timestamp>
                    </div>
                  </Link>
                </S.HeaderRow>
    
                <S.Content>{p.content}</S.Content>
                {p.image && <S.PostImage src={mediaUrl(p.image)} alt="Imagem do post" />}
    
                <S.ActionsRow>
                  <S.ActionButton
                    type="button"
                    $variant="like"
                    $active={p.liked_by_me}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(p);
                    }}
                  >
                    {p.liked_by_me ? "Descurtir" : "Curtir"} {p.likes_count}
                  </S.ActionButton>
    
                  <S.ActionButton
                    type="button"
                    $variant="retweet"
                    $active={p.retweeted_by_me}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleRetweet(p);
                    }}
                  >
                    {p.retweeted_by_me ? "Remover" : "Retweet"} {p.retweets_count}
                  </S.ActionButton>

                  <S.ActionButton
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleComments(p.id);
                    }}
                  >
                    Comentar
                  </S.ActionButton>

                  

                  <S.StatLabel>Comentários {p.comments_count}</S.StatLabel>
                </S.ActionsRow>
    
                {openComments[p.id] && (
                  <S.CommentsBox>
                    <S.CommentsList>
                      {commentsByPost[p.id]?.map((c) => (
                        <S.CommentItem key={c.id}>
                          {(user && (c.author === (user as any).id || c.author_username === (user as any).username)) && (
                            <S.CommentDeleteIcon
                              aria-label="Excluir comentário"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteComment(c.id, p.id);
                              }}
                              disabled={!!busyDeleteComment[c.id]}
                            >
                              {busyDeleteComment[c.id] ? "…" : "×"}
                            </S.CommentDeleteIcon>
                          )}
                          <S.CommentHeader>
                            <S.CommentAvatar>
                              {c.author_profile_picture ? (
                                <img src={mediaUrl(c.author_profile_picture)} alt="Avatar" />
                              ) : (
                                c.author_username?.[0]?.toUpperCase() || "U"
                              )}
                            </S.CommentAvatar>
                            <S.CommentAuthor>{c.author_username}</S.CommentAuthor>
                            <S.CommentTimestamp>{timeAgo(c.created_at)}</S.CommentTimestamp>
                          </S.CommentHeader>
                          <S.CommentContent>{c.content}</S.CommentContent>
                        </S.CommentItem>
                      ))}
                    </S.CommentsList>
    
                    <S.CommentForm
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitComment(p.id);
                      }}
                    >
                      <S.CommentInput
                        placeholder="Escreva um comentário..."
                        value={commentText[p.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                      />
                      <S.ActionButton type="submit" disabled={commenting[p.id]}>
                        {commenting[p.id] ? "Comentando..." : "Comentar"}
                      </S.ActionButton>
                    </S.CommentForm>
                  </S.CommentsBox>
                )}
              </S.PostCard>
            ))}
          </S.FeedContainer>
        </S.MainColumn>
    
        <S.RightColumn>
          <S.SidebarCard>
            <S.SidebarTitle>Usuários</S.SidebarTitle>
            {loadingUsers && <div>Carregando usuários...</div>}
            <S.UsersList>
              {usersList.map((u) => (
                <S.UserRow key={u.id}>
                  <S.UserInfo>
                    <S.UserAvatar>
                      {u.profile_picture ? (
                        <img src={mediaUrl(u.profile_picture)} alt="Avatar" />
                      ) : (
                        u.username?.[0]?.toUpperCase() || "U"
                      )}
                    </S.UserAvatar>
                    <div>
                      <Link to={`/user/${u.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <S.UserName>{u.username}</S.UserName>
                      </Link>
                      <S.FollowersCount>
                        Seguidores • {u.followers_count}
                      </S.FollowersCount>
                    </div>
                  </S.UserInfo>
                  <S.FollowButton
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFollow(u);
                    }}
                    disabled={!!busyFollow[u.id]}
                    $active={u.followed_by_me}
                  >
                    {u.followed_by_me ? "Seguindo" : "Seguir"}
                  </S.FollowButton>
                </S.UserRow>
              ))}
            </S.UsersList>
          </S.SidebarCard>
        </S.RightColumn>
      </S.PageGrid>
    </>
  );
}
