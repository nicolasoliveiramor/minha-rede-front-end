import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import * as S from "./Login_styles";
import { Title, ErrorText, PrimaryButton } from "../styles";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!email || !username || !password || !passwordConfirm) {
      setErr("Preencha email, usuário e as duas senhas.");
      return;
    }
    if (password !== passwordConfirm) {
      setErr("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.register({
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
      });

      // Login automático após cadastro
      await api.auth.login({
        email_or_username: username || email,
        password,
      });
      await api.auth.checkAuth();

      navigate("/");
    } catch (e: any) {
      setErr(e.message || "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <S.PageCenter>
      <S.Form onSubmit={submitRegister}>
        <Title>Cadastrar</Title>
        <S.TextInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <S.TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
        />
        <S.TextInput
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nome"
        />
        <S.TextInput
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Sobrenome"
        />
        <S.TextInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
        />
        <S.TextInput
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="Confirme a senha"
          type="password"
        />
        {err && <ErrorText>{err}</ErrorText>}
        <S.ActionsRow>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </PrimaryButton>
          <PrimaryButton
            type="button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Voltar
          </PrimaryButton>
        </S.ActionsRow>
      </S.Form>
    </S.PageCenter>
  );
}