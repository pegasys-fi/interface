import { Trans } from '@lingui/macro'
import { CurrencyAmount, Token } from '@pollum-io/sdk-core'
import { useWeb3React } from '@web3-react/core'
import LoadingGifLight from 'assets/images/lightLoading.gif'
import LoadingGif from 'assets/images/loading.gif'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { LoaderGif } from 'components/Icons/LoadingSpinner'
import Row from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { isSupportedChain } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { useMigrateRollexContract, useTokenContract } from 'hooks/useContract'
import usePermit2Allowance, { AllowanceState } from 'hooks/usePermit2Allowance'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { headlineSmall } from 'nft/css/common.css'
import { useCallback, useState } from 'react'
import { Info, RefreshCcw } from 'react-feather'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components/macro'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { Z_INDEX } from 'theme/zIndex'
import invariant from 'tiny-invariant'
import { currencyAmountToPreciseFloat, formatTransactionAmount } from 'utils/formatNumbers'

const PageWrapper = styled.div`
  padding: 68px 8px 0px;

  max-width: 480px;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const MigrationWrapper = styled.main`
  position: relative;
  background: ${({ theme }) => theme.backgroundSurface};
  border-radius: 30px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 20px;
  z-index: ${Z_INDEX.deprecated_content};
  transition: transform 250ms ease;
`

const TextHeader = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  margin-right: 8px;
  display: flex;
  line-height: 20px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const ExchangeRate = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  padding-top: 16px;
  padding-bottom: 16px;
`

const BalanceInfo = styled.div`
  background: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BalanceLabel = styled.div`
  color: ${({ theme }) => theme.textSecondary};
`

const BalanceValue = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  display: flex;
  align-items: center;
`

const Placeholder = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
`

export default function Migration() {
  const theme = useTheme()
  const { account, chainId } = useWeb3React()
  const toggleWalletDrawer = useToggleAccountDrawer()
  // const currency = useCurrency('0x48023b16c3e81AA7F6eFFbdEB35Bb83f4f31a8fd') // PSYS address
  const currency = useCurrency('0xE60bD82d0faEAD2F327D8C7F15907664800452f6') // PSYS address

  // const contract = useTokenContract('0x48023b16c3e81AA7F6eFFbdEB35Bb83f4f31a8fd') // PSYS address
  const contract = useTokenContract('0xE60bD82d0faEAD2F327D8C7F15907664800452f6') // PSYS mocked
  const psysCurrency = useCurrencyBalance(account || undefined, currency || undefined)
  const amountPSYS = formatTransactionAmount(currencyAmountToPreciseFloat(psysCurrency))
  const isDarkMode = useIsDarkMode()

  const balancePSYS = useSingleCallResult(contract, 'balanceOf', [account])

  const migrationContract = useMigrateRollexContract()

  const allowance = usePermit2Allowance(
    (psysCurrency as CurrencyAmount<Token>) || undefined,
    isSupportedChain(chainId) ? migrationContract?.address : undefined
  )

  const isApprovalLoading = allowance.state === AllowanceState.REQUIRED && allowance.isApprovalLoading
  const [isAllowancePending, setIsAllowancePending] = useState(false)

  const [{ showTransactionModal, transactionErrorMessage, attemptingTxn, txHash }, setTransactionModal] = useState<{
    showTransactionModal: boolean
    attemptingTxn: boolean
    transactionErrorMessage?: string
    txHash?: string
  }>({
    showTransactionModal: false,
    attemptingTxn: false,
    transactionErrorMessage: undefined,
    txHash: undefined,
  })

  const updateAllowance = useCallback(async () => {
    invariant(allowance.state === AllowanceState.REQUIRED)
    setIsAllowancePending(true)
    try {
      await allowance.approveAndPermit()
    } catch (e) {
      console.error(e)
    } finally {
      setIsAllowancePending(false)
    }
  }, [allowance])

  const handleMigration = useCallback(async () => {
    if (
      migrationContract &&
      +(balancePSYS.result?.toString() || 0) > 0 &&
      balancePSYS.loading == false &&
      !balancePSYS.error
    ) {
      try {
        stateTransaction(true, true, undefined, undefined)
        // const response = await migrationContract.migrateFromPSYS(balancePSYS.result?.toString())
        console.log('migrationContract', migrationContract)
        const response = await migrationContract.migrateFromPSYS('1')
        console.log('response', response)
        stateTransaction(false, true, undefined, response.transactionHash)
      } catch (e) {
        stateTransaction(false, true, e.message, undefined)
        console.error(e)
      }
    }
  }, [migrationContract, balancePSYS])

  const stateTransaction = (
    attemptingTxn: boolean,
    showTransactionModal: boolean,
    transactionErrorMessage: string | undefined,
    txHash: string | undefined
  ) => {
    setTransactionModal({
      attemptingTxn,
      showTransactionModal,
      transactionErrorMessage,
      txHash,
    })
  }

  const handleDismissTransaction = useCallback(() => {
    setTransactionModal({ showTransactionModal: false, attemptingTxn, transactionErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      // active confetti
    }
  }, [attemptingTxn, transactionErrorMessage, txHash])

  const modalHeader = () => {
    return (
      <AutoColumn>
        <Row style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <Text fontSize="18px">
            {'Migration' + ' '}
            <Text as="span" color={theme.accentActive}>
              {(balancePSYS.result?.toString() || 0) + ' PSYS to ROLLEX'}
            </Text>
          </Text>
        </Row>
      </AutoColumn>
    )
  }

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showTransactionModal}
        onDismiss={handleDismissTransaction}
        attemptingTxn={attemptingTxn}
        pendingText={`You are migrate ${balancePSYS.result?.toString() || 0} PSYS to ROLLEX`}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={<Trans>Transaction summary</Trans>}
            onDismiss={handleDismissTransaction}
            topContent={modalHeader}
          />
        )}
      />

      <PageWrapper>
        <MigrationWrapper>
          <div>
            <TextHeader className={headlineSmall}>Migration Portal</TextHeader>
            <div
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                flex: 'row',
                display: 'flex',
                paddingTop: '16px',
                paddingBottom: '16px',
                gap: '20px',
              }}
            >
              <img src="/icons/logo_pegasys.svg" alt="PSYS" height={60} width={60} />
              <RefreshCcw size="16" color={theme.accentActive} />
              <img src="/icons/rollex.png" alt="REX" height={60} width={60} />
            </div>
          </div>
          <ExchangeRate>
            <strong>1 PSYS</strong> = <strong>1 REX</strong>
          </ExchangeRate>
          <BalanceInfo>
            <BalanceRow>
              <BalanceLabel>PSYS Balance in wallet</BalanceLabel>
              <BalanceValue>
                {amountPSYS || 0} PSYS
                <img src="/icons/logo_pegasys.svg" alt="PSYS" style={{ marginLeft: 4 }} height={24} width={24} />
              </BalanceValue>
            </BalanceRow>
            <BalanceRow>
              <BalanceLabel>You will receive</BalanceLabel>
              <BalanceValue>
                {amountPSYS || 0} REX
                <img src="/icons/rollex.png" alt="REX" style={{ marginLeft: 4 }} height={24} width={24} />
              </BalanceValue>
            </BalanceRow>
          </BalanceInfo>
          {+(balancePSYS.result?.toString() || 0) == 0 && <Placeholder>There is no PSYS in your account.</Placeholder>}
          {!account ? (
            <ButtonPrimary onClick={toggleWalletDrawer} fontWeight={600}>
              Connect Wallet
            </ButtonPrimary>
          ) : +(balancePSYS.result?.toString() || 0) > 0 && allowance.state === AllowanceState.REQUIRED ? (
            <ButtonPrimary
              onClick={updateAllowance}
              disabled={isAllowancePending || isApprovalLoading}
              style={{ gap: 14 }}
            >
              {isAllowancePending ? (
                <>
                  <LoaderGif size="20px" gif={isDarkMode ? LoadingGif : LoadingGifLight} />
                  <Trans>Approve in your wallet</Trans>
                </>
              ) : isApprovalLoading ? (
                <>
                  <LoaderGif size="20px" gif={isDarkMode ? LoadingGif : LoadingGifLight} />
                  <Trans>Approval pending</Trans>
                </>
              ) : (
                <>
                  <div style={{ height: 20 }}>
                    <MouseoverTooltip
                      text={
                        <Trans>
                          Permission is required for Pegasys to swap each token. This will expire after one month for
                          your security.
                        </Trans>
                      }
                    >
                      <Info size={20} />
                    </MouseoverTooltip>
                  </div>
                  <Trans>Approve use of PSYS</Trans>
                </>
              )}
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={handleMigration} disabled={false}>
              Migration
            </ButtonPrimary>
          )}
        </MigrationWrapper>
      </PageWrapper>
    </>
  )
}
