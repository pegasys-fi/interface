/* Copied from Uniswap/v-3: https://github.com/Uniswap/v3-info/blob/master/src/utils/numbers.ts */
import { Currency, CurrencyAmount, Price } from '@pollum-io/sdk-core'
import { DEFAULT_LOCALE, SupportedLocale } from 'constants/locales'
import numbro from 'numbro'

// Number formatting follows the standards laid out in this spec:
// https://www.notion.so/uniswaplabs/Number-standards-fbb9f533f10e4e22820722c2f66d23c0

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
}

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
  useGrouping: false,
}

const NO_DECIMALS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
}

const NO_DECIMALS_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  currency: 'USD',
  style: 'currency',
}

const THREE_DECIMALS_NO_TRAILING_ZEROS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
}

const THREE_DECIMALS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
}

const THREE_DECIMALS_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
  currency: 'USD',
  style: 'currency',
}

const THREE_DECIMALS_NO_TRAILING_ZEROS_CURRENCY: NumberFormatOptions = {
  ...THREE_DECIMALS_NO_TRAILING_ZEROS,
  currency: 'USD',
  style: 'currency',
}

const TWO_DECIMALS_NO_TRAILING_ZEROS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 2,
}

const TWO_DECIMALS_NO_TRAILING_ZEROS_CURRENCY: NumberFormatOptions = {
  ...TWO_DECIMALS_NO_TRAILING_ZEROS,
  currency: 'USD',
  style: 'currency',
}

const TWO_DECIMALS: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
}

const TWO_DECIMALS_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
}

const EIGHT_DECIMALS_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  maximumFractionDigits: 8,
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
}

const SHORTHAND_TWO_DECIMALS: NumberFormatOptions = {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

const SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS: NumberFormatOptions = {
  notation: 'compact',
  maximumFractionDigits: 2,
}

const SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS_CURRENCY: NumberFormatOptions = {
  ...SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
  currency: 'USD',
  style: 'currency',
}

const SHORTHAND_ONE_DECIMAL: NumberFormatOptions = {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}

const SHORTHAND_CURRENCY_TWO_DECIMALS: NumberFormatOptions = {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
}

const SHORTHAND_CURRENCY_ONE_DECIMAL: NumberFormatOptions = {
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  currency: 'USD',
  style: 'currency',
}

const SIX_SIG_FIGS_TWO_DECIMALS: NumberFormatOptions = {
  notation: 'standard',
  maximumSignificantDigits: 6,
  minimumSignificantDigits: 3,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
}

const SIX_SIG_FIGS_NO_COMMAS: NumberFormatOptions = {
  notation: 'standard',
  maximumSignificantDigits: 6,
  useGrouping: false,
}

const SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS: NumberFormatOptions = {
  notation: 'standard',
  maximumSignificantDigits: 6,
  minimumSignificantDigits: 3,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  useGrouping: false,
}

const ONE_SIG_FIG_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  minimumSignificantDigits: 1,
  maximumSignificantDigits: 1,
  currency: 'USD',
  style: 'currency',
}

const THREE_SIG_FIGS_CURRENCY: NumberFormatOptions = {
  notation: 'standard',
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 3,
  currency: 'USD',
  style: 'currency',
}

const SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY: NumberFormatOptions = {
  notation: 'scientific',
  minimumSignificantDigits: 7,
  maximumSignificantDigits: 7,
  currency: 'USD',
  style: 'currency',
}

// Convert [CurrencyAmount] to number with necessary precision for price formatting.
export const currencyAmountToPreciseFloat = (currencyAmount: CurrencyAmount<Currency> | undefined) => {
  if (!currencyAmount) return undefined
  const floatForLargerNumbers = parseFloat(currencyAmount.toExact())
  if (floatForLargerNumbers < 0.1) {
    return parseFloat(currencyAmount.toSignificant(6))
  }
  return floatForLargerNumbers
}

// Convert [Price] to number with necessary precision for price formatting.
export const priceToPreciseFloat = (price: Price<Currency, Currency> | undefined) => {
  if (!price) return undefined
  const floatForLargerNumbers = parseFloat(price.toFixed(9))
  if (floatForLargerNumbers < 0.1) {
    return parseFloat(price.toSignificant(6))
  }
  return floatForLargerNumbers
}

interface FormatDollarArgs {
  num?: number | null
  isPrice?: boolean
  lessPreciseStablecoinValues?: boolean
  digits?: number
  round?: boolean
}

