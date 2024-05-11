import type { AxiosChainConfigInternal } from '../types/base'
import type { MergeArgs } from '../types/internal'
import { EXTENSION_QUALITY_MAP } from './const'

export function mergeConfig(
  from: AxiosChainConfigInternal,
  to: AxiosChainConfigInternal,
  useShallowMerge = true
) {
  const next = { ...to }

  for (const key of Object.keys(to)) {
    // @ts-expect-error
    if (useShallowMerge && Object.values(EXTENSION_QUALITY_MAP).includes(key)) {
      shallowMerge(from, next, key)
    } else {
      replace(from, next, key)
    }
  }

  return next
}

export const mergeArgs: MergeArgs = (...args: any[]) => {
  if (args.length === 0) return {}
  if (args.length === 1) {
    if (typeof args[0] === 'string') return { url: args[0] }
    return args[0]
  }
  if (args.length === 2) {
    return { url: args[0], ...args[1] }
  }
}

export function shallowMerge(
  from: Record<any, any>,
  to: Record<any, any>,
  key: any
) {
  if (
    from[key] !== null &&
    typeof from[key] === 'object' &&
    to[key] !== null &&
    typeof to[key] === 'object'
  ) {
    to[key] = { ...to[key], ...from[key] }
  } else {
    to[key] = from[key]
  }

  return to
}

export function replace(
  from: Record<any, any>,
  to: Record<any, any>,
  key: any
) {
  to[key] = from[key]
  return to
}
