import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import LoadingGifLight from 'assets/images/lightLoading.gif'
import LoadingGif from 'assets/images/loading.gif'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Confettis from 'components/Confetti'
import { LoaderGif } from 'components/Icons/LoadingSpinner'
import Row from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useMigrateRollexContract, useTokenContract } from 'hooks/useContract'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { headlineSmall } from 'nft/css/common.css'
import { useCallback, useState } from 'react'
import { Info, RefreshCcw } from 'react-feather'
import { Box, Text } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
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
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const migrationContract = useMigrateRollexContract()
  const toggleWalletDrawer = useToggleAccountDrawer()
  // const currency = useCurrency(PSYS_ADDRESS) // PSYS address
  const currency = useCurrency('0xE60bD82d0faEAD2F327D8C7F15907664800452f6') // PSYS address

  // const contract = useTokenContract(PSYS_ADDRESS) // PSYS address
  const contract = useTokenContract('0xE60bD82d0faEAD2F327D8C7F15907664800452f6') // PSYS mocked
  const psysCurrency = useCurrencyBalance(account || undefined, currency || undefined)
  const amountPSYS = formatTransactionAmount(currencyAmountToPreciseFloat(psysCurrency))
  const isDarkMode = useIsDarkMode()

  const balancePSYS = useSingleCallResult(contract, 'balanceOf', [account])

  const [approvalToken, approveCallbackToken] = useApproveCallback(psysCurrency, migrationContract?.address)

  const isApprovalLoading = approvalToken === ApprovalState.PENDING
  const [isAllowancePending, setIsAllowancePending] = useState(false)

  const [{ showTransactionModal, transactionErrorMessage, attemptingTxn, txHash, showConfetti }, setTransactionModal] =
    useState<{
      showTransactionModal: boolean
      attemptingTxn: boolean
      transactionErrorMessage?: string
      txHash?: string
      showConfetti: boolean
    }>({
      showTransactionModal: false,
      attemptingTxn: false,
      transactionErrorMessage: undefined,
      txHash: undefined,
      showConfetti: false,
    })

  const updateAllowance = useCallback(async () => {
    invariant(approvalToken === ApprovalState.NOT_APPROVED)
    setIsAllowancePending(true)
    try {
      await approveCallbackToken()
    } catch (e) {
      console.error(e)
    } finally {
      setIsAllowancePending(false)
    }
  }, [approvalToken, approveCallbackToken])

  const handleMigration = useCallback(async () => {
    if (
      migrationContract &&
      +(balancePSYS.result?.toString() || 0) > 0 &&
      balancePSYS.loading == false &&
      !balancePSYS.error
    ) {
      try {
        stateTransaction(true, true, undefined, undefined, false)
        // const response = await migrationContract.migrateFromPSYS(balancePSYS.result?.toString())

        const response = await migrationContract.migrateFromPSYS('1')

        addTransaction(response, {
          type: TransactionType.ROLLEX_MIGRATION,
          amount: amountPSYS,
        })

        stateTransaction(false, true, undefined, response.hash, true)
      } catch (e) {
        stateTransaction(false, true, e.code, undefined, false)
        console.error(e)
      }
    }
  }, [migrationContract, balancePSYS.result, balancePSYS.loading, balancePSYS.error, addTransaction, amountPSYS])

  const stateTransaction = (
    attemptingTxn: boolean,
    showTransactionModal: boolean,
    transactionErrorMessage: string | undefined,
    txHash: string | undefined,
    showConfetti: boolean
  ) => {
    setTransactionModal({
      attemptingTxn,
      showTransactionModal,
      transactionErrorMessage,
      txHash,
      showConfetti,
    })
  }

  const handleDismissTransaction = useCallback(() => {
    setTransactionModal({
      showTransactionModal: false,
      attemptingTxn,
      transactionErrorMessage,
      txHash,
      showConfetti: false,
    })
  }, [attemptingTxn, transactionErrorMessage, txHash])

  const modalHeader = () => {
    return (
      <AutoColumn justify="center" gap="10px">
        {transactionErrorMessage ? (
          <Box justifyItems="center" alignItems="center" padding={2} textAlign="center">
            <Text fontSize="18px">
              {transactionErrorMessage === 'ACTION_REJECTED' ? 'User rejected the transaction' : 'Something went wrong'}
            </Text>
            <Text color={theme.accentActive} fontSize="16px" alignItems="center">
              {'Code: ' + transactionErrorMessage}
            </Text>
          </Box>
        ) : (
          <Row style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Text fontSize="18px">
              {'Migration' + ' '}
              <Text as="span" color={theme.accentActive}>
                {balancePSYS.result?.toString() || 0}
              </Text>
              {' ' + 'PSYS to ROLLEX'}
            </Text>
          </Row>
        )}
      </AutoColumn>
    )
  }

  return (
    <>
      <Confettis start={showConfetti} />
      <TransactionConfirmationModal
        isOpen={showTransactionModal}
        onDismiss={handleDismissTransaction}
        attemptingTxn={attemptingTxn}
        pendingText={`You are migrating ${amountPSYS || 0} PSYS to ROLLEX`}
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
          ) : +(balancePSYS.result?.toString() || 0) > 0 && approvalToken === ApprovalState.NOT_APPROVED ? (
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
