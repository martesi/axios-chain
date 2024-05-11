import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

type OrArray<T> = T | T[]

export type AxiosChain<E extends ExtensionResult = {}> = AxiosChainCore<E> & {
  [K in keyof E]: ReturnType<E[K]> extends AxiosChainCurrent
    ? (...args: Parameters<E[K]>) => AxiosChain<E>
    : E[K]
}
export interface AxiosChainConfigInternal extends AxiosRequestConfig {
  pathParams?: unknown
  resolveUrlFrom?: OrArray<keyof AxiosChainConfigInternal>
  resolveUrl?: (context: ResolveUrlContext) => string | undefined
  axios?: AxiosInstance
  extensions?: Extension[]
}

export type AxiosChainConfig = Omit<AxiosChainConfigInternal, 'extensions'>

export interface ResolveUrlContext {
  config: AxiosChainConfigInternal
  url: string | undefined
  source: unknown
  trigger: keyof AxiosChainConfigInternal
}

export interface Extension {
  (create: ExtensionContextCreate, config: AxiosChainConfig): ExtensionResult
}

export type ExtensionContextCreate = (
  config?: ExtensionCreateConfig
) => AxiosChainCurrent

const REPLACE_TAG = Symbol('axios-chain/replace')

export interface AxiosChainCurrent extends AxiosChain {
  [REPLACE_TAG]: true
}

export type ExtensionResult = Record<any, (...args: any[]) => unknown>

export interface ExtensionCreateConfig {
  config?: { next: AxiosChainConfig }
}

export interface AxiosChainCore<E extends ExtensionResult> {
  <T = any>(config?: AxiosChainConfigInternal): Promise<AxiosResponse<T>>

  <T = any>(url: string, config?: AxiosChainConfigInternal): Promise<
    AxiosResponse<T>
  >

  replace(config: AxiosChainConfig): AxiosChain<E>

  config(config: AxiosChainConfig): AxiosChain<E>

  extend<C extends Extension>(
    custom: C
  ): AxiosChain<{
    [K in keyof E | keyof ReturnType<C>]: K extends keyof ReturnType<C>
      ? ReturnType<C>[K]
      : E[K]
  }>
}
