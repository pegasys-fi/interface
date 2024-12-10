import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import LeaderboardTable from 'components/Leaderboard/LeaderBoardTable'
import { LeaderboardUserTable } from 'components/Leaderboard/LeaderBoardUserTable'
import SearchBar from 'components/Leaderboard/SearchBar'
import TimeSelector from 'components/Leaderboard/TimeSelector'
import { MAX_WIDTH_MEDIA_BREAKPOINT, MEDIUM_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { MouseoverTooltip } from 'components/Tooltip'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { DateTimeSelector } from '../../components/Leaderboard/DateTimeSelector'
import TokenSelector from '../../components/Leaderboard/TokenSelector'

const LeaderBoardLayout = styled.div`
  width: 100%;
  min-width: 320px;
  padding: 68px 12px 0px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`
const TitleContainer = styled.div`
  margin-bottom: 32px;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  margin-left: auto;
  margin-right: auto;
  display: flex;
`

const FiltersContainer = styled.div<{ $marginRight?: string }>`
  display: flex;
  gap: 8px;
  height: 40px;
  margin-right: ${({ $marginRight }) => $marginRight || '0px'};

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    order: 2;
  }
`

const DateContainer = styled(FiltersContainer)`
  margin-left: 8px;
  width: 25%;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    width: 40%;
    margin: 0px;
    order: 1;
  }
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SearchContainer = styled(FiltersContainer)`
  margin-left: 8px;
  width: 100%;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    margin: 0px;
    order: 1;
  }
`
const FiltersWrapper = styled.div`
  display: flex;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  margin: 0 auto;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.textTertiary};
  flex-direction: row;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    gap: 8px;
  }
`

const LeaderBoardUserWrapper = styled.div`
  margin: 0 auto;
  margin-bottom: 20px;
`

export function LeaderBoard() {
  const { account } = useWeb3React()

  return (
    <LeaderBoardLayout id="contest-page">
      <TitleContainer>
        <MouseoverTooltip
          text={<Trans>This table contains the leader board with ranking and volume.</Trans>}
          placement="bottom"
        >
          <ThemedText.LargeHeader>
            <Trans>Leaderboard</Trans>
          </ThemedText.LargeHeader>
        </MouseoverTooltip>
      </TitleContainer>
      <LeaderBoardUserWrapper>{!!account && <LeaderboardUserTable address={account} />}</LeaderBoardUserWrapper>
      <FiltersWrapper>
        <FiltersContainer $marginRight="10px">
          <TokenSelector />
        </FiltersContainer>
        <FiltersContainer>
          <TimeSelector />
        </FiltersContainer>
        <DateContainer>
          <DateTimeSelector />
        </DateContainer>
        <SearchContainer>
          <SearchBar />
        </SearchContainer>
      </FiltersWrapper>
      <LeaderboardTable address={account ? account : undefined} />
    </LeaderBoardLayout>
  )
}
