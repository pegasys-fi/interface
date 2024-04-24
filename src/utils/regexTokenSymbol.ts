// eslint-disable-next-line import/no-unused-modules
export const regexTokenSymbol = (symbol?: string) => {
  return symbol?.replace(/[x0-9]/gi, '')
}