/**
 * Returns a USD dollar or equivalent denominated numerical value formatted
 * in human readable string for use in template.
 *
 * Adheres to guidelines for prices and other numbers defined here:
 * https://www.notion.so/uniswaplabs/Number-standards-fbb9f533f10e4e22820722c2f66d23c0
 * @param num numerical value denominated in USD or USD equivalent
 * @param isPrice whether the amount represents a price or not
 * @param lessPreciseStablecoinValues whether or not we should show less precise values for
 * stablecoins (around 1$ in value always) for the sake of readability
 * @param digits number of digits after the decimal for non-price amounts
 * @param round whether or not to round up non-price amounts
 */
export const formatDollar = ({
  num,
  isPrice = false,
  lessPreciseStablecoinValues = false,
  digits = 2,
  round = true,
}: FormatDollarArgs): string => {
  // For USD dollar denominated prices.
  if (isPrice) {
    if (num === 0) return '$0.00'
    if (!num) return '-'
    if (num < 0.000001) {
      return `$${num.toExponential(2)}`
    }
    if ((num >= 0.000001 && num < 0.1) || num > 1000000) {
      return `$${Number(num).toPrecision(3)}`
    }
    // We only show 2 decimal places in explore table for stablecoin value ranges
    // for the sake of readability (as opposed to the usual 3 elsewhere).
    if (num >= 0.1 && num < (lessPreciseStablecoinValues ? 0.9995 : 1.05)) {
      return `$${num.toFixed(3)}`
    }
    return `$${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
  }
  // For volume dollar amounts, like market cap, total value locked, etc.
  else {
    if (num === 0) return '$0.00'
    if (!num) return '-'
    if (num < 0.000001) {
      return '$<0.000001'
    }
    if (num >= 0.000001 && num < 0.1) {
      return `$${Number(num).toPrecision(3)}`
    }
    if (num >= 0.1 && num < 1.05) {
      return `$${num.toFixed(3)}`
    }

    return numbro(num)
      .formatCurrency({
        average: round,
        mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
          million: 'M',
          billion: 'B',
        },
      })
      .toUpperCase()
  }
}

/**
 * Returns a numerical amount of any token formatted in human readable string for use in template.
 *
 * For transaction review numbers, such as token quantities, NFT price (token-denominated),
 *  network fees, transaction history items. Adheres to guidelines defined here:
 * https://www.notion.so/uniswaplabs/Number-standards-fbb9f533f10e4e22820722c2f66d23c0
 * @param num numerical value denominated in any token
 * @param maxDigits the maximum number of digits that should be shown for the quantity
 */
export const formatTransactionAmount = (num: number | undefined | null, maxDigits = 9) => {
  if (num === 0) return '0.00'
  if (!num) return ''
  if (num < 0.00001) {
    return '<0.00001'
  }
  if (num >= 0.00001 && num < 1) {
    return `${Number(num.toFixed(5)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    })}`
  }
  if (num >= 1 && num < 10000) {
    return `${Number(num.toPrecision(6)).toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`
  }
  if (num >= 10000 && num < 1000000) {
    return `${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
  }
  // For very large numbers, switch to scientific notation and show as much precision
  // as permissible by maxDigits param.
  if (num >= Math.pow(10, maxDigits - 1)) {
    return `${num.toExponential(maxDigits - 3)}`
  }
  return `${Number(num.toFixed(2)).toLocaleString(DEFAULT_LOCALE, { minimumFractionDigits: 2 })}`
}

// each rule must contain either an `upperBound` or an `exact` value.
// upperBound => number will use that formatter as long as it is < upperBound
// exact => number will use that formatter if it is === exact
// if hardcodedinput is supplied it will override the input value or use the hardcoded output
type HardCodedInputFormat =
  | {
      input: number
      prefix?: string
      hardcodedOutput?: undefined
    }
  | {
      input?: undefined
      prefix?: undefined
      hardcodedOutput: string
    }

type Nullish<T> = T | null | undefined
type NumberFormatOptions = Intl.NumberFormatOptions

type FormatterBaseRule = { formatterOptions: NumberFormatOptions }
type FormatterExactRule = { upperBound?: undefined; exact: number } & FormatterBaseRule
type FormatterUpperBoundRule = { upperBound: number; exact?: undefined } & FormatterBaseRule

type FormatterRule = (FormatterExactRule | FormatterUpperBoundRule) & { hardCodedInput?: HardCodedInputFormat }

enum NumberType {
  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // used for token quantity stats where shorthand is okay (e.g. pool stats balances)
  TokenQuantityStats = 'token-quantity-stats',

  // used for token quantities in transaction contexts (e.g. swap, send)
  TokenTx = 'token-tx',

  // this formatter is used for displaying swap price conversions
  // below the input/output amounts
  SwapPrice = 'swap-price',

  // this formatter is only used for displaying the swap trade output amount
  // in the text input boxes. Output amounts on review screen should use the above TokenTx formatter
  SwapTradeAmount = 'swap-trade-amount',

  SwapDetailsAmount = 'swap-details-amount',

  // fiat values for price, volume, tvl, etc in a chart header or scale
  ChartFiatValue = 'chart-fiat-value',

  // fiat values for volume bar chart scales (y axis ticks)
  ChartVolumePriceScale = 'chart-volume-price-scale',

  // fiat prices in any component that belongs in the Token Details flow (except for token stats)
  FiatTokenDetails = 'fiat-token-details',

  // fiat prices everywhere except Token Details flow
  FiatTokenPrice = 'fiat-token-price',

  // fiat values for market cap, TVL, volume in the Token Details screen
  FiatTokenStats = 'fiat-token-stats',

  // fiat price of token balances
  FiatTokenQuantity = 'fiat-token-quantity',

  // fiat gas prices
  FiatGasPrice = 'fiat-gas-price',

  // portfolio balance
  PortfolioBalance = 'portfolio-balance',

  // nft floor price denominated in a token (e.g, ETH)
  NFTTokenFloorPrice = 'nft-token-floor-price',

  // nft collection stats like number of items, holder, and sales
  NFTCollectionStats = 'nft-collection-stats',

  // nft floor price with trailing zeros
  NFTTokenFloorPriceTrailingZeros = 'nft-token-floor-price-trailing-zeros',

  // nft token price in currency
  NFTToken = 'nft-token',

  // nft token price in local fiat currency
  FiatNFTToken = 'fiat-nft-token',

  // whole number formatting
  WholeNumber = 'whole-number',
}

type FormatterType = NumberType | FormatterRule[]

interface FormatNumberOptions {
  input: Nullish<number>
  type?: FormatterType
  placeholder?: string
  locale?: SupportedLocale
  localCurrency?: '$'
  conversionRate?: number
}

function formatNumber({
  input,
  type = NumberType.TokenNonTx,
  placeholder = '-',
  locale = DEFAULT_LOCALE,
  localCurrency = '$',
  conversionRate,
}: FormatNumberOptions): string {
  if (input === null || input === undefined) {
    return placeholder
  }

  const { hardCodedInput, formatterOptions } = getFormatterRule(input, type, conversionRate)

  if (formatterOptions.currency) {
    input = conversionRate ? input * conversionRate : input
    formatterOptions.currency = localCurrency
    formatterOptions.currencyDisplay = '$'
  }

  if (!hardCodedInput) {
    return new Intl.NumberFormat(locale, formatterOptions).format(input)
  }

  if (hardCodedInput.hardcodedOutput) {
    return hardCodedInput.hardcodedOutput
  }

  const { input: hardCodedInputValue, prefix } = hardCodedInput
  if (hardCodedInputValue === undefined) return placeholder
  return (prefix ?? '') + new Intl.NumberFormat(locale, formatterOptions).format(hardCodedInputValue)
}
interface FormatCurrencyAmountOptions {
  amount: Nullish<CurrencyAmount<Currency>>
  type?: FormatterType
  placeholder?: string
  locale?: SupportedLocale
  localCurrency?: '$'
  conversionRate?: number
}

export function formatCurrencyAmount({
  amount,
  type = NumberType.TokenNonTx,
  placeholder,
  locale = DEFAULT_LOCALE,
  localCurrency = '$',
  conversionRate,
}: FormatCurrencyAmountOptions): string {
  return formatNumber({
    input: amount ? parseFloat(amount.toSignificant()) : undefined,
    type,
    placeholder,
    locale,
    localCurrency,
    conversionRate,
  })
}

// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
const tokenNonTxFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  { upperBound: 0.001, hardCodedInput: { input: 0.001, prefix: '<' }, formatterOptions: THREE_DECIMALS },
  { upperBound: 1, formatterOptions: THREE_DECIMALS },
  { upperBound: 1e6, formatterOptions: TWO_DECIMALS },
  { upperBound: 1e15, formatterOptions: SHORTHAND_TWO_DECIMALS },
  {
    upperBound: Infinity,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
  },
]

