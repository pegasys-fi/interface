import { gql, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { apolloClient } from 'graphql/thegraph/apollo'
import { TimePeriodLeaderboard } from 'graphql/utils/util'
import { LeaderBoard } from 'pages/Leaderboard'
import { useEffect, useMemo } from 'react'

import { ILeaderBoardDateRange } from '../../components/Leaderboard/state'

export type LeaderBoard = {
  address: string
  date: number
  id: string
  totalVolume: string
  totalUnoTradeVolumeUSD: number
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
    users(orderBy: totalVolume, first: 300, orderDirection: desc) {
      id
      txCount
      totalVolume
    }
  }
`

const TRADES_BY_USER = gql`
  query userTrades($where: Swap_filter) {
    swaps(first: 1000, where: $where) {
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
  dateRange?: ILeaderBoardDateRange
): {
  loading: boolean
  error: boolean
  data?: LeaderBoard[] | Omit<LeaderBoard, 'date' | 'address'>[]
} {
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

  const recipients = leaderBoard?.map((user) => user.id) || []

  const buildWhereFilter = (symbol: string, recipients: string[], startTime?: number, endTime?: number) => {
    const where: any = {
      token1_: { symbol },
      recipient_in: recipients,
    }

    if (startTime) {
      where.timestamp_gte = startTime
    }

    if (endTime) {
      where.timestamp_lte = endTime
    }

    return where
  }

  const {
    data: tradesData,
    loading: isLoadingTrades,
    error: tradeError,
    refetch,
  } = useQuery(TRADES_BY_USER, {
    client: apolloClient,
    variables: {
      where: buildWhereFilter('UNO', recipients, dateRange?.start_date, dateRange?.end_date),
    },
  })

  const aggregatedUnoData = tradesData?.swaps?.reduce((acc: any, swap: any) => {
    const { recipient, amountUSD } = swap
    if (!acc[recipient]) {
      acc[recipient] = { recipient, totalTradeVolumeUSD: 0 }
    }
    acc[recipient].totalTradeVolumeUSD += parseFloat(amountUSD)
    return acc
  }, {})

  const formattedLeaderBoard = leaderBoard?.map((user) => {
    return {
      ...user,
      totalUnoTradeVolumeUSD: aggregatedUnoData?.[user.id]?.totalTradeVolumeUSD || 0,
    }
  })

  useEffect(() => {
    if (dateRange) {
      refetch()
    }
  }, [dateRange, isLoadingTrades])

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
