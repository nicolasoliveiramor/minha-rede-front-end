import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

import * as S from "./Login_styles";

import { ErrorText, PrimaryButton, Title } from "../styles";

type Props = {
  onLogged: (data: any) => void;
};

export default function Login({ onLogged }: Props) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const data = await api.auth.login({
        email_or_username: login.trim(),
        password: password
      });
      onLogged(data);
      navigate("/");
    } catch (e: any) {
      setErr(e.message || "Falha no login");
    }
  }

  return (
    <S.PageCenter>
      <S.Form onSubmit={submit}>
        <Title>Login</Title>
        <S.TextInput
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Email ou username"
        />
        <S.TextInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
        />
        {err && <ErrorText>{err}</ErrorText>}
        <S.ActionsRow>
          <PrimaryButton type="submit">Entrar</PrimaryButton>
          <PrimaryButton
            type="button"
            onClick={() => navigate("/register")}
          >
            Cadastrar
          </PrimaryButton>
        </S.ActionsRow>
      </S.Form>
    </S.PageCenter>
  );
}
