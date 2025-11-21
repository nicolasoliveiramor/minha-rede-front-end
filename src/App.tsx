import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { api } from "./api/client";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { AppContainer, NavBar, NavLink, PrimaryButton } from "./styles";
import { AvatarLink } from "./styles";
import Register from "./pages/Register";
import { mediaUrl } from "./api/client";

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  bio?: string | null;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.auth
      .profile()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.profile_picture) {
      const url = mediaUrl(user.profile_picture);
      const img = new Image();
      img.src = url;
    }
  }, [user?.profile_picture]);

  // Verificador de sessão: redireciona ao login quando expira por inatividade
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const check = async () => {
      try {
        await api.auth.checkAuth();
      } catch {
        if (cancelled) return;
        setUser(null);
        const base = (import.meta as any).env?.VITE_APP_BASE_URL || "/login";
        window.location.href = base;
      }
    };

    // Checa a cada 20s enquanto está logado
    const intervalId = setInterval(check, 20000);
    // Checa quando volta o foco para a aba
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, navigate]);

  async function handleLogout() {
    try {
      await api.auth.logout();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  if (loading) return <div>Carregando...</div>;

  const showNavigation =
    location.pathname !== "/login" && location.pathname !== "/register";
  const onProfilePage = location.pathname === "/profile";

  return (
    <AppContainer $noPad={!showNavigation}>
      {showNavigation && user && (
        <NavBar>
          <AvatarLink to="/profile">
            {user.profile_picture ? (
              <img src={mediaUrl(user.profile_picture)} alt="Avatar" />
            ) : (
              user.username?.[0]?.toUpperCase() || "U"
            )}
          </AvatarLink>
          {onProfilePage ? (
            <NavLink to="/">Feed</NavLink>
          ) : (
            <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
          )}
        </NavBar>
      )}
      {/* rotas */}
      <Routes>
        <Route
          path="/"
          element={user ? <Feed user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={
            <Login
              onLogged={(data) => {
                // Agora o login já traz profile_picture; atualiza direto
                setUser(data.user);
              }}
            />
          }
        />
        {/* Rota de perfil */}
        <Route
          path="/profile"
          element={user ? <Profile onUpdated={(u) => setUser(u)} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </AppContainer>
  );
}

export default App;
