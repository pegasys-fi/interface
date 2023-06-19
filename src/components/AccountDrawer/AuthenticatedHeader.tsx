import { Token } from '@pollum-io/sdk-core'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import Column from 'components/Column'
import { AutoRow } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { formatDelta } from 'components/Tokens/TokenDetails/PriceChart'
import { useGetConnection } from 'connection'
import { usePortfolioBalancesQuery } from 'graphql/data/__generated__/types-and-hooks'
import { useNewTopTokens } from 'graphql/tokens/NewTopTokens'
// import { useCurrencies } from 'hooks/Tokens'
import { useTokenBalances } from 'lib/hooks/useCurrencyBalance'
import { useCallback } from 'react'
import { ArrowDownRight, ArrowUpRight, Copy, IconProps, Power, Settings } from 'react-feather'
import { useAppDispatch } from 'state/hooks'
import { updateSelectedWallet } from 'state/user/reducer'
import styled, { useTheme } from 'styled-components/macro'
import { CopyHelper, ThemedText } from 'theme'

import { shortenAddress } from '../../nft/utils/address'
import StatusIcon from '../Identicon/StatusIcon'
import IconButton, { IconHoverText } from './IconButton'
import MiniPortfolio from './MiniPortfolio'
import { portfolioFadeInAnimation } from './MiniPortfolio/PortfolioRow'

const AuthenticatedHeaderWrapper = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  & > a,
  & > button {
    margin-right: 8px;
  }

  & > button:last-child {
    margin-right: 0px;
    ${IconHoverText}:last-child {
      left: 0px;
    }
  }
`

const StatusWrapper = styled.div`
  display: inline-block;
  width: 70%;
  padding-right: 4px;
  display: inline-flex;
`

const AccountNamesWrapper = styled.div`
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`

const HeaderWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const CopyText = styled(CopyHelper).attrs({
  InitialIcon: Copy,
  CopiedIcon: Copy,
  gap: 4,
  iconSize: 14,
  iconPosition: 'right',
})``

const FadeInColumn = styled(Column)`
  ${portfolioFadeInAnimation}
`

const PortfolioDrawerContainer = styled(Column)`
  flex: 1;
`

export function PortfolioArrow({ change, ...rest }: { change: number } & IconProps) {
  const theme = useTheme()
  return change < 0 ? (
    <ArrowDownRight color={theme.accentCritical} size={20} {...rest} />
  ) : (
    <ArrowUpRight color={theme.accentSuccess} size={20} {...rest} />
  )
}

export default function AuthenticatedHeader({ account, openSettings }: { account: string; openSettings: () => void }) {
  const { connector, ENSName } = useWeb3React()
  const dispatch = useAppDispatch()

  const getConnection = useGetConnection()
  const connection = getConnection(connector)
  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }, [connector, dispatch])

  // TODO: verify portifolio from ownerAddress like a swap page
  const { data: portfolioBalances } = usePortfolioBalancesQuery({
    variables: { ownerAddress: account ?? '' },
    fetchPolicy: 'cache-only', // PrefetchBalancesWrapper handles balance fetching/staleness; this component only reads from cache
  })

  const { tokens } = useNewTopTokens()
  const { chainId } = useWeb3React()

  const ERC20Tokens: Token[] = []
  if (tokens && tokens?.length > 0)
    tokens?.map((token) =>
      ERC20Tokens.push({
        address: token.id,
        chainId,
        symbol: token.symbol,
        name: token.name,
        decimals: Number(token.decimals),
      } as Token)
    )

  const tokenBalances = useTokenBalances(account, ERC20Tokens)
  // console.log('tokenBalances', tokenBalances)

  // console.log('tokenBalances', relevantTokenBalances)
  // const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const portfolio = portfolioBalances?.portfolios?.[0]
  const totalBalance = portfolio?.tokensTotalDenominatedValue?.value
  const absoluteChange = portfolio?.tokensTotalDenominatedValueChange?.absolute?.value
  const percentChange = portfolio?.tokensTotalDenominatedValueChange?.percentage?.value

  return (
    <AuthenticatedHeaderWrapper>
      <HeaderWrapper>
        <StatusWrapper>
          <StatusIcon connection={connection} size={40} />
          {account && (
            <AccountNamesWrapper>
              <ThemedText.SubHeader color="textPrimary" fontWeight={500}>
                <CopyText toCopy={ENSName ?? account}>{ENSName ?? shortenAddress(account, 4, 4)}</CopyText>
              </ThemedText.SubHeader>
              {/* Displays smaller view of account if ENS name was rendered above */}
              {ENSName && (
                <ThemedText.BodySmall color="textTertiary">
                  <CopyText toCopy={account}>{shortenAddress(account, 4, 4)}</CopyText>
                </ThemedText.BodySmall>
              )}
            </AccountNamesWrapper>
          )}
        </StatusWrapper>
        <IconContainer>
          <IconButton data-testid="wallet-settings" onClick={openSettings} Icon={Settings} />
          <IconButton data-testid="wallet-disconnect" onClick={disconnect} Icon={Power} />
        </IconContainer>
      </HeaderWrapper>
      <PortfolioDrawerContainer>
        {totalBalance !== undefined ? (
          <FadeInColumn gap="xs">
            <ThemedText.HeadlineLarge fontWeight={500}>
              {formatNumber(totalBalance, NumberType.PortfolioBalance)}
            </ThemedText.HeadlineLarge>
            <AutoRow marginBottom="20px">
              {absoluteChange !== 0 && percentChange && (
                <>
                  <PortfolioArrow change={absoluteChange as number} />
                  <ThemedText.BodySecondary>
                    {`${formatNumber(Math.abs(absoluteChange as number), NumberType.PortfolioBalance)} (${formatDelta(
                      percentChange
                    )})`}
                  </ThemedText.BodySecondary>
                </>
              )}
            </AutoRow>
          </FadeInColumn>
        ) : (
          <Column gap="xs">
            <LoadingBubble height="44px" width="170px" />
            <LoadingBubble height="16px" width="100px" margin="4px 0 20px 0" />
          </Column>
        )}

        <MiniPortfolio account={account} />
      </PortfolioDrawerContainer>
    </AuthenticatedHeaderWrapper>
  )
}
