import LoadingGifLight from 'assets/images/lightLoading.gif'
import LoadingGif from 'assets/images/loading.gif'
import { LoaderGif } from 'components/Icons/LoadingSpinner'
import { Connection, ConnectionType } from 'connection'
import styled from 'styled-components/macro'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'

import NewBadge from './NewBadge'

const OptionCardLeft = styled.div`
  ${flexColumnNoWrap};
  flex-direction: row;
  align-items: center;
`

const OptionCardClickable = styled.button<{ isActive?: boolean; clickable?: boolean }>`
  background-color: ${({ theme }) => theme.backgroundModule};
  width: 100% !important;
  border-color: ${({ theme, isActive }) => (isActive ? theme.accentActive : 'transparent')};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;

  margin-top: 0;
  transition: ${({ theme }) => theme.transition.duration.fast};
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  &:hover {
    cursor: ${({ clickable }) => clickable && 'pointer'};
    background-color: ${({ theme, clickable }) => clickable && theme.hoverState};
  }
  &:focus {
    background-color: ${({ theme, clickable }) => clickable && theme.hoverState};
  }
`

const HeaderText = styled.div`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.accentAction : ({ theme }) => theme.textPrimary)};
  font-size: 16px;
  font-weight: 600;
  padding: 0 8px;
`

const IconWrapper = styled.div`
  ${flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: 40px;
    width: 40px;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    align-items: flex-end;
  `};
`

type OptionProps = {
  connection: Connection
  activate: () => void
  pendingConnectionType?: ConnectionType
}
export default function Option({ connection, pendingConnectionType, activate }: OptionProps) {
  const isPending = pendingConnectionType === connection.type
  const isDarkMode = useIsDarkMode()
  const content = (
    <OptionCardClickable
      onClick={!pendingConnectionType ? activate : undefined}
      clickable={!pendingConnectionType}
      disabled={Boolean(!isPending && !!pendingConnectionType)}
      data-testid="wallet-modal-option"
    >
      <OptionCardLeft>
        <IconWrapper>
          <img src={connection.getIcon?.(isDarkMode)} alt="Icon" />
        </IconWrapper>
        <HeaderText>{connection.getName()}</HeaderText>
        {connection.isNew && <NewBadge />}
      </OptionCardLeft>
      {isPending && <LoaderGif gif={isDarkMode ? LoadingGif : LoadingGifLight} />}
    </OptionCardClickable>
  )

  return content
}
