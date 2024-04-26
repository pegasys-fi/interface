export const regexTokenSymbol = (symbol?: string) => {
  return symbol?.replace(/[x0-9]/gi, '')
}
