import { Link } from 'react-router-dom'
import styled, { DefaultTheme } from 'styled-components/macro'
import { BREAKPOINTS } from 'theme'
import { useIsDarkMode } from 'theme/components/ThemeToggle'

enum CardType {
  Primary = 'Primary',
  Secondary = 'Secondary',
}

const StyledCard = styled.div<{ isDarkMode: boolean; backgroundImgSrc?: string; type: CardType }>`
  display: flex;
  background: ${({ isDarkMode, backgroundImgSrc, type, theme }) =>
    isDarkMode
      ? `${type === CardType.Primary ? theme.backgroundModule : theme.backgroundSurface} ${
          backgroundImgSrc ? ` url(${backgroundImgSrc})` : ''
        }`
      : `${type === CardType.Primary ? 'white' : theme.backgroundModule} url(${backgroundImgSrc})`};
  background-size: cover;
  background-position: right;
  background-repeat: no-repeat;
  background-origin: border-box;

  flex-direction: column;
  justify-content: space-between;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  padding: 24px;
  height: 212px;
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.backgroundBorderGradient};
  box-shadow: 0px 10px 24px 0px rgba(51, 53, 72, 0.04);
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} border`};

  &:hover {
    border: 1px solid ${({ theme }) => theme.accentAction};
  }

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    height: ${({ backgroundImgSrc }) => (backgroundImgSrc ? 360 : 260)}px;
  }
  @media screen and (min-width: ${BREAKPOINTS.xl}px) {
    padding: 32px;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CardTitle = styled.div`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;

  @media screen and (min-width: ${BREAKPOINTS.lg}px) {
    font-size: 28px;
    line-height: 36px;
  }
`

const getCardDescriptionColor = (type: CardType, theme: DefaultTheme) => {
  switch (type) {
    case CardType.Secondary:
      return theme.textSecondary
    default:
      return theme.white
  }
}

const CardDescription = styled.div<{ type: CardType }>`
  display: flex;
  flex-direction: column;
  font-size: 16px;
  line-height: 20px;
  color: ${({ theme, type }) => getCardDescriptionColor(type, theme)};
  padding: 0 40px 0 0;
  max-width: 480px;

  @media screen and (min-width: ${BREAKPOINTS.xl}px) {
    font-size: 20px;
    line-height: 28px;
    max-width: 480px;
  }
`

const CardCTA = styled(CardDescription)`
  color: ${({ theme }) => theme.accentActive};
  font-weight: 500;
  margin: 24px 0 0;
  cursor: pointer;

  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} opacity`};

  &:hover {
    opacity: 0.6;
  }
`

const Card = ({
  type = CardType.Primary,
  title,
  description,
  cta,
  to,
  external,
  backgroundImgSrc,
  icon,
  elementName,
}: {
  type?: CardType
  title: string
  description: string
  cta?: string
  to: string
  external?: boolean
  backgroundImgSrc?: string
  icon?: React.ReactNode
  elementName?: string
}) => {
  const isDarkMode = useIsDarkMode()
  return (
    <StyledCard
      type={type}
      as={external ? 'a' : Link}
      to={external ? undefined : to}
      href={external ? to : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopenener noreferrer' : undefined}
      isDarkMode={isDarkMode}
      backgroundImgSrc={backgroundImgSrc}
    >
      <TitleRow>
        <CardTitle>{title}</CardTitle>
        {icon}
      </TitleRow>
      <CardDescription type={type}>
        {description}
        <CardCTA type={type}>{cta}</CardCTA>
      </CardDescription>
    </StyledCard>
  )
}

export default Card