const tokenQuantityStatsFormatter: FormatterRule[] = [
  // if token stat value is 0, we probably don't have the data for it, so show '-' as a placeholder
  { exact: 0, hardCodedInput: { hardcodedOutput: '-' }, formatterOptions: NO_DECIMALS },
  { upperBound: 0.01, hardCodedInput: { input: 0.01, prefix: '<' }, formatterOptions: TWO_DECIMALS },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS },
  { upperBound: Infinity, formatterOptions: SHORTHAND_ONE_DECIMAL },
]

const tokenTxFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  {
    upperBound: 0.00001,
    hardCodedInput: { input: 0.00001, prefix: '<' },
    formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN,
  },
  { upperBound: 1, formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN },
  { upperBound: 10000, formatterOptions: SIX_SIG_FIGS_TWO_DECIMALS },
  { upperBound: Infinity, formatterOptions: TWO_DECIMALS },
]

const swapTradeAmountFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  { upperBound: 0.1, formatterOptions: SIX_SIG_FIGS_NO_COMMAS },
  { upperBound: 1, formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS },
  { upperBound: Infinity, formatterOptions: SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS },
]

const swapDetailsAmountFormatter: FormatterRule[] = [{ upperBound: Infinity, formatterOptions: SIX_SIG_FIGS_NO_COMMAS }]

const swapPriceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  {
    upperBound: 0.00001,
    hardCodedInput: { input: 0.00001, prefix: '<' },
    formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN,
  },
  ...swapTradeAmountFormatter,
]

const fiatTokenDetailsFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  {
    upperBound: 0.00000001,
    hardCodedInput: { input: 0.00000001, prefix: '<' },
    formatterOptions: ONE_SIG_FIG_CURRENCY,
  },
  { upperBound: 0.1, formatterOptions: THREE_SIG_FIGS_CURRENCY },
  { upperBound: 1.05, formatterOptions: THREE_DECIMALS_CURRENCY },
  { upperBound: 1e6, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS },
]

const chartVolumePriceScale: FormatterRule[] = [
  {
    upperBound: 0.001,
    hardCodedInput: { input: 0.001, prefix: '<' },
    formatterOptions: ONE_SIG_FIG_CURRENCY,
  },
  { upperBound: 2, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: 1000, formatterOptions: NO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: SHORTHAND_CURRENCY_ONE_DECIMAL },
]

const chartFiatValueFormatter: FormatterRule[] = [
  // if token stat value is 0, we probably don't have the data for it, so show '-' as a placeholder
  { exact: 0, hardCodedInput: { hardcodedOutput: '-' }, formatterOptions: ONE_SIG_FIG_CURRENCY },
  { upperBound: 1.05, formatterOptions: EIGHT_DECIMALS_CURRENCY },
  { upperBound: 1e6, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS },
]

const fiatTokenPricesFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  {
    upperBound: 0.00000001,
    hardCodedInput: { input: 0.00000001, prefix: '<' },
    formatterOptions: ONE_SIG_FIG_CURRENCY,
  },
  { upperBound: 1, formatterOptions: THREE_SIG_FIGS_CURRENCY },
  { upperBound: 1e6, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: 1e16, formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS },
  { upperBound: Infinity, formatterOptions: SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY },
]

const fiatTokenStatsFormatter: FormatterRule[] = [
  // if token stat value is 0, we probably don't have the data for it, so show '-' as a placeholder
  { exact: 0, hardCodedInput: { hardcodedOutput: '-' }, formatterOptions: ONE_SIG_FIG_CURRENCY },
  { upperBound: 0.01, hardCodedInput: { input: 0.01, prefix: '<' }, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: SHORTHAND_CURRENCY_ONE_DECIMAL },
]

const fiatGasPriceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS_CURRENCY },
  { upperBound: 0.01, hardCodedInput: { input: 0.01, prefix: '<' }, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: 1e6, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS },
]

const fiatTokenQuantityFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  ...fiatGasPriceFormatter,
]

const portfolioBalanceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  { upperBound: Infinity, formatterOptions: TWO_DECIMALS_CURRENCY },
]

const ntfTokenFloorPriceFormatterTrailingZeros: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  { upperBound: 0.001, hardCodedInput: { input: 0.001, prefix: '<' }, formatterOptions: THREE_DECIMALS },
  { upperBound: 1, formatterOptions: THREE_DECIMALS },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS },
  { upperBound: 1e15, formatterOptions: SHORTHAND_TWO_DECIMALS },
  {
    upperBound: Infinity,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
  },
]

const ntfTokenFloorPriceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  { upperBound: 0.001, hardCodedInput: { input: 0.001, prefix: '<' }, formatterOptions: THREE_DECIMALS },
  { upperBound: 1, formatterOptions: THREE_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: 1e15, formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS },
  {
    upperBound: Infinity,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
  },
]

const ntfCollectionStatsFormatter: FormatterRule[] = [
  { upperBound: 1000, formatterOptions: NO_DECIMALS },
  { upperBound: Infinity, formatterOptions: SHORTHAND_ONE_DECIMAL },
]

const nftTokenFormatter: FormatterRule[] = [
  { exact: 0, hardCodedInput: { hardcodedOutput: '-' }, formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN },
  {
    upperBound: 0.0001,
    hardCodedInput: { input: 0.0001, prefix: '<' },
    formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN,
  },
  { upperBound: 1.0, formatterOptions: THREE_DECIMALS },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS_NO_TRAILING_ZEROS },
  { upperBound: 1e15, formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS },
  {
    upperBound: Infinity,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
  },
]

const fiatNftTokenFormatter: FormatterRule[] = [
  { exact: 0, hardCodedInput: { hardcodedOutput: '-' }, formatterOptions: NO_DECIMALS },
  {
    upperBound: 0.0001,
    hardCodedInput: { input: 0.0001, prefix: '<' },
    formatterOptions: ONE_SIG_FIG_CURRENCY,
  },
  { upperBound: 1.0, formatterOptions: THREE_DECIMALS_NO_TRAILING_ZEROS_CURRENCY },
  { upperBound: 1000, formatterOptions: TWO_DECIMALS_NO_TRAILING_ZEROS_CURRENCY },
  { upperBound: 1e15, formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS_CURRENCY },
  {
    upperBound: Infinity,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS_CURRENCY,
  },
]

const wholeNumberFormatter: FormatterRule[] = [{ upperBound: Infinity, formatterOptions: NO_DECIMALS }]

const TYPE_TO_FORMATTER_RULES = {
  [NumberType.TokenNonTx]: tokenNonTxFormatter,
  [NumberType.TokenQuantityStats]: tokenQuantityStatsFormatter,
  [NumberType.TokenTx]: tokenTxFormatter,
  [NumberType.SwapPrice]: swapPriceFormatter,
  [NumberType.SwapTradeAmount]: swapTradeAmountFormatter,
  [NumberType.SwapDetailsAmount]: swapDetailsAmountFormatter,
  [NumberType.FiatTokenQuantity]: fiatTokenQuantityFormatter,
  [NumberType.FiatTokenDetails]: fiatTokenDetailsFormatter,
  [NumberType.ChartFiatValue]: chartFiatValueFormatter,
  [NumberType.ChartVolumePriceScale]: chartVolumePriceScale,
  [NumberType.FiatTokenPrice]: fiatTokenPricesFormatter,
  [NumberType.FiatTokenStats]: fiatTokenStatsFormatter,
  [NumberType.FiatGasPrice]: fiatGasPriceFormatter,
  [NumberType.PortfolioBalance]: portfolioBalanceFormatter,
  [NumberType.NFTTokenFloorPrice]: ntfTokenFloorPriceFormatter,
  [NumberType.NFTTokenFloorPriceTrailingZeros]: ntfTokenFloorPriceFormatterTrailingZeros,
  [NumberType.NFTCollectionStats]: ntfCollectionStatsFormatter,
  [NumberType.NFTToken]: nftTokenFormatter,
  [NumberType.FiatNFTToken]: fiatNftTokenFormatter,
  [NumberType.WholeNumber]: wholeNumberFormatter,
}

function getFormatterRule(input: number, type: FormatterType, conversionRate?: number): FormatterRule {
  const rules = Array.isArray(type) ? type : TYPE_TO_FORMATTER_RULES[type]
  for (const rule of rules) {
    const shouldConvertInput = rule.formatterOptions.currency && conversionRate
    const convertedInput = shouldConvertInput ? input * conversionRate : input

    if (
      (rule.exact !== undefined && convertedInput === rule.exact) ||
      (rule.upperBound !== undefined && convertedInput < rule.upperBound)
    ) {
      return rule
    }
  }

  throw new Error(`formatter for type ${type} not configured correctly for value ${input}`)
}
