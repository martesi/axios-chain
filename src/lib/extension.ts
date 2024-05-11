import type {
  ExtensionCompact,
  ExtensionContextCreate,
  ExtensionEssential,
  ExtensionQuality,
} from '../types'
import type { MergeArgs } from '../types/internal'
import {
  EXTENSION_COMPACT_FIELDS,
  EXTENSION_QUALITY_MAP,
  EXTENSION_QUALITY_MAP as MAP,
} from './const'
import { mergeArgs } from './core'

export function extensionEssential(
  create: ExtensionContextCreate
): ExtensionEssential {
  const base = Object.values(MAP).reduce((acc, curr) => {
    acc[curr] = (value: unknown) =>
      create({ config: { next: { [curr]: value } } })
    return acc
  }, {} as any)

  const plus: Partial<ExtensionEssential> = { launcher: () => () => create()() }

  return Object.assign(base, plus)
}

export const extensionCompact = (
  create: ExtensionContextCreate
): ExtensionCompact =>
  EXTENSION_COMPACT_FIELDS.reduce((acc, field) => {
    acc[field] = (...args: Parameters<MergeArgs>) =>
      create({ config: { next: mergeArgs(...args) } })()
    return acc
  }, {} as any)

export function extensionQuality(
  create: ExtensionContextCreate
): ExtensionQuality {
  const base = Object.entries(EXTENSION_QUALITY_MAP).reduce((acc, [k, v]) => {
    acc[k] = (value: unknown) => create({ config: { next: { [v]: value } } })()
    return acc
  }, {} as any)

  const plus: Partial<ExtensionQuality> = {
    iDP: (data, params) => create({ config: { next: { data, params } } })(),
  }
  return Object.assign(base, plus)
}
