import { useWeb3React } from '@web3-react/core'
import { useToggleAccountDrawer } from 'components/AccountDrawer'
import { ButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { RowFixed } from 'components/Row'
import { useCurrency } from 'hooks/Tokens'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { headlineSmall } from 'nft/css/common.css'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'

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
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
`

export default function Migration() {
  const { account } = useWeb3React()
  const toggleWalletDrawer = useToggleAccountDrawer()
  const currency = useCurrency('0x48023b16c3e81AA7F6eFFbdEB35Bb83f4f31a8fd') // PSYS address
  const psysBalance = useCurrencyBalances(account ?? undefined, [currency ?? undefined])

  return (
    <PageWrapper>
      <MigrationWrapper>
        <RowFixed align="center" justify="center">
          <TextHeader className={headlineSmall}>Migration Portal</TextHeader>
          <DoubleCurrencyLogo size={30} /> {/*TODO: get tokens to show Logo*/}
        </RowFixed>
        <ExchangeRate>
          <strong>1 PSYS</strong> = <strong>1 REX</strong>
        </ExchangeRate>
        <BalanceInfo>
          <BalanceRow>
            <BalanceLabel>PSYS Balance in wallet</BalanceLabel>
            <BalanceValue>
              <img src="/icons/logo_pegasys.svg" alt="PSYS" style={{ marginRight: 4 }} height={24} width={24} />0 PSYS
            </BalanceValue>
          </BalanceRow>
          <BalanceRow>
            <BalanceLabel>You will receive</BalanceLabel>
            <BalanceValue>
              {/* <img src="/path/to/aave-icon.png" alt="REX" style={{ marginRight: 4 }} />  */}0 REX
            </BalanceValue>
          </BalanceRow>
        </BalanceInfo>
        <Placeholder>There is no PSYS in your account.</Placeholder>
        {!account && (
          <ButtonPrimary onClick={toggleWalletDrawer} fontWeight={600}>
            Connect Wallet
          </ButtonPrimary>
        )}
      </MigrationWrapper>
    </PageWrapper>
  )
}
