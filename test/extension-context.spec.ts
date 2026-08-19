import { describe, expect, test } from 'vitest'
import { create } from '../src'

describe('extension context typing', () => {
  test('second extension sees the previous chain while fluent self resolves final chain', () => {
    const afterA = create().extend((create) => ({
      foo(value: string) {
        return create({ config: { next: { params: { value } } } })
      },
      onlyA(value: number) {
        return value.toFixed()
      },
    }))

    const afterB = afterA.extend((create) => ({
      bar() {
        create.previous.foo('from-a')
        expect(create.previous.onlyA(1)).toBe('1')
        return create()
      },
      foo(value: number) {
        return create({ config: { next: { params: { value } } } })
      },
    }))

    afterB.foo(1)
    afterB.onlyA(2)
    afterB.bar().foo(2)

    // @ts-expect-error plugin B shadows plugin A's foo signature
    afterB.foo('old')
  })
})
