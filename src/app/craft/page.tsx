// components/SampleContext.tsx
'use client'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { Craft } from './lib/craft'
import Button from '@/components/ui/Button'
import { useModal } from '@/hooks/ModalContext'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { unfold } from './flatten/flatten'
import {PolygonSVG} from './flatten/draw'
import { flatten } from './flatten/flatten'
import { toCraftyMesh } from './flatten/utils'
import Joystick from './compo/joystick'
import { moveCenter, moveOrbit } from './lib/camera'
import { Loupe } from './compo/loupe'

type CraftContextType = {
  craft?: Craft
}

const CraftContext = createContext<CraftContextType | undefined>(undefined)

export const useSampleContext = () => {
  return useContext(CraftContext)!
}

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const craft = useRef<Craft | undefined>(undefined)
  const { pushModal } = useModal()

  useEffect(() => {
    if (!mountRef.current) return
    craft.current = new Craft(mountRef.current.clientWidth, mountRef.current.clientHeight)

    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(craft.current.renderer.domElement)

    const handleResize = () => {
      if (!craft.current) return
      craft.current.resize(mountRef.current!.clientWidth, mountRef.current!.clientHeight)
      craft.current.render()
    }
    window.addEventListener('resize', handleResize)

    craft.current.render()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (craft.current) mountRef.current?.removeChild(craft.current.renderer.domElement)
    }
  }, [])

  function handleClick() {
    if(!craft.current) return

    const g = toCraftyMesh(craft.current.geometry)
    const a = unfold(g.verts, g.tris)
    const d = flatten(g.verts,a)
    
    pushModal('c', () => {
      return (
        <div style={{ width: '80vw', height: '80vh' }}>
          <PolygonSVG  polygons={d}></PolygonSVG>
        </div>
      )
    })
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CraftContext.Provider value={{ craft: craft.current }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          <Joystick onFrame={(dir, deltaTime) => {
            if(!craft.current || !dir) return
            const camera = craft.current.camera
            moveOrbit(camera.position, camera.quaternion,craft.current.center,new THREE.Vector3(0,1,0),dir,0.5,deltaTime)
            craft.current.render()
          }}/>
          <Loupe style={{right: '3rem', bottom: '4rem'}} onFrame={(dir, deltaTime) => {
            if(!craft.current) return
            moveCenter(craft.current.camera.position, craft.current.center, Math.pow(2,dir), deltaTime)
            craft.current.render()
          }}/>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
            <div
              style={{
                padding: '0.5rem',
                gap: '0.5rem',
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                width: '15rem',
                height: '20rem',
                backgroundColor: '#fff8',
                border: '1px solid #000',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Button style={{ width: '5rem' }} onClick={handleClick}>
                展開図
              </Button>
            </div>
          </div>
        </div>
      </CraftContext.Provider>
    </div>
  )
}

export default ThreeScene
