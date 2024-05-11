import type { AxiosChainConfig } from './base'

export interface MergeArgs {
  (): AxiosChainConfig
  (url: string): AxiosChainConfig
  (config: AxiosChainConfig): AxiosChainConfig
  (url: string, config: AxiosChainConfig): AxiosChainConfig
}
