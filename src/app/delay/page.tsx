'use client'

import React, { Suspense, lazy, ComponentType, JSX } from 'react'

function delayImport<T>(
  importPromise: Promise<{ default: T }>,
  ms: number
): Promise<{ default: T }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      importPromise.then(resolve)
    }, ms)
  })
}

const RealPage = lazy<ComponentType<unknown>>(() =>
  delayImport(import('../home/page'), 5000)
)

export default RealPage
