// src/app/craft/CraftContext.tsx
'use client'
import React, { createContext, useContext } from 'react'
import { Craft } from './lib/craft'

type CraftContextType = {
  craft?: Craft
}

const CraftContext = createContext<CraftContextType | undefined>(undefined)

export const useSampleContext = () => {
  return useContext(CraftContext)!
}

export { CraftContext }