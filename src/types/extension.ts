import type { AxiosResponse } from 'axios'
import type {
  EXTENSION_COMPACT_FIELDS,
  EXTENSION_QUALITY_MAP,
} from '../lib/const'
import type { AxiosChainConfig, AxiosChainCurrent } from './base'

export type ExtensionEssential = Record<
  (typeof EXTENSION_QUALITY_MAP)[keyof typeof EXTENSION_QUALITY_MAP],
  (value: unknown) => AxiosChainCurrent
> & { launcher<T = any>(): () => Promise<AxiosResponse<T>> }

export type ExtensionCompact = Record<
  (typeof EXTENSION_COMPACT_FIELDS)[number],
  {
    <T = any>(config?: string | AxiosChainConfig): Promise<AxiosResponse<T>>

    <T = any>(url: string, config?: AxiosChainConfig): Promise<AxiosResponse<T>>
  }
>

export type ExtensionQuality = Record<
  keyof typeof EXTENSION_QUALITY_MAP,
  <T = any>(value: unknown) => Promise<AxiosResponse<T>>
> & { iDP<T = any>(data: unknown, params: unknown): Promise<AxiosResponse<T>> }
