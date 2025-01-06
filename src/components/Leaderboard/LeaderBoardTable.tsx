import { Trans } from '@lingui/macro'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { LeaderBoard, useLeaderboardData } from 'graphql/leaderboard/LeaderBoard'
import { PAGE_SIZE } from 'graphql/tokens/TokenData'
import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components/macro'

import { HeaderRow, LoadedRow, LoadingRow } from './LeaderBoardRow'
import {
  filterDateRangeAtom,
  filterStringAtom,
  filterTimeAtom,
  filterTokensAtom,
  rankAtom,
  sortAscendingAtom,
  sortMethodAtom,
} from './state'

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
  height: 60px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  font-weight: 500;
  align-items: center;
  padding: 0px 28px;
  gap: 8px;
`

const ButtonPagination = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.accentActive};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 6px;

  :hover {
    opacity: 0.8;
  }

  :focus {
    outline: none;
  }
`

const ButtonNumberPagination = styled.button`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 6px;

  :hover {
    opacity: 0.8;
  }

  :focus {
    outline: none;
  }
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

const ITEMS_PER_PAGE = 10

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => any
}) {
  let pages = [...Array(totalPages).keys()].map((i) => i + 1)

  if (pages.length > 3) {
    if (currentPage === 1 || currentPage === 2) {
      pages = pages.slice(0, 3)
    } else if (currentPage === totalPages || currentPage === totalPages - 1) {
      pages = pages.slice(-3)
    } else {
      pages = pages.slice(currentPage - 2, currentPage + 1)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {currentPage > 1 && <ButtonPagination onClick={() => onPageChange(currentPage - 1)}>Prev</ButtonPagination>}

      {currentPage > 3 && (
        <>
          <ButtonNumberPagination onClick={() => onPageChange(1)}>1</ButtonNumberPagination>
          <span>...</span>
        </>
      )}

      {pages.map((page) => (
        <ButtonNumberPagination
          key={page}
          onClick={() => onPageChange(page)}
          style={{ fontWeight: page === currentPage ? 'bold' : 'normal' }}
        >
          {page}
        </ButtonNumberPagination>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          <span>...</span>
          <ButtonNumberPagination onClick={() => onPageChange(totalPages)}>{totalPages}</ButtonNumberPagination>
        </>
      )}

      {currentPage < totalPages && (
        <ButtonPagination onClick={() => onPageChange(currentPage + 1)}>Next</ButtonPagination>
      )}
    </div>
  )
}

export default function LeaderboardTable({ address }: { address?: string }) {
  const timePeriod = useAtomValue(filterTimeAtom)
  const dataRange = useAtomValue(filterDateRangeAtom)
  const currentFilteredTokens = useAtomValue(filterTokensAtom)
  const [currentPage, setCurrentPage] = useState(1)

  const [_, setSearchParams] = useSearchParams()

  const filterString = useAtomValue(filterStringAtom)

  useEffect(() => {
    if (filterString) {
      setSearchParams({ filter: filterString })
    } else {
      setSearchParams({})
    }
  }, [filterString, setSearchParams])

  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)

  const handlePageChange = (newPage: any) => {
    setCurrentPage(newPage)
  }

  const { loading, data: leaderBoard } = useLeaderboardData(timePeriod, dataRange, currentFilteredTokens)

  const filteredAndSortedData = useMemo(() => {
    type LeaderBoardKeys = Exclude<keyof LeaderBoard, 'address' | 'date'>

    const sortMethodMapping: { [key: string]: LeaderBoardKeys } = {
      Trades: currentFilteredTokens.length > 0 ? 'txTokensCount' : 'txCount',
      Volume: currentFilteredTokens.length > 0 ? 'totalTokensTradeVolumeUSD' : 'totalVolume',
    }
    const sortKey = sortMethodMapping[sortMethod]
    const filtered = leaderBoard?.filter((obj: LeaderBoard | Omit<LeaderBoard, 'address' | 'date'>) => {
      const searchTerm = filterString.toLowerCase()

      if ('address' in obj) {
        return obj.address.toLowerCase().includes(searchTerm)
      }

      return obj.id.toLowerCase().includes(searchTerm)
    })
    const volumeSortKey = currentFilteredTokens.length > 0 ? 'totalTokensTradeVolumeUSD' : 'totalVolume'

    const sorted = filtered?.sort((a, b) => {
      const fieldA = sortKey === volumeSortKey ? parseFloat(`${a[sortKey]}` || '0') : (a[sortKey] as number)

      const fieldB = sortKey === volumeSortKey ? parseFloat(`${b[sortKey]}` || '0') : (b[sortKey] as number)

      if (fieldA < fieldB) {
        return sortAscending ? -1 : 1
      }
      if (fieldA > fieldB) {
        return sortAscending ? 1 : -1
      }

      return 0
    })

    return sorted || []
  }, [filterString, leaderBoard, sortAscending, sortMethod])

  const setRankString = useSetAtom(rankAtom)

  const paginatedData = filteredAndSortedData
    ? filteredAndSortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : []

  useEffect(() => {
    if (address) {
      filteredAndSortedData?.map((leaderboard, index) => {
        if (leaderboard.id.split('-')[0] === address.toLowerCase()) {
          setRankString(String(index))
        }
      })
    }
  }, [address, filteredAndSortedData, setRankString, timePeriod])

  /* loading and error state */
  if (loading) {
    return <LoadingTokenTable rowCount={PAGE_SIZE} />
  } else if (!filteredAndSortedData) {
    return (
      <NoTokensState
        message={
          <>
            <AlertTriangle size={16} />
            <Trans>An error occurred loading tokens. Please try again.</Trans>
          </>
        }
      />
    )
  } else {
    return (
      <GridContainer>
        <HeaderRow />
        <TokenDataContainer>
          {paginatedData.map((leaderboard, index) =>
            leaderboard?.id ? (
              <LoadedRow
                key={leaderboard.id}
                leaderboardListIndex={index}
                leaderboardListLength={paginatedData.length}
                leaderboard={leaderboard}
                sortRank={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                currentTokensFilter={currentFilteredTokens}
              />
            ) : null
          )}
        </TokenDataContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((filteredAndSortedData?.length || 0) / ITEMS_PER_PAGE)}
          onPageChange={handlePageChange}
        />
      </GridContainer>
    )
  }
}
