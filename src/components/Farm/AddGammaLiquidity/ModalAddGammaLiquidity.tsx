import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import { Token } from '@pollum-io/sdk-core'
import { formatNumber } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import ModalAddLiquidity from 'components/ModalAddLiquidity'
import Row, { RowBetween } from 'components/Row'
import SubTitleContainer from 'components/SubTitleContainer/SubTitleContainer'
import { MouseoverTooltip } from 'components/Tooltip'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { Contract } from 'ethers/lib/ethers'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useIsMobile } from 'nft/hooks'
import React, { useCallback, useState } from 'react'
import { Info } from 'react-feather'
import { Text } from 'rebass'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { useTransactionFinalizer } from 'utils/farmUtils'
import { regexTokenSymbol } from 'utils/regexTokenSymbol'

import gammaLogo from '../../../assets/svg/gamma_logo.svg'
import gammaLogoWhite from '../../../assets/svg/gamma_logo_white.svg'
import { depositUniProxy, getDepositAmounts, getValidationText, withdrawHypervisor } from '../utils'
import { GridItemAddLiquidity } from './GridItemAddLiquidity'

const Wrapper = styled(RowBetween)`
  display: flex;
  flex-direction: column;
  padding: 20px 16px 16px;
`
const HeaderRow = styled(RowBetween)`
  display: flex;
`

const Body = styled.div`
  padding-top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`

const Container = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  justify-content: space-between;
  align-items: center;
`

const Deposit = styled.div`
  width: 300px;
`

const ApprovedArea = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
`

const DepositButton = styled.div`
  display: flex;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`

const Withdraw = styled.div`
  width: 300px;
`

interface ModalProps {
  modalOpen: boolean
  handleDismiss: () => void
  finalStateTransactionDismiss: () => void
  token0Balance: string
  approvalToken0: ApprovalState
  approvalToken1: ApprovalState
  tokenStake0?: Token | null
  tokenStake1?: Token | null
  uniProxyContract: Contract | null
  deposit0: string
  deposit1: string
  setDeposit0: (amount: string) => void
  setDeposit1: (amount: string) => void
  pairData: any
  approveCallbackToken0: () => void
  token0Address: string
  token1Address: string
  token1Balance: string
  approveCallbackToken1: () => void
  unStakeGamma: string
  setUnStakeGamma: React.Dispatch<React.SetStateAction<string>>
  hypervisorContract: Contract | null
  lpTokenBalance: string
  lpTokenSymbol: string
  decimals0: number
  decimals1: number
}

