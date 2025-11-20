import styled from "styled-components"
import * as LS from "./Login_styles"

export const FollowingSection = styled.div`
  margin-top: 16px;
`

export const FollowingList = styled.div`
  display: grid;
  gap: 8px;
`

export const FollowingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const SmallAvatarPreview = styled(LS.AvatarPreview)`
  width: 36px;
  height: 36px;
`

export const HiddenFileInput = styled.input`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
`