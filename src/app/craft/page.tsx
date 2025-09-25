// src/app/craft/page.tsx
'use client'
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Craft } from './lib/craft'
import Button from '@/components/Button'
import { useModal } from '@/hooks/ModalContext'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { unfold } from './flatten/flatten'
import { PolygonSVG } from './flatten/draw'
import { flatten } from './flatten/flatten'
import { toCraftyMesh, Unfolded } from './flatten/utils'
import Joystick from './compo/joystick'
import { moveCenter, moveOrbit } from './lib/camera'
import { Loupe, PopButton } from './compo/loupe'
import { BasisIcon, ObjectIcon } from '@/icons'
import { CraftAnimate, deleteObject, deselect, lookSelected, putObject, rotateBasis, selectByPointer, setBasis } from './lib/operate'
import ButtonDiv from '@/components/TextButton'
import { CraftContext, useSampleContext } from './CraftContext'

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const craft = useRef<Craft | undefined>(undefined)
  const { pushModal } = useModal()
  const [animations, setAnimations] = useState<CraftAnimate[]>([])
  const animationRef = useRef<number>(0)
  const lastTime = useRef(performance.now())
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const animate = useCallback(() => {
    const deltaTime = (performance.now() - lastTime.current) / 1000
    lastTime.current = performance.now()
    const res = animations.filter(a => !a(deltaTime))
    animations.splice(0, animations.length, ...res)
    craft.current?.render()
    if (animations.length >= 1) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [animations])

  useEffect(() => {
    lastTime.current = performance.now()
    cancelAnimationFrame(animationRef.current)
    if (animations.length >= 1) animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [animations])

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
      if (craft.current) {
        craft.current.dispose()
        mountRef.current?.removeChild(craft.current.renderer.domElement)
      }
    }
  }, [])

  function handleClick() {
    if (!craft.current) return

    const df: Unfolded = []
    craft.current.workObjects.forEach(o => {
      const g = toCraftyMesh(o.mesh.geometry)
      const a = unfold(g.verts, g.tris)
      const d = flatten(g.verts, a)
      df.push(...d)
    })

    pushModal('c', () => {
      return (
        <div style={{ width: '80vw', height: '80vh' }}>
          <PolygonSVG polygons={df}></PolygonSVG>
        </div>
      )
    })
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <CraftContext.Provider value={{ craft: craft.current }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            ref={mountRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            onClick={e => {
              selectByPointer(
                craft.current,
                new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
              )
              forceUpdate()
            }}
          />
          <Joystick
            onFrame={(dir, deltaTime) => {
              if (!craft.current || !dir) return
              const camera = craft.current.camera
              moveOrbit(
                camera.position,
                camera.quaternion,
                craft.current.center,
                craft.current.up,
                dir,
                0.8,
                deltaTime
              )
              craft.current.render()
            }}
          />
          <Loupe
            style={{ right: '1.8rem', bottom: '4rem' }}
            onFrame={(dir, deltaTime) => {
              if (!craft.current) return
              moveCenter(craft.current.camera.position, craft.current.center, Math.pow(2, dir), deltaTime)
              craft.current.render()
            }}
          />
          <div
            style={{
              position: 'absolute',
              alignItems: 'flex-end',
              right: '5rem',
              bottom: '1rem',
              width: '10rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <PopButton
              isExist={craft.current && craft.current.selectedPositions.length >= 1}
              onClick={() => {
                deselect(craft.current)
                forceUpdate()
              }}
            >
              選択解除
            </PopButton>
            <PopButton
              isExist={craft.current && craft.current.selectedPositions.length >= 1}
              onClick={() => {
                deleteObject(craft.current)
                forceUpdate()
              }}
            >
              削除する
            </PopButton>
            <PopButton
              isExist={craft.current && craft.current.selectedPositions.length >= 1}
              onClick={() => {
                const res = setBasis(craft.current) 
                if(res) setAnimations(p => [...p, res])
              }}
            >
              基底を移動
            </PopButton>
            <PopButton
              isExist={true}
              onClick={() => {
                const res = lookSelected(craft.current)
                if (res) setAnimations(p => [...p, res])
              }}
            >
              見る
            </PopButton>
          </div>
          <div
            style={{
              position: 'absolute',
              right: '2rem',
              bottom: '12rem',
              width: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <ObjectIcon style={{ opacity: 0.3, width: '2rem' }} onClick={handleClick} />
            <ObjectIcon
              style={{ opacity: 0.3, width: '2rem' }}
              onClick={() => {
                putObject(craft.current)
              }}
            />
            <BasisIcon
              style={{ opacity: 0.3, width: '2rem' }}
              onClick={() => {
                const res = rotateBasis(craft.current)
                if (res) setAnimations(p => [...p, res])
              }}
            />
          </div>
        </div>
      </CraftContext.Provider>
    </div>
  )
}

export default ThreeScene
