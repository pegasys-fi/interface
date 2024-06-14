import { parse } from 'qs'

import { Field } from './actions'
import { queryParametersToSwapState } from './hooks'

describe('hooks', () => {
  describe('#queryParametersToSwapState', () => {
    test('SYS to USDC', () => {
      expect(
        queryParametersToSwapState(
          parse(
            '?inputCurrency=SYS&outputCurrency=0x368433CaC2A0B8D76E64681a9835502a1f2A8A30&exactAmount=1&exactField=output',
            { parseArrays: false, ignoreQueryPrefix: true }
          )
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: '0x368433CaC2A0B8D76E64681a9835502a1f2A8A30' },
        [Field.INPUT]: { currencyId: 'SYS' },
        typedValue: '1',
        independentField: Field.OUTPUT,
        recipient: null,
      })
    })

    test('does not duplicate eth for invalid output token', () => {
      expect(
        queryParametersToSwapState(parse('?outputCurrency=invalid', { parseArrays: false, ignoreQueryPrefix: true }))
      ).toEqual({
        [Field.INPUT]: { currencyId: 'SYS' },
        [Field.OUTPUT]: { currencyId: null },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('output SYS only', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=1', { parseArrays: false, ignoreQueryPrefix: true })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'SYS' },
        [Field.INPUT]: { currencyId: null },
        typedValue: '1',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('invalid recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=1&recipient=abc', { parseArrays: false, ignoreQueryPrefix: true })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'SYS' },
        [Field.INPUT]: { currencyId: null },
        typedValue: '1',
        independentField: Field.INPUT,
        recipient: null,
      })
    })

    test('valid recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=1&recipient=0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5', {
            parseArrays: false,
            ignoreQueryPrefix: true,
          })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'SYS' },
        [Field.INPUT]: { currencyId: null },
        typedValue: '1',
        independentField: Field.INPUT,
        recipient: '0x0fF2D1eFd7A57B7562b2bf27F3f37899dB27F4a5',
      })
    })
    test('accepts any recipient', () => {
      expect(
        queryParametersToSwapState(
          parse('?outputCurrency=eth&exactAmount=1&recipient=bob.argent.xyz', {
            parseArrays: false,
            ignoreQueryPrefix: true,
          })
        )
      ).toEqual({
        [Field.OUTPUT]: { currencyId: 'SYS' },
        [Field.INPUT]: { currencyId: null },
        typedValue: '1',
        independentField: Field.INPUT,
        recipient: 'bob.argent.xyz',
      })
    })
  })
})
