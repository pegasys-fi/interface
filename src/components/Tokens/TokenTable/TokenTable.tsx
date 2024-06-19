import LoadingGifLight from 'assets/images/lightLoading.gif'
import LoadingGif from 'assets/images/loading.gif'
import { LoaderGif } from 'components/Icons/LoadingSpinner'
import { useNewTopTokens } from 'graphql/tokens/NewTopTokens'
import { PAGE_SIZE } from 'graphql/tokens/TokenData'
import { useFetchedTokenData } from 'graphql/tokens/TokenData'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { useIsDarkMode } from 'theme/components/ThemeToggle'

import { MAX_WIDTH_MEDIA_BREAKPOINT } from '../constants'
import { filterStringAtom, filterTimeAtom, sortAscendingAtom, sortMethodAtom } from '../state'
import { HeaderRow, LoadedRow, LoadingRow } from './TokenRow'

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  background-color: ${({ theme }) => theme.backgroundSurface};
  /* box-shadow: ${({ theme }) => theme.deepShadow}; */
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  margin-left: auto;
  margin-right: auto;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
`

const NoTokenDisplay = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

function NoTokensState({ message }: { message: ReactNode }) {
  return (
    <GridContainer>
      <HeaderRow />
      <NoTokenDisplay>{message}</NoTokenDisplay>
    </GridContainer>
  )
}

const LoadingRows = ({ rowCount }: { rowCount: number }) => (
  <>
    {Array(rowCount)
      .fill(null)
      .map((_, index) => {
        return <LoadingRow key={index} first={index === 0} last={index === rowCount - 1} />
      })}
  </>
)

function LoadingTokenTable({ rowCount = PAGE_SIZE }: { rowCount?: number }) {
  return (
    <GridContainer>
      <HeaderRow />
      <TokenDataContainer>
        <LoadingRows rowCount={rowCount} />
      </TokenDataContainer>
    </GridContainer>
  )
}

export default function TokenTable() {
  const { loading, tokens: newTokens } = useNewTopTokens()
  const tokensAddress = newTokens?.map((token) => token.id) || []
  const filterString = useAtomValue(filterStringAtom)
  const { loading: tokenDataLoading, data: tokenData } = useFetchedTokenData(tokensAddress)
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)
  const timePeriod = useAtomValue(filterTimeAtom)
  const isDarkMode = useIsDarkMode()

  const defaultTokens = useDefaultActiveTokens()
  const [tokenNames, setTokenNames] = useState<any>([])
  const [tokenAddresses, setTokenAddresses] = useState<any>([])

  const excludedAddresses = [
    '0xe088f571af1d38e60e3a6393162dda4966386443',
    '0x534cd1fe31a0c15bcdf3fc1ce690e26bcfd3719c',
  ].map((address) => address.toLowerCase())

  useEffect(() => {
    if (defaultTokens && typeof defaultTokens === 'object') {
      const tokens = Object.values(defaultTokens)
      const names = tokens.map((token) => token.name?.toLowerCase())
      const addresses = tokens.map((token) => token.address.toLowerCase())
      setTokenNames(names)
      setTokenAddresses(addresses)
    }
  }, [defaultTokens])

  const filteredAndSortedData = useMemo(() => {
    const sortMethodMapping = {
      Change: timePeriod === 0 ? 'priceUSDChange' : 'priceUSDChangeWeek',
      TVL: 'tvlUSD',
      Price: 'priceUSD',
      Volume: timePeriod === 0 ? 'volumeUSD' : 'volumeUSDWeek',
    }

    const filtered = tokenData?.filter((token) => {
      const nameMatch = tokenNames.includes(token.name?.toLowerCase())
      const addressMatch = tokenAddresses.includes(token.address?.toLowerCase())
      const filterMatch =
        token.name.toLowerCase().includes(filterString.toLowerCase()) ||
        token.symbol.toLowerCase().includes(filterString.toLowerCase())
      const notExcluded = !excludedAddresses.includes(token.address.toLowerCase())
      return (nameMatch || addressMatch) && filterMatch && notExcluded
    })

    const sorted = filtered?.sort((a, b) => {
      const fieldA = a[sortMethodMapping[sortMethod] as keyof typeof a]
      const fieldB = b[sortMethodMapping[sortMethod] as keyof typeof b]
      if (fieldA < fieldB) {
        return sortAscending ? -1 : 1
      }
      if (fieldA > fieldB) {
        return sortAscending ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [tokenData, tokenNames, tokenAddresses, filterString, sortMethod, sortAscending, timePeriod, excludedAddresses])

  if (loading && tokenDataLoading && !newTokens && !tokenData) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  } else if (!filteredAndSortedData || filteredAndSortedData.length === 0) {
    return (
      <NoTokensState
        message={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px !important' }}>
            <LoaderGif gif={isDarkMode ? LoadingGif : LoadingGifLight} size="3.5rem" />
          </div>
        }
      />
    )
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {filteredAndSortedData.map((token, index) => (
            <LoadedRow
              key={token.address}
              tokenListIndex={index}
              tokenListLength={filteredAndSortedData.length}
              token={token}
              sortRank={index + 1}
            />
          ))}
        </TokenDataContainer>
      </GridContainer>
    )
  }
}
