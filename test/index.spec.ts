import { describe, expect, test } from 'vitest'
import ac from '../src'
import {
  EXTENSION_COMPACT_FIELDS,
  EXTENSION_QUALITY_MAP,
} from '../src/lib/const'

describe('default export', () => {
  test('has extension functions', () => {
    const keys = [
      Object.values(EXTENSION_COMPACT_FIELDS),
      Object.values(EXTENSION_QUALITY_MAP),
      Object.keys(EXTENSION_QUALITY_MAP),
      // from extensionEssential
      'launcher',
      // from extensionQuality
      'iDP',
      // as public axios chain create function
      'create',
    ]

    keys.flat().forEach((key: any) => {
      // @ts-expect-error
      expect(ac[key]).instanceOf(Function)
    })
  })
})

// TODO: add more tests
