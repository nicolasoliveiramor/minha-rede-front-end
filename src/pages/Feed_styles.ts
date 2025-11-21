import styled from "styled-components";
import { theme } from "../styles";

export const FeedContainer = styled.div`
  display: grid;
  gap: 16px;
`;

export const ComposerForm = styled.form`
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 8px;
`;

export const Textarea = styled.textarea`
  width: 100%;
  resize: vertical;
  min-height: 72px;
  border: 1px solid ${theme.colors.border};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.15);
  }
`;

export const UploadRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PostCard = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 8px;
  position: relative;
`;

export const HeaderRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
`;

export const AuthorName = styled.div`
  font-weight: 700;
`;

export const Timestamp = styled.div`
  font-size: 12px;
  color: #657786;
`;

export const Content = styled.div`
  font-size: 14px;
`;

export const PostImage = styled.img`
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${theme.colors.border};
`;

export const ActionsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  /* novos ajustes para centralização e respiro lateral */
  justify-content: space-between;
  padding: 0 12px;
  width: 100%;
`;

export const ActionButton = styled.button<{ $variant?: "like" | "retweet" | "delete"; $active?: boolean }>`
  border: 1px solid ${theme.colors.border};
  border-radius: 999px;
  padding: 6px 10px;
  background: ${({ $active }) => ($active ? "rgba(29,161,242,0.1)" : "#fff")};
  color: ${({ $variant }) =>
    $variant === "retweet" ? "#17bf63" : $variant === "delete" ? theme.colors.danger : theme.colors.text};
  transition: background 0.15s ease;
  min-width: 96px;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: rgba(29, 161, 242, 0.08);
  }
`;

export const StatLabel = styled.span`
  color: #657786;
`;

export const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #657786;
`;

// Área de comentários
export const CommentsBox = styled.div`
  border-top: 1px solid ${theme.colors.border};
  padding-top: 8px;
  display: grid;
  gap: 8px;
`;

export const CommentsList = styled.div`
  display: grid;
  gap: 8px;
`;

export const CommentItem = styled.div`
  display: grid;
  gap: 4px;
  position: relative;
`;

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CommentAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  font-size: 12px;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
`;

export const CommentAuthor = styled.span`
  font-weight: 700;
`;

export const CommentTimestamp = styled.span`
  font-size: 12px;
  color: #657786;
`;

export const CommentContent = styled.div`
  font-size: 14px;
`;

export const CommentDeleteIcon = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${theme.colors.danger};
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: rgba(224, 36, 94, 0.1);
  }
`;

export const CommentForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CommentInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.15);
  }
`;

export const UploadButton = styled.button`
  border: 1px solid ${theme.colors.border};
  border-radius: 999px;
  padding: 6px 12px;
  background: #fff;
  color: ${theme.colors.text};
  font-weight: 600;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(29, 161, 242, 0.08);
  }
`;

export const FileName = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: #657786;
`;

export const DeleteIcon = styled.button`
  position: absolute;
  top: 10px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${theme.colors.danger};
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(224, 36, 94, 0.1);
  }
`;

// Input de arquivo invisível, porém acionável via clique programático
export const HiddenFileInput = styled.input`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
`;

// Texto do nome do usuário na lista lateral
export const UserName = styled.div`
  font-weight: 700;
`;

// Rótulo de seguidores na lista lateral
export const FollowersCount = styled.div`
  font-size: 12px;
  color: #657786;
`;

// Coluna direita com usuários
export const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;       /* garante topo alinhado entre colunas */

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div`
  display: grid;
  gap: 16px;
`;

export const RightColumn = styled.div`
  display: grid;
  gap: 16px;
  align-content: start;     /* conteúdo inicia no topo */
  justify-items: stretch;   /* filhos ocupam 100% da largura disponível */
`;

export const SidebarCard = styled.div`
  max-width: 300px;
  width: 100%;                /* ocupa toda a largura da coluna */
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 12px;  /* remove padding-right */
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  box-sizing: border-box;     /* padding/margem contabilizados na largura */
`;

export const SidebarTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
`;

export const UsersList = styled.div`
  display: grid;
  gap: 8px;
  justify-items: stretch;     /* cada linha ocupa 100% */
`;

export const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  width: 100%;                /* linhas esticadas evitam espaço sobrando */
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

export const FollowButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${theme.colors.border};
  border-radius: 999px;
  padding: 6px 10px;
  background: ${({ $active }) => ($active ? "rgba(29,161,242,0.1)" : "#fff")};
  color: ${theme.colors.text};
  transition: background 0.15s ease;
  min-width: 110px;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: rgba(29, 161, 242, 0.08);
  }
`;
