import 'react-datepicker/dist/react-datepicker.css'

import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { ChevronDown, ChevronUp } from 'react-feather'
import styled from 'styled-components/macro'

import { convertDateToTimestamp } from '../../graphql/utils/util'
import { MouseoverTooltip } from '../Tooltip'
import { filterDateRangeAtom } from './state'

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
  border: none;
  outline: none;
  transition: background-color ${({ theme }) => theme.transition.duration.fast};
  min-width: 280px;

  :active {
    background-color: ${({ theme }) => theme.accentActiveSoft};
  }

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.accentActiveSoft};
    color: ${({ theme }) => theme.accentActive};
  }
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const StyledMenuContent = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  width: 100%;
`

const Chevron = styled.span<{ open: boolean }>`
  padding-top: 1px;
  color: ${({ open, theme }) => (open ? theme.accentActive : theme.textSecondary)};
`

const DatePickerWrapper = styled.div`
  position: absolute;
  top: 48px;
  left: 0;
  z-index: 100;
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  border-radius: 12px;
  padding: 12px;
  box-shadow: ${({ theme }) => theme.deepShadow};

  .react-datepicker {
    font-family: inherit;
    border: none;
    background-color: ${({ theme }) => theme.backgroundSurface};
    color: ${({ theme }) => theme.textPrimary};
    border-radius: 12px;
    box-shadow: none;
  }

  .react-datepicker__header {
    background-color: ${({ theme }) => theme.backgroundInteractive};
    border-bottom: none;
    padding: 12px 16px;
    color: ${({ theme }) => theme.textPrimary};
    font-size: 16px;
    font-weight: bold;
  }

  .react-datepicker__current-month {
    color: ${({ theme }) => theme.textPrimary};
  }

  .react-datepicker__day--in-range {
    background-color: ${({ theme }) => theme.accentActiveSoft};
    color: ${({ theme }) => theme.accentActive};
    border-radius: 9000px;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme }) => theme.accentActive};
    color: ${({ theme }) => theme.accentTextDarkPrimary} !important;
    border-radius: 9000px;

    &:hover {
      background-color: ${({ theme }) => theme.accentActiveSoft};
      color: ${({ theme }) => theme.accentActive} !important;
      border-radius: 9000px;
    }
  }

  .react-datepicker__day--in-selecting-range {
    background-color: ${({ theme }) => theme.accentActiveSoft};
    color: ${({ theme }) => theme.accentActive};
    border-radius: 9000px;
  }

  .react-datepicker__day,
  .react-datepicker__day-name {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    margin: 0.166rem;
    color: ${({ theme }) => theme.textPrimary};
    border-radius: 50%;

    &:hover {
      background-color: ${({ theme }) => theme.accentActiveSoft};
      color: ${({ theme }) => theme.accentActive};
      border-radius: 9000px;
    }
  }

  .react-datepicker__day--selected {
    background-color: ${({ theme }) => theme.accentActiveSoft};
    color: ${({ theme }) => theme.textPrimary};
  }

  .react-datepicker__day--today {
    border: 1px solid ${({ theme }) => theme.accentAction};
  }

  .react-datepicker__navigation {
    top: 16px;
  }
`

export const DateTimeSelector = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setDateRange] = useAtom(filterDateRangeAtom)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [open, setOpen] = useState(false)

  const onChange = (dates: any) => {
    const [start, end] = dates
    if (start && end) {
      const formattedStart = convertDateToTimestamp(start)
      const formattedEnd = convertDateToTimestamp(end)
      setDateRange({ start_date: formattedStart, end_date: formattedEnd })
    }

    setStartDate(start)
    setEndDate(end)
  }

  useEffect(() => {
    setDateRange({ start_date: undefined, end_date: undefined })
  }, [])

  return (
    <StyledMenu>
      <MouseoverTooltip text="Filter for UNO Trade volume" placement="top">
        <FilterOption onClick={() => setOpen((prev) => !prev)} active={open}>
          <StyledMenuContent>
            {startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : 'Select Date Range'}
            <Chevron open={open}>{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</Chevron>
          </StyledMenuContent>
        </FilterOption>
      </MouseoverTooltip>
      {open && (
        <DatePickerWrapper>
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            isClearable
          />
        </DatePickerWrapper>
      )}
    </StyledMenu>
  )
}
