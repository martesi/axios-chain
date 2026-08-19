import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

type OrArray<T> = T | T[]

type Override<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never
}

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

export interface Extension<
  C extends AxiosChain = AxiosChain,
  R extends ExtensionResult = ExtensionResult,
> {
  (create: ExtensionContextCreate<C>, config: AxiosChainConfig): R
}

export type ExtensionContextCreate<C extends AxiosChain = AxiosChain> = ((
  config?: ExtensionCreateConfig
) => AxiosChainCurrent) & {
  previous: C
}

const REPLACE_TAG = Symbol('axios-chain/replace')

export type AxiosChainCurrent = AxiosChain & {
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

  extend<R extends ExtensionResult>(
    custom: Extension<AxiosChain<E>, R>
  ): AxiosChain<Override<E, R>>
}
