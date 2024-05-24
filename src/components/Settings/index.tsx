// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { Percent } from '@pollum-io/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useRef, useState } from 'react'
import { Info, Settings, X } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components/macro'

import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { useModalIsOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import { useClientSideRouter, useExpertModeManager } from '../../state/user/hooks'
import { ThemedText } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.textSecondary};
  }
`

const StyledCloseIcon = styled(X)`
  height: 24px;
  width: 24px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.textSecondary};
  }
`

const StyledMenuButton = styled.button<{ disabled: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  border-radius: 0.5rem;
  height: 20px;

  ${({ disabled }) =>
    !disabled &&
    `
    :hover,
    :focus {
      cursor: pointer;
      outline: none;
      opacity: 0.7;
    }
  `}
`
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.brandedGradient};
  /* box-shadow: ${({ theme }) => theme.deepShadow}; */
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2rem;
  right: 0rem;
  z-index: 100;
  color: ${({ theme }) => theme.textPrimary};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
  `};

  user-select: none;
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  border-radius: 20px;
`

const FlexContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`

export default function SettingsTab({ placeholderSlippage }: { placeholderSlippage: Percent }) {
  const { chainId } = useWeb3React()

  const node = useRef<HTMLDivElement | null>(null)
  const open = useModalIsOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useTheme()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [clientSideRouter, setClientSideRouter] = useClientSideRouter()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <StyledMenu ref={node}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
            <RowBetween>
              <FlexContent>
                <Info size="24" />
                <Text fontWeight={500} fontSize={20}>
                  <Trans>Are you sure?</Trans>
                </Text>
              </FlexContent>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>

            <AutoColumn gap="lg">
              <Text fontWeight={500} fontSize={20}>
                <Trans>
                  Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                  in bad rates and lost funds.
                </Trans>
              </Text>
              <Text fontWeight={600} fontSize={20}>
                <Trans>ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</Trans>
              </Text>
            </AutoColumn>
            <ButtonError
              error={true}
              padding="12px"
              onClick={() => {
                const confirmWord = t`confirm`
                if (window.prompt(t`Please type the word "${confirmWord}" to enable expert mode.`) === confirmWord) {
                  toggleExpertMode()
                  setShowConfirmation(false)
                }
              }}
            >
              <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                <Trans>Turn On Expert Mode</Trans>
              </Text>
            </ButtonError>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton
        disabled={!isSupportedChainId(chainId)}
        onClick={toggle}
        id="open-settings-dialog-button"
        aria-label={t`Transaction Settings`}
      >
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              <Trans>Settings</Trans>
            </Text>
            <TransactionSettings placeholderSlippage={placeholderSlippage} />
            <Text fontWeight={600} fontSize={14}>
              <Trans>Interface Settings</Trans>
            </Text>
            {isSupportedChainId(chainId) && (
              <RowBetween>
                <RowFixed>
                  <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.textSecondary}>
                    <Trans>Auto Router API</Trans>
                  </ThemedText.DeprecatedBlack>
                  <QuestionHelper text={<Trans>Use the Pegasys API to get faster quotes.</Trans>} />
                </RowFixed>
                <Toggle
                  id="toggle-optimized-router-button"
                  isActive={!clientSideRouter}
                  toggle={() => {
                    sendEvent({
                      category: 'Routing',
                      action: clientSideRouter ? 'enable routing API' : 'disable routing API',
                    })
                    setClientSideRouter(!clientSideRouter)
                  }}
                />
              </RowBetween>
            )}
            <RowBetween>
              <RowFixed>
                <ThemedText.DeprecatedBlack fontWeight={400} fontSize={14} color={theme.textSecondary}>
                  <Trans>Expert Mode</Trans>
                </ThemedText.DeprecatedBlack>
                <QuestionHelper
                  text={
                    <Trans>Allow high price impact trades and skip the confirm screen. Use at your own risk.</Trans>
                  }
                />
              </RowFixed>
              <Toggle
                id="toggle-expert-mode-button"
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode()
                        setShowConfirmation(false)
                      }
                    : () => {
                        toggle()
                        setShowConfirmation(true)
                      }
                }
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
