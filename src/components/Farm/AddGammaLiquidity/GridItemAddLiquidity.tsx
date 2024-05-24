import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { StyledBalanceMax } from 'components/CurrencyInputPanel'
import { MouseoverTooltip } from 'components/Tooltip'
import { Info } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

import { Input as NumericalInput } from '../../NumericalInput'

const GridItem = styled.div<{ isApproved: boolean }>`
  width: 100%;
  padding: ${(props) => (props.isApproved ? '0px 20px 0px 20px' : '20px')};
  text-align: center;
  font-size: 18px;
`
const StyledNumericalInput = styled(NumericalInput)`
  text-align: left;
  font-size: 24px;
  line-height: 44px;
  font-variant: small-caps;
`

const Container = styled.div`
  border-radius: '20px';
  border: 1px solid ${({ theme }) => theme.backgroundInteractive};
  border-radius: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  align-items: center;
`

interface GridItemGammaCardProps {
  titleText: string
  availableStakeAmount: string
  tokenSymbol: string
  depositValue: string
  textButton: string
  disabledButton: boolean
  isApproved: boolean
  setDepositAmount: (amount: string) => void
  approveOrStakeLPOrWithdraw: () => void
}

export function GridItemAddLiquidity({
  availableStakeAmount,
  depositValue = '',
  tokenSymbol = '',
  titleText,
  textButton,
  disabledButton,
  isApproved,
  setDepositAmount,
  approveOrStakeLPOrWithdraw,
}: GridItemGammaCardProps) {
  const theme = useTheme()

  return (
    <GridItem isApproved={isApproved}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <small style={{ color: theme.textSecondary }}>{titleText}</small>
        {availableStakeAmount && tokenSymbol && (
          <small>{`${Number(availableStakeAmount).toFixed(3)}  ${tokenSymbol}`}</small>
        )}
      </div>

      {availableStakeAmount && (
        <Container>
          <StyledNumericalInput className="token-amount-input" value={depositValue} onUserInput={setDepositAmount} />
          <StyledBalanceMax onClick={() => setDepositAmount(availableStakeAmount)}>MAX</StyledBalanceMax>
        </Container>
      )}

      {!isApproved && (
        <div style={{ marginTop: 5 }}>
          {approveOrStakeLPOrWithdraw && (
            <ButtonPrimary
              style={{
                height: '40px',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
              }}
              disabled={disabledButton}
              onClick={approveOrStakeLPOrWithdraw}
            >
              {textButton === 'Approve Required' && (
                <MouseoverTooltip
                  style={{ height: 'auto', display: 'flex' }}
                  text={
                    <Trans>
                      Permission is required for Pegasys farm to swap each token. This will expire after one month for
                      your security.
                    </Trans>
                  }
                >
                  <Info size={17} />
                </MouseoverTooltip>
              )}
              {textButton}
            </ButtonPrimary>
          )}
        </div>
      )}
    </GridItem>
  )
}
