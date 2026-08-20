import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

type OrArray<T> = T | T[]

type Override<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never
}

declare const REPLACE_TAG: unique symbol

interface AxiosChainCurrentMarker {
  [REPLACE_TAG]: true
}

export type AxiosChain<E extends ExtensionResult = {}> = AxiosChainCore<E> & {
  [K in keyof E]: ReturnType<E[K]> extends AxiosChainCurrentMarker
    ? (...args: Parameters<E[K]>) => AxiosChainCurrent<E>
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
  Requires extends ExtensionResult = {},
  Result extends ExtensionResult = ExtensionResult,
> {
  (create: ExtensionContextCreate<Requires>, config: AxiosChainConfig): Result
}

export type ExtensionContextCreate<Requires extends ExtensionResult = {}> = (
  config?: ExtensionCreateConfig
) => AxiosChainCurrent<Requires>

export type AxiosChainCurrent<E extends ExtensionResult = {}> = AxiosChain<E> &
  AxiosChainCurrentMarker

export type ExtensionResult = Record<any, (...args: any[]) => unknown>

export interface ExtensionCreateConfig {
  config?: { next: AxiosChainConfig }
}

export interface AxiosChainCore<E extends ExtensionResult> {
  <T = any>(config?: AxiosChainConfigInternal): Promise<AxiosResponse<T>>

  <T = any>(url: string, config?: AxiosChainConfigInternal): Promise<
    AxiosResponse<T>
  >

  replace(config: AxiosChainConfig): this

  config(config: AxiosChainConfig): this

  extend<R extends ExtensionResult>(
    custom: Extension<E, R>
  ): AxiosChain<Override<E, R>>
}
