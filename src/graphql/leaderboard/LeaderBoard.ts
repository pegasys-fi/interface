import { gql, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { apolloClient } from 'graphql/thegraph/apollo'
import { TimePeriodLeaderboard } from 'graphql/utils/util'
import { LeaderBoard } from 'pages/Leaderboard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ILeaderBoardDateRange } from '../../components/Leaderboard/state'

export type LeaderBoard = {
  address: string
  date: number
  id: string
  totalVolume: string
  totalTokensTradeVolumeUSD: number
  txTokensCount: number
  txCount: number
  rank?: number
}

interface LeaderboardDataResponseWeek {
  userWeekDatas: LeaderBoard[]
}

interface LeaderBoarDataResponseMonth {
  userMonthDatas: LeaderBoard[]
}

interface LeaderBoarDataResponseAll {
  users: Omit<LeaderBoard, 'date' | 'address'>[]
}

interface LeaderBoarDataResponseUser {
  user: Omit<LeaderBoard, 'date' | 'address'>
}

const LEADERBOARD = gql`
  query leaderBoardAll {
    users(orderBy: totalVolume, first: 1000, orderDirection: desc) {
      id
      txCount
      totalVolume
    }
  }
`

const TRADES_BY_USER = gql`
  query userTrades($where: Swap_filter, $skip: Int!) {
    swaps(first: 1000, skip: $skip, where: $where) {
      amountUSD
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      recipient
    }
  }
`

const LEADERBOARD_FILTERED = gql`
  query leaderBoardUser($address: Bytes!) {
    user(id: $address) {
      id
      txCount
      totalVolume
    }
  }
`

const LEADERBOARDWEEK = gql`
  query leaderBoardWeek($startTime: Int!) {
    userWeekDatas(orderBy: date, first: 300, orderDirection: desc, where: { date: $startTime }) {
      id
      date
      txCount
      totalVolume
      address
    }
  }
`
const LEADERBOARDMONTH = gql`
  query leaderBoardMonth($startTime: Int!) {
    userMonthDatas(orderBy: date, first: 300, orderDirection: desc, where: { date: $startTime }) {
      id
      date
      txCount
      totalVolume
      address
    }
  }
`

/**
 * Fetch leaderboard
 */
export function useLeaderboardData(
  time: TimePeriodLeaderboard,
  dateRange?: ILeaderBoardDateRange,
  filterTokens?: string[]
): {
  loading: boolean
  error: boolean
  data?: LeaderBoard[] | Omit<LeaderBoard, 'date' | 'address'>[]
} {
  const [tradesData, setTradesData] = useState<any>(null)
  const [isLoadingTrades, setIsLoadingTrades] = useState(false)
  const [tradeError, setTradeError] = useState(false)
  const [searchParams] = useSearchParams()
  const period = useMemo(() => {
    switch (time) {
      case TimePeriodLeaderboard.DAY:
        return 0
      case TimePeriodLeaderboard.WEEK:
        return 604800
      case TimePeriodLeaderboard.MONTH:
        return 2629743
    }
  }, [time])

  const utcCurrentTime = dayjs()
  const restTime = utcCurrentTime.unix() % period
  const startTimestamp = utcCurrentTime.unix() - restTime

  const {
    loading: loadingWeek,
    error: errorWeek,
    data: dataWeek,
  } = useQuery<LeaderboardDataResponseWeek>(LEADERBOARDWEEK, {
    client: apolloClient,
    variables: {
      startTime: startTimestamp,
    },
  })

  const {
    loading: loadingMonth,
    error: errorMonth,
    data: dataMonth,
  } = useQuery<LeaderBoarDataResponseMonth>(LEADERBOARDMONTH, {
    client: apolloClient,
    variables: {
      startTime: startTimestamp,
    },
  })

  const { loading, error, data } = useQuery<LeaderBoarDataResponseAll>(LEADERBOARD, {
    client: apolloClient,
  })

  const leaderBoard = useMemo(() => {
    switch (time) {
      case TimePeriodLeaderboard.DAY:
        return data?.users
      case TimePeriodLeaderboard.WEEK:
        return dataWeek?.userWeekDatas
      case TimePeriodLeaderboard.MONTH:
        return dataMonth?.userMonthDatas
    }
  }, [data, dataMonth, dataWeek, time])
  const filterQueryParam = searchParams.get('filter')
  const recipients = filterQueryParam ? [filterQueryParam] : leaderBoard?.map((user) => user.id) || []

  const buildWhereFilter = (symbols: string[], recipients: string[], startTime?: number, endTime?: number) => {
    const where: any = {
      and: [
        {
          or: [{ token0_: { symbol_in: symbols } }, { token1_: { symbol_in: symbols } }],
        },
        { recipient_in: recipients },
        startTime && endTime ? { timestamp_gte: startTime, timestamp_lte: endTime } : {},
      ],
    }

    return where
  }

  const fetchAllTrades = async (where: any) => {
    let hasMore = true
    let skip = 0
    let allSwaps: any[] = []

    while (hasMore) {
      try {
        const result = await apolloClient.query({
          query: TRADES_BY_USER,
          variables: { where, skip },
        })

        if (result.data.swaps.length === 0 || skip >= 25000) {
          hasMore = false
        }

        allSwaps = [...allSwaps, ...result.data.swaps]
        skip += 1000
      } catch (error) {
        console.error('Error fetching trades:', error)
        hasMore = false
      }
    }
    return { swaps: allSwaps }
  }

  const loadTrades = useCallback(async () => {
    try {
      setIsLoadingTrades(true)
      const where = buildWhereFilter(filterTokens || [], recipients, dateRange?.start_date, dateRange?.end_date)
      const data = await fetchAllTrades(where)
      setTradesData(data)
    } catch (error) {
      setTradeError(true)
    } finally {
      setIsLoadingTrades(false)
    }
  }, [recipients])

  useEffect(() => {
    if (filterTokens!.length > 0 && dateRange?.start_date && dateRange?.end_date) {
      loadTrades()
    }
  }, [filterTokens, dateRange])

  const aggregatedTokensData = tradesData?.swaps?.reduce((acc: any, swap: any, i: number, currentArray: any[]) => {
    const { recipient, amountUSD } = swap
    if (!acc[recipient]) {
      const swapsCounter = currentArray.filter((s) => s.recipient === recipient).length
      acc[recipient] = { recipient, totalTokensTradeVolumeUSD: 0, txTokensCount: swapsCounter }
    }
    acc[recipient].totalTokensTradeVolumeUSD += parseFloat(amountUSD)
    return acc
  }, {})

  const formattedLeaderBoard = leaderBoard?.map((user) => {
    return {
      ...user,
      totalTokensTradeVolumeUSD: aggregatedTokensData?.[user.id]?.totalTokensTradeVolumeUSD || 0,
      txTokensCount: aggregatedTokensData?.[user.id]?.txTokensCount || 0,
    }
  })

  const anyError = Boolean(error && (errorWeek || errorMonth || tradeError))
  const anyLoading = Boolean(loading || loadingWeek || loadingMonth || isLoadingTrades)

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  return {
    loading: anyLoading,
    error: anyError,
    data: formattedLeaderBoard,
  }
}

export default function useLeaderboardFilteredData(address: string): {
  loading: boolean
  error: boolean
  data?: Omit<LeaderBoard, 'date' | 'address'>
} {
  const { loading, error, data } = useQuery<LeaderBoarDataResponseUser>(LEADERBOARD_FILTERED, {
    client: apolloClient,
    variables: {
      address,
    },
  })

  const anyError = Boolean(error)
  const anyLoading = Boolean(loading)

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }

  return {
    loading: anyLoading,
    error: anyError,
    data: data?.user,
  }
}

// eslint-disable-next-line import/no-unused-modules
export const useTradesByUser = (symbol: string, recipients: string[]) => {
  const { data, loading, error } = useQuery(TRADES_BY_USER, {
    client: apolloClient,
    variables: {
      symbol,
      recipients,
    },
  })

  return {
    data,
    loading,
    error,
  }
}
