import { useWeb3React } from '@web3-react/core'
import { useAtom } from 'jotai'
import React, { useRef } from 'react'
import { Check, ChevronDown, ChevronUp } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

import { useNewTopTokens } from '../../graphql/tokens/NewTopTokens'
import { TokenData, useFetchedTokenData } from '../../graphql/tokens/TokenData'
import { getInitialUrl } from '../../hooks/useAssetLogoSource'
import { filterTokensAtom } from './state'

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const FilterOption = styled.button<{ active: boolean }>`
  height: 100%;
  color: ${({ theme, active }) => (active ? theme.accentActive : theme.textPrimary)};
  background-color: ${({ theme, active }) => (active ? theme.accentActiveSoft : theme.backgroundSurface)};
  margin: 0;
  padding: 6px 12px 6px 14px;
  border-radius: 12px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};
  border: none;
  outline: none;
  width: 250px;

  :active {
    background-color: ${({ theme }) => theme.accentActiveSoft};
  }

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.accentActiveSoft};
    color: ${({ theme }) => theme.accentActive};
  }

  :focus {
    background-color: ${({ theme, active }) => (active ? theme.accentActiveSoft : theme.backgroundInteractive)};
  }
`

const StyledMenuContent = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  border: none;
  width: 100%;
  vertical-align: middle;
  overflow: hidden;
`

const SelectedDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Chevron = styled.span<{ open: boolean }>`
  padding-top: 1px;
  color: ${({ open, theme }) => (open ? theme.accentActive : theme.textSecondary)};
  flex-shrink: 0;
`

const MenuFlyout = styled.div`
  min-width: 260px;
  max-height: 300px;
  overflow: auto;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 0.5px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  position: absolute;
  top: 48px;
  z-index: 100;
  left: 0px;

  /* WebKit browsers (Chrome, Safari) */
  &::-webkit-scrollbar {
    display: none;
  }
`

const MenuItem = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 8px;
  justify-content: space-between;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  color: ${({ theme }) => theme.textPrimary};

  :hover {
    background-color: ${({ theme }) => theme.hoverState};
    border-radius: 8px;
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

const TokenIconPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.backgroundInteractive};
`

const TokenSymbol = styled.span`
  font-weight: 600;
`

const TokenName = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`

const getTokenIcon = (token: TokenData, chainId: number) => {
  const address = token?.address
  return getInitialUrl(address, chainId) || ''
}

const TOKENS = [
  { symbol: 'All Tokens', name: '' },
  { symbol: 'PSYS', name: 'Pegasys' },
  { symbol: 'SYS', name: 'Syscoin' },
  { symbol: 'SUPR', name: 'SuperDapp' },
  { symbol: 'UNO', name: 'UnoRe' },
  { symbol: 'LUXY', name: 'LUXY' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'DAI', name: 'Dai Stablecoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BTC', name: 'Bitcoin' },
]

export default function TokenSelector() {
  const theme = useTheme()
  const [_, setCurrentTokens] = useAtom(filterTokensAtom)
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedTokens, setSelectedTokens] = React.useState<string[]>(['All Tokens'])
  const { chainId } = useWeb3React()
  const { loading, tokens: newTokens } = useNewTopTokens()
  const tokensAddress = newTokens?.map((token) => token.id) || []
  const { loading: loadingTokenData, data: tokens } = useFetchedTokenData(tokensAddress)
  const node = useRef<HTMLDivElement | null>(null)

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (node.current?.contains(e.target as Node)) return
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleTokenSelect = (symbol: string) => {
    setSelectedTokens((prev) => {
      // Handle "All Tokens" special case
      if (symbol === 'All Tokens') {
        setCurrentTokens([])
        return ['All Tokens']
      }

      // Remove "All Tokens" when selecting specific tokens
      const withoutAll = prev.filter((token) => token !== 'All Tokens')

      if (prev.includes(symbol)) {
        // Remove token if already selected
        const newSelection = withoutAll.filter((token) => token !== symbol)
        // If no tokens selected, default to "All Tokens"
        setCurrentTokens(newSelection.length === 0 ? [] : newSelection)
        return newSelection.length === 0 ? ['All Tokens'] : newSelection
      } else {
        // Add new token
        const newTokens = [...withoutAll, symbol]
        setCurrentTokens(newTokens)
        return [...withoutAll, symbol]
      }
    })
  }

  const getDisplayText = () => {
    const formattedTokens = selectedTokens.map((token) => (token === 'WSYS' ? 'SYS' : token))
    if (selectedTokens.includes('All Tokens')) return 'All Tokens'
    if (formattedTokens.length === 1) return formattedTokens[0]
    // Join selected tokens with commas
    return formattedTokens.join(', ')
  }

  const TokenDisplay = ({ token }: { token: (typeof TOKENS)[0] }) => {
    const proxyToken = { ...token, ...(token.symbol === 'WSYS' ? { symbol: 'SYS' } : {}) }

    const tokenData = tokens?.find((t) => t?.symbol === token?.symbol)
    return (
      <TokenInfo>
        {!loading && !loadingTokenData && token.symbol !== 'All Tokens' ? (
          <TokenIcon src={getTokenIcon(tokenData as TokenData, chainId as number)} alt={`${token.symbol} icon`} />
        ) : (
          <TokenIconPlaceholder />
        )}
        <TokenSymbol>{proxyToken.symbol}</TokenSymbol>
        {token.name && <TokenName>{token.name}</TokenName>}
      </TokenInfo>
    )
  }

  return (
    <StyledMenu ref={node}>
      <FilterOption onClick={() => setIsOpen(!isOpen)} active={isOpen} data-testid="token-selector">
        <StyledMenuContent>
          <SelectedDisplay>{getDisplayText()}</SelectedDisplay>
          <Chevron open={isOpen}>
            {isOpen ? (
              <ChevronUp width={20} height={15} viewBox="0 0 24 20" />
            ) : (
              <ChevronDown width={20} height={15} viewBox="0 0 24 20" />
            )}
          </Chevron>
        </StyledMenuContent>
      </FilterOption>

      {isOpen && (
        <MenuFlyout>
          {TOKENS.map((token) => {
            token = { ...token, ...(token.symbol === 'SYS' ? { symbol: 'WSYS' } : {}) }
            return (
              <MenuItem
                key={token.symbol}
                onClick={() => handleTokenSelect(token.symbol)}
                data-testid={`token-option-${token.symbol}`}
              >
                <TokenDisplay token={token} />
                {selectedTokens.includes(token.symbol) && <Check color={theme.accentAction} size={16} />}
              </MenuItem>
            )
          })}
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
