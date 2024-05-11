import { describe, expect, test } from 'vitest'
import { EXTENSION_QUALITY_MAP } from '../../src/lib/const'
import { mergeArgs, mergeConfig, replace, shallowMerge } from '../../src/lib/core'

describe('shallow merge', () => {
  const key = EXTENSION_QUALITY_MAP.iData
  const fromValue = { say: 'hello', newMember: 'introduction' }
  const from = { [key]: fromValue }
  const toValue = { say: 'hey', oldDude: 'welcome' }
  const to = { [key]: toValue }

  shallowMerge(from, to, key)

  test('will not change value from the source', () => {
    expect(from[key]).toBe(fromValue)
    expect(fromValue.say).toBe('hello')
    expect(fromValue.newMember).toBe('introduction')
  })

  test('will change where the key points to in the target', () => {
    expect(to[key]).not.toBe(toValue)
  })

  test('will not change value from the target', () => {
    expect(toValue.say).toBe('hey')
    expect(toValue.oldDude).toBe('welcome')
  })

  test('the new target now have the merge values', () => {
    expect(to[key].say).toBe('hello')
    expect(to[key].oldDude).toBe('welcome')
    // @ts-expect-error
    expect(to[key].newMember).toBe('introduction')
  })
})

describe('replace', () => {
  const key = 'someKey'
  const fromValue = { say: 'hello', newMember: 'introduction' }
  const from = { [key]: fromValue }
  const toValue = { say: 'hey', oldDude: 'welcome' }
  const to = { [key]: toValue }

  replace(from, to, key)

  test('source and target value will not change', () => {
    expect(fromValue.say).toBe('hello')
    expect(fromValue.newMember).toBe('introduction')
    expect(toValue.say).toBe('hey')
    expect(toValue.oldDude).toBe('welcome')
  })

  test('key in from stays the same', () => {
    expect(from[key]).toBe(fromValue)
  })

  test('key in to becomes the value in from', () => {
    expect(to[key]).toBe(fromValue)
  })
})

describe('merge args', () => {
  test('empty object returned with no argument', () => {
    expect(Object.keys(mergeArgs()).length).toBe(0)
  })

  test('single string will be returned as url key', () => {
    const str = 'no way'
    expect(mergeArgs(str).url).toBe(str)
  })

  test('single object will be returned as is', () => {
    const dude = {}
    expect(mergeArgs(dude)).toBe(dude)
  })

  test('url in config will override provided url argument', () => {
    const str = 'will be replaced'
    const dude = { url: 'say what?', other: 'ok' }
    const result = mergeArgs(str, dude)
    expect(result.url).toBe(dude.url)
    // @ts-expect-error
    expect(result.other).toBe(dude.other)
  })

  test('nothing will be returned if arguments are more than 2', () => {
    // @ts-expect-error
    expect(mergeArgs(1, 2, 3)).toBeUndefined()
  })
})

describe('merge config', () => {
  test('always return new object', () => {
    const source = {}
    const target = {}
    const result = mergeConfig(source, target)

    expect(result).not.toBe(source)
    expect(result).not.toBe(target)
  })

  test('key in source will replace one in target', () => {
    const source = { url: 'say' }
    const target = { url: 'what' }

    expect(mergeConfig(source, target).url).toBe(source.url)
  })

  test('special keys will be merged when useShallowMerge', () => {
    Object.values(Object.values(EXTENSION_QUALITY_MAP)).forEach((key) => {
      const sourceValue = { say: 'what', how: 'do you do' }
      const source = { [key]: sourceValue }
      const targetValue = { say: 'hey', guess: 'what' }
      const target = { [key]: targetValue }
      const result = mergeConfig(source, target, true)

      expect(result[key].say).toBe('what')
      expect(result[key].how).toBe('do you do')
      expect(result[key].guess).toBe('what')
    })
  })

  test('normal keys will be replaced even when useShallowMerge', () => {
    const sourceValue = { say: 'what', how: 'do you do' }
    const source = { httpAgent: sourceValue }
    const targetValue = { say: 'hey', guess: 'what' }
    const target = { httpAgent: targetValue }
    const result = mergeConfig(source, target, true)

    expect(result.httpAgent.say).toBe('what')
    expect(result.httpAgent.how).toBe('do you do')
    expect(result.httpAgent.guess).toBeUndefined()
    expect(result.httpAgent).toBe(sourceValue)
  })
})
