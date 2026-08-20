import { describe, test } from 'vitest'
import { create } from '../src'
import type {
  Extension,
  ExtensionContextCreate,
  ExtensionResult,
} from '../src'

describe('extension context typing', () => {
  test('inline extension receives the accumulated context and preserves fluent self', () => {
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
        create().foo('from-a')
        create().onlyA(1)
        return create().config({ headers: { test: 'ok' } })
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

  test('reusable extension can declare a required extension context', () => {
    type Auth = {
      auth: (token: string) => ReturnType<ExtensionContextCreate>
    }

    const auth: Extension<{}, Auth> = (create) => ({
      auth() {
        return create()
      },
    })

    type Users = {
      me: () => ReturnType<ExtensionContextCreate<Auth>>
    }

    const users: Extension<Auth, Users> = (create) => ({
      me() {
        return create().auth('token')
      },
    })

    const base = create()

    // @ts-expect-error users requires auth in the current extension context
    base.extend(users)

    base.extend(auth).extend(users).me().auth('token')
  })
})

void ({} as ExtensionResult)
