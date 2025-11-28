const BASE_ORIGIN = (import.meta as any).env?.VITE_API_BASE_URL || ""
const BASE = BASE_ORIGIN
  ? new URL("/api", BASE_ORIGIN).toString().replace(/\/$/, "")
  : ((import.meta as any).env?.DEV ? "/api" : "")

const getCsrfTokenFromCookie = () => {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
    return token || "";
  } catch {
    return "";
  }
};

const ensureCsrf = async () => {
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) return cookieToken;
  const res = await fetch(BASE + "/auth/csrf/", { credentials: "include" });
  try {
    const data = await res.json();
    return (data && (data.csrfToken || data.csrf || data.token)) || "";
  } catch {
    return "";
  }
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  bio?: string | null;
};

export type UserSummary = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
  followed_by_me?: boolean;
};

export type UserDetail = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture: string | null;
  bio?: string | null;
  followers_count: number;
  following_count: number;
};

const request = async <T = any>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers || {});
  const method = (init.method || "GET").toUpperCase();

  if (method !== "GET") {
    const csrfHeader = headers.get("X-CSRFToken") || "";
    const csrf = csrfHeader || (await ensureCsrf());
    if (csrf && !headers.has("X-CSRFToken")) {
      headers.set("X-CSRFToken", csrf);
    }

    // Não force Content-Type quando usando FormData
    const bodyIsFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;

    if (!bodyIsFormData && init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const res = await fetch(BASE + path, {
    ...init,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("Content-Type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data as T;
};

// Converte caminho de mídia para URL absoluta do backend
export const mediaUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  // Deriva a origem a partir do BASE
  const base = new URL(BASE, window.location.origin);
  const origin = `${base.protocol}//${base.host}`;
  return `${origin}${path}`;
};

export const api = {
  auth: {
    register(payload: {
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      password: string;
      password_confirm: string;
    }) {
      return request("/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    login(payload: { email_or_username: string; password: string }) {
      return request("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    logout() {
      return request("/auth/logout/", {
        method: "POST",
      });
    },
    profile(): Promise<AuthUser> {
      return request<AuthUser>("/auth/profile/", { method: "GET" });
    },
    checkAuth() {
      return request("/auth/check-auth/", {
        method: "GET",
      });
    },
    // Atualização de perfil
    updateProfile(
      payload: Partial<{
        first_name: string;
        last_name: string;
        email: string;
        username: string;
        bio: string;
      }> & { profile_picture?: File | null }
    ) {
      if (payload.profile_picture instanceof File) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v == null) return;
          if (k === "profile_picture" && v instanceof File) form.append("profile_picture", v);
          else form.append(k, String(v));
        });
        return request("/auth/profile/", { method: "PATCH", body: form });
      }
      const { profile_picture, ...rest } = payload;
      return request("/auth/profile/", { method: "PATCH", body: JSON.stringify(rest) });
    },
    // Listar todos os usuários (exceto o logado)
    listUsers(): Promise<UserSummary[] | { results: UserSummary[] }> {
      return request("/auth/users/", { method: "GET" });
    },
    // Seguir usuário
    follow(userId: number) {
      return request(`/auth/follow/${userId}/`, { method: "POST" });
    },
    // Deixar de seguir usuário
    unfollow(userId: number) {
      return request(`/auth/follow/${userId}/`, { method: "DELETE" });
    },
    // Lista quem um usuário segue
    following(userId: number): Promise<UserSummary[] | { results: UserSummary[] }> {
      return request(`/auth/${userId}/following/`, { method: "GET" });
    },
    // Lista seguidores de um usuário
    followers(userId: number): Promise<UserSummary[] | { results: UserSummary[] }> {
      return request(`/auth/${userId}/followers/`, { method: "GET" });
    },
    // Detalhe público de um usuário por id
    userDetail(id: number): Promise<UserDetail> {
      return request<UserDetail>(`/auth/users/${id}/`, { method: "GET" });
    },
    // Alterar senha do usuário
    changePassword(payload: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) {
      return request("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  },
  posts: {
    list(params?: { ordering?: string; search?: string }) {
      const q = new URLSearchParams();
      if (params?.ordering) {
        q.set("ordering", params.ordering);
      }
      if (params?.search) {
        q.set("search", params.search);
      }
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request(`/posts/posts/${qs}`, { method: "GET" });
    },
    // Envia FormData quando houver imagem
    create(payload: { content: string; image?: File | null }) {
      if (payload.image) {
        const form = new FormData();
        form.append("content", payload.content);
        form.append("image", payload.image);
        return request("/posts/posts/", {
          method: "POST",
          body: form,
        });
      }
      return request("/posts/posts/", {
        method: "POST",
        body: JSON.stringify({ content: payload.content, image: null }),
      });
    },
    feed() {
      return request("/posts/posts/feed/", {
        method: "GET",
      });
    },
    like(id: number) {
      return request(`/posts/posts/${id}/like/`, {
        method: "POST",
      });
    },
    unlike(id: number) {
      return request(`/posts/posts/${id}/unlike/`, { method: "DELETE" });
    },
    retweet(id: number) {
      return request(`/posts/posts/${id}/retweet/`, { method: "POST" });
    },
    unretweet(id: number) {
      return request(`/posts/posts/${id}/unretweet/`, { method: "DELETE" });
    },
    comments(id: number) {
      return request(`/posts/posts/${id}/comments/`, { method: "GET" });
    },
    get(id: number) {
      return request(`/posts/posts/${id}/`, { method: "GET" });
    },
    addComment(id: number, content: string) {
      return request(`/posts/posts/${id}/comments/`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    // Excluir comentário por id
    deleteComment(commentId: number) {
      return request(`/posts/comments/${commentId}/`, { method: "DELETE" });
    },
    delete(id: number) {
      return request(`/posts/posts/${id}/`, { method: "DELETE" });
    },
  },
};