export default function ModalAddGammaLiquidity({
  modalOpen,
  handleDismiss,
  finalStateTransactionDismiss,
  token0Balance,
  approvalToken0,
  approvalToken1,
  tokenStake0,
  tokenStake1,
  uniProxyContract,
  deposit0,
  deposit1,
  setDeposit0,
  setDeposit1,
  pairData,
  approveCallbackToken0,
  token0Address,
  token1Address,
  token1Balance,
  approveCallbackToken1,
  unStakeGamma,
  setUnStakeGamma,
  hypervisorContract,
  lpTokenBalance,
  lpTokenSymbol = 'LP',
  decimals0,
  decimals1,
}: ModalProps) {
  const finalizedTransaction = useTransactionFinalizer()
  const addTransaction = useTransactionAdder()
  const isMobile = useIsMobile()
  const { account } = useWeb3React()
  const validationTextButton0 = getValidationText(approvalToken0, tokenStake0)
  const validationTextButton1 = getValidationText(approvalToken1, tokenStake1)
  const isDarkMode = useIsDarkMode()
  const theme = useTheme()
  // modal and loading
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

  const [
    { showTransactionWithdrawModal, transactionWithdrawErrorMessage, attemptingWithdrawTxn, txHashWithdraw },
    setTransactionWithdrawModal,
  ] = useState<{
    showTransactionWithdrawModal: boolean
    attemptingWithdrawTxn: boolean
    transactionWithdrawErrorMessage?: string
    txHashWithdraw?: string
  }>({
    showTransactionWithdrawModal: false,
    attemptingWithdrawTxn: false,
    transactionWithdrawErrorMessage: undefined,
    txHashWithdraw: undefined,
  })

  const handleDismissTransaction = useCallback(() => {
    setTransactionModal({ showTransactionModal: false, attemptingTxn, transactionErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      finalStateTransactionDismiss()
      handleDismiss()
    }
  }, [attemptingTxn, finalStateTransactionDismiss, transactionErrorMessage, txHash])

  const handleDismissTransactionWithdraw = useCallback(() => {
    setTransactionWithdrawModal({
      showTransactionWithdrawModal: false,
      attemptingWithdrawTxn,
      transactionWithdrawErrorMessage,
      txHashWithdraw,
    })
    // if there was a tx hash, we want to clear the input
    if (txHashWithdraw) {
      finalStateTransactionDismiss()
      handleDismiss()
    }
  }, [attemptingWithdrawTxn, finalStateTransactionDismiss, transactionWithdrawErrorMessage, txHashWithdraw])

  // text to show while loading
  const pendingText = `Depositing ${tokenStake0 && Number(deposit0) > 0 ? formatNumber(Number(deposit0)) : ''} ${
    tokenStake0?.symbol
  } and 
    ${tokenStake1 && Number(deposit1) > 0 ? formatNumber(Number(deposit1)) : ''} ${tokenStake1?.symbol}`

  const pendingTextWithdraw = `Withdraw  ${
    unStakeGamma && Number(unStakeGamma) > 0 ? formatNumber(Number(unStakeGamma)) : ''
  } ${lpTokenSymbol}`

  const modalHeader = () => {
    return (
      <AutoColumn>
        <Row style={{ padding: '20px', gap: '10px', display: 'flex', justifyContent: 'center' }}>
          {tokenStake0 && tokenStake1 && (
            <DoubleCurrencyLogo currency0={tokenStake0} currency1={tokenStake1} size={30} />
          )}
          <Text fontSize="18px">
            Deposit {tokenStake0 && Number(deposit0) > 0 ? formatNumber(Number(deposit0)) : ''}
            <Text as="span" color={theme.accentActive}>
              {' ' + tokenStake0?.symbol + ' '}
            </Text>
            and {tokenStake1 && Number(deposit1) > 0 ? formatNumber(Number(deposit1)) : ''}
            <Text as="span" color={theme.accentActive}>
              {' ' + tokenStake1?.symbol}
            </Text>
          </Text>
        </Row>
      </AutoColumn>
    )
  }

  const modalHeaderWithdraw = () => {
    return (
      <AutoColumn>
        <Row style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <Text fontSize="18px">
            {'Withdraw' + ' '}
            {formatNumber(Number(unStakeGamma)) + ' '}
            <Text as="span" color={theme.accentActive}>
              {regexTokenSymbol(lpTokenSymbol)}
            </Text>
          </Text>
        </Row>
      </AutoColumn>
    )
  }

  async function onDeposit() {
    if (uniProxyContract && tokenStake0?.symbol && tokenStake1?.symbol) {
      depositUniProxy(
        uniProxyContract,
        account,
        approvalToken0,
        approvalToken1,
        pairData,
        addTransaction,
        token0Address,
        token1Address,
        tokenStake0?.symbol,
        tokenStake1?.symbol,
        deposit0,
        deposit1,
        decimals0,
        decimals1,
        finalizedTransaction,
        stateTransaction
      )
    }
  }

  async function onWithdraw() {
    withdrawHypervisor(
      hypervisorContract,
      account,
      unStakeGamma,
      pairData,
      finalizedTransaction,
      addTransaction,
      stateTransactionWithdraw,
      lpTokenSymbol
    )
  }

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

  const stateTransactionWithdraw = (
    attemptingTxn: boolean,
    showTransactionModal: boolean,
    transactionErrorMessage: string | undefined,
    txHash: string | undefined
  ) => {
    setTransactionWithdrawModal({
      attemptingWithdrawTxn: attemptingTxn,
      showTransactionWithdrawModal: showTransactionModal,
      transactionWithdrawErrorMessage: transactionErrorMessage,
      txHashWithdraw: txHash,
    })
  }

  function getDepositValidation(balance: string, depositAmount: string, approvalState: ApprovalState) {
    if (Number(balance) < Number(depositAmount)) {
      return i18n._('Insufficient Balance')
    } else if (Number(depositAmount) <= 0) {
      return i18n._('Enter an amount')
    } else if (approvalState !== ApprovalState.APPROVED) {
      return i18n._('Approve Required')
    }
    return i18n._('Approved')
  }

  function getDepositButtonText(
    token0Balance: string,
    deposit0: string,
    approvalToken0: ApprovalState,
    token1Balance: string,
    deposit1: string,
    approvalToken1: ApprovalState
  ): string {
    if (approvalToken0 !== ApprovalState.APPROVED || approvalToken1 !== ApprovalState.APPROVED) {
      return 'Approve Required'
    }
    if (Number(token0Balance) < Number(deposit0) || Number(token1Balance) < Number(deposit1)) {
      return 'Insufficient Balance'
    }
    return 'Confirm Deposit'
  }

  const depositButtonText = getDepositButtonText(
    token0Balance,
    deposit0,
    approvalToken0,
    token1Balance,
    deposit1,
    approvalToken1
  )

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showTransactionModal}
        onDismiss={handleDismissTransaction}
        attemptingTxn={attemptingTxn}
        pendingText={pendingText}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={<Trans>Transaction summary</Trans>}
            onDismiss={handleDismissTransaction}
            topContent={modalHeader}
            bottomContent={() => (
              <ButtonPrimary style={{ marginTop: '0.5rem' }} onClick={onDeposit}>
                <Text fontWeight={500} fontSize={20}>
                  <Trans>Deposit</Trans>
                </Text>
              </ButtonPrimary>
            )}
          />
        )}
      />

      <TransactionConfirmationModal
        isOpen={showTransactionWithdrawModal}
        onDismiss={handleDismissTransactionWithdraw}
        attemptingTxn={attemptingWithdrawTxn}
        pendingText={pendingTextWithdraw}
        hash={txHashWithdraw}
        content={() => (
          <ConfirmationModalContent
            title={<Trans>Transaction summary</Trans>}
            onDismiss={handleDismissTransactionWithdraw}
            topContent={modalHeaderWithdraw}
            bottomContent={() => (
              <ButtonPrimary style={{ marginTop: '0.5rem' }} onClick={onWithdraw}>
                <Text fontWeight={500} fontSize={20}>
                  <Trans>Withdraw</Trans>
                </Text>
              </ButtonPrimary>
            )}
          />
        )}
      />

      <ModalAddLiquidity isOpen={modalOpen} onDismiss={handleDismiss}>
        <Wrapper>
          <HeaderRow>
            <ThemedText.SubHeader>
              <SubTitleContainer
                text={`
                The benefits of Gamma’s active liquidity management include automatic rebalancing of your liquidity to keep it in range and auto-compounding of generated swap fees to maximize capital efficiency`}
                description={lpTokenBalance == '0.0' ? 'Add Gamma Liquidity' : 'Manage Gamma Liquidity'}
              />
            </ThemedText.SubHeader>
            <CloseIcon onClick={handleDismiss} />
          </HeaderRow>
          <div
            style={{
              padding: '10px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px 0 15px 0',
              }}
            >
              <img src={isDarkMode ? gammaLogo : gammaLogoWhite} width={300} />
            </div>
            <ThemedText.BodySmall>
              <Trans>
                It’s never been easier to LP and farm! Sit back, relax, and let Gamma do the work while you enjoy the
                yield.
                <br />
                Get started now by providing liquidity then deposit your LP tokens in our Gamma farms!
              </Trans>
            </ThemedText.BodySmall>
          </div>
          <Body>
            <Container isMobile={isMobile}>
              <ApprovedArea>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                  <Deposit>
                    <GridItemAddLiquidity
                      titleText="Deposit: "
                      availableStakeAmount={token0Balance}
                      textButton={getDepositValidation(token0Balance, deposit0, approvalToken0)}
                      tokenSymbol={tokenStake0?.symbol || ''}
                      depositValue={deposit0}
                      disabledButton={
                        getDepositValidation(token0Balance, deposit0, approvalToken0) === i18n._('Enter an amount') ||
                        getDepositValidation(token0Balance, deposit0, approvalToken0) === i18n._('Approved') ||
                        Number(token0Balance) < Number(deposit0) ||
                        Number(token0Balance) <= 0 ||
                        Number(token1Balance) <= 0
                      }
                      isApproved={
                        approvalToken0 === ApprovalState.APPROVED && approvalToken1 === ApprovalState.APPROVED
                      }
                      setDepositAmount={(amount: string) => {
                        setDeposit0(amount === '' ? '' : amount)
                        if (uniProxyContract && amount !== '')
                          getDepositAmounts(
                            0,
                            uniProxyContract,
                            setDeposit1,
                            setDeposit0,
                            pairData,
                            token0Address,
                            token1Address,
                            amount,
                            deposit1,
                            decimals0,
                            decimals1
                          )
                      }}
                      approveOrStakeLPOrWithdraw={approveCallbackToken0}
                    />
                  </Deposit>

                  <Deposit>
                    <GridItemAddLiquidity
                      titleText="Deposit: "
                      availableStakeAmount={token1Balance}
                      textButton={getDepositValidation(token1Balance, deposit1, approvalToken1)}
                      tokenSymbol={tokenStake1?.symbol || ''}
                      depositValue={deposit1}
                      disabledButton={
                        getDepositValidation(token1Balance, deposit1, approvalToken1) === i18n._('Enter an amount') ||
                        getDepositValidation(token1Balance, deposit1, approvalToken1) === i18n._('Approved') ||
                        Number(token1Balance) < Number(deposit1) ||
                        Number(token0Balance) <= 0 ||
                        Number(token1Balance) <= 0
                      }
                      isApproved={
                        approvalToken1 === ApprovalState.APPROVED && approvalToken0 === ApprovalState.APPROVED
                      }
                      setDepositAmount={(amount: string) => {
                        setDeposit1(amount === '' ? '' : amount)
                        if (uniProxyContract && amount !== '')
                          getDepositAmounts(
                            1,
                            uniProxyContract,
                            setDeposit1,
                            setDeposit0,
                            pairData,
                            token0Address,
                            token1Address,
                            deposit0,
                            amount,
                            decimals0,
                            decimals1
                          )
                      }}
                      approveOrStakeLPOrWithdraw={approveCallbackToken1}
                    />
                  </Deposit>
                </div>

                {approvalToken0 === ApprovalState.APPROVED && approvalToken1 === ApprovalState.APPROVED && (
                  <DepositButton>
                    <ButtonPrimary
                      style={{
                        height: '40px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                      disabled={depositButtonText !== 'Confirm Deposit'}
                      onClick={() => {
                        setTransactionModal({
                          attemptingTxn: false,
                          showTransactionModal: true,
                          transactionErrorMessage: undefined,
                          txHash: undefined,
                        })
                      }}
                    >
                      {!ApprovalState.APPROVED && (
                        <MouseoverTooltip
                          style={{ height: 'auto', display: 'flex' }}
                          text={
                            <Trans>
                              Permission is required for Pegasys farm to swap each token. This will expire after one
                              month for your security.
                            </Trans>
                          }
                        >
                          <Info size={17} />
                        </MouseoverTooltip>
                      )}
                      {depositButtonText}
                    </ButtonPrimary>
                  </DepositButton>
                )}
              </ApprovedArea>
              {lpTokenBalance && Number(lpTokenBalance) != 0 && (
                <Withdraw>
                  <GridItemAddLiquidity
                    titleText="Withdraw: "
                    availableStakeAmount={lpTokenBalance}
                    textButton="Withdraw"
                    tokenSymbol={regexTokenSymbol(lpTokenSymbol) || ''}
                    depositValue={unStakeGamma}
                    disabledButton={!(Number(unStakeGamma) > 0)}
                    isApproved={false}
                    setDepositAmount={(amount: string) => {
                      setUnStakeGamma(amount)
                    }}
                    approveOrStakeLPOrWithdraw={() => {
                      setTransactionWithdrawModal({
                        attemptingWithdrawTxn: false,
                        showTransactionWithdrawModal: true,
                        transactionWithdrawErrorMessage: undefined,
                        txHashWithdraw: undefined,
                      })
                    }}
                  />
                </Withdraw>
              )}
            </Container>
          </Body>
        </Wrapper>
      </ModalAddLiquidity>
    </>
  )
}
