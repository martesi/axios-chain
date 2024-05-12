import defaultAxiosInstance from 'axios'
import { mergeArgs, mergeConfig } from './lib/core'
import {
  extensionCompact,
  extensionEssential,
  extensionQuality,
} from './lib/extension'
import type {
  AxiosChain,
  AxiosChainConfig,
  AxiosChainConfigInternal,
  AxiosChainCurrent,
  Extension,
  ExtensionCompact,
  ExtensionCreateConfig,
  ExtensionEssential,
  ExtensionQuality,
  ExtensionResult,
  MergeArgs,
} from './types'

function create(initial: AxiosChainConfigInternal = {}) {
  const { extensions = [], ...publicConfig } = initial
  const base = (...args: Parameters<MergeArgs>) =>
    request(mergeConfig(publicConfig, mergeArgs(...args)))

  const core = {
    extend: (custom: Extension) =>
      create({
        ...initial,
        extensions: extensions.concat(custom),
      }),
    config: (config: AxiosChainConfigInternal) =>
      create(mergeConfig(initial, config)),
    replace: (config: AxiosChainConfigInternal) =>
      create(mergeConfig(initial, config, false)),
  }

  function createForExtension(config?: ExtensionCreateConfig) {
    let instance = base

    if (config?.config?.next) {
      instance = create(mergeConfig(initial, config.config.next))
    }

    // that tag is just for type replacement, not need to implement for now.
    return instance as AxiosChainCurrent
  }

  const fromExtensions = extensions.reduce(
    (acc, ext) => Object.assign(acc, ext(createForExtension, publicConfig)),
    {} as ExtensionResult
  )

  return Object.assign(base, core, fromExtensions)
}

function request(config: AxiosChainConfigInternal) {
  let {
    pathParams,
    resolveUrl,
    resolveUrlFrom,
    axios = defaultAxiosInstance,
    ...axiosRequestConfig
  } = config

  if (typeof resolveUrlFrom === 'string') {
    resolveUrlFrom = [resolveUrlFrom]
  }

  if (resolveUrl && Array.isArray(resolveUrlFrom)) {
    for (const key of resolveUrlFrom) {
      if (typeof config[key] === 'undefined') return

      const result = resolveUrl({
        config,
        source: config[key],
        url: axiosRequestConfig.url,
        trigger: key,
      })

      if (typeof result === 'string') {
        axiosRequestConfig.url = result
        break
      }
    }
  }

  return axios(axiosRequestConfig)
}

function createForUser(initial?: AxiosChainConfig): AxiosChain {
  return create(initial) as any
}

type AxiosChainDefault = AxiosChain<
  ExtensionCompact & ExtensionEssential & ExtensionQuality
> & {
  create: typeof createForUser
}

const ac: AxiosChainDefault = Object.assign(
  createForUser()
    .extend(extensionEssential)
    .extend(extensionCompact)
    .extend(extensionQuality),
  { create: createForUser }
)

export type {
  AxiosChain,
  AxiosChainConfig,
  Extension,
  ExtensionCreateConfig,
  ResolveUrlContext,
} from './types/base'
export * from './lib/extension'
export { createForUser as create }
export default ac
