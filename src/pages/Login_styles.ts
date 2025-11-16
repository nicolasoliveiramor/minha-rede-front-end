import styled from "styled-components";

import { theme } from "../styles";

export const PageCenter = styled.div`
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Form = styled.form`
  display: grid;
  gap: 12px;
`;
export const TextInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.15);
  }
`;

// Área de texto para Bio
export const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.15);
  }
`;

// Preview de avatar
export const AvatarPreview = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  > span {
    font-weight: 600;
    color: ${theme.colors.text};
  }
`;

// Linha de ações dentro do formulário (alinha os botões)
export const ActionsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  > button {
    width: 100%;
  }
`;
