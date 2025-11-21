import styled, { createGlobalStyle } from "styled-components";
import { Link } from "react-router-dom";

export const theme = {
  colors: {
    primary: "#1DA1F2",
    danger: "#E0245E",
    bg: "#f7f9fc",
    text: "#0f1419",
    border: "#e6ecf0",
  },
  fonts: {
    base:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', 'DejaVu Sans', sans-serif",
  },
};

export const GlobalStyle = createGlobalStyle`
    :root { color-scheme: light; }

    * {
        box-sizing: border-box;
    }

    html, body, #root { 
        height: 100%; 
    }

    /* Fonte global sans-serif */
    html, body, button, input, textarea, select {
        font-family: ${theme.fonts.base};
    }

    body {
        margin: 0;
        background-color: ${theme.colors.bg};
        color: ${theme.colors.text};
    }

    a {
        color: ${theme.colors.primary};
    }

    button {
        cursor: pointer;
    }
`;

export const AppContainer = styled.div<{ $noPad?: boolean }>`
  max-width: 820px;
  margin: 0 auto;
  padding: ${({ $noPad }) => ($noPad ? '0' : '16px 0')};
`;

export const NavBar = styled.nav`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
`;

export const NavLink = styled(Link)`
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const PrimaryButton = styled.button`
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Title = styled.h2`
  margin: 0 0 8px 0;
  font-family: ${theme.fonts.base};
  font-size: 20px;
`;

export const ErrorText = styled.div`
  color: ${theme.colors.danger};
  font-family: ${theme.fonts.base};
  font-weight: 600;
`;

// Avatar/link para o perfil
// Componente AvatarLink
export const AvatarLink = styled(Link)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  text-decoration: none;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
`;
