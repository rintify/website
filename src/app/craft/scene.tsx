// components/ThreeScene.tsx
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { alignGrid, createColoredGrid, createRegularNPyramidGeometry, createWeldedRegularNPyramidGeometry } from './object'
import { look } from './camera'
import { createBasis } from './world'

export class Craft {
   readonly renderer
   readonly camera
   readonly scene
   readonly geometry

  constructor(width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(0, 4, 10)

    const dir1 = new THREE.DirectionalLight(0xffffff, 2)
    dir1.position.set(1, 0, 1)
    this.scene.add(dir1)

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5)
    dir2.position.set(-1, 0, -1)
    this.scene.add(dir2)

    const ambient = new THREE.AmbientLight(0xffffff, 0.2)
    this.scene.add(ambient)

    this.geometry = createWeldedRegularNPyramidGeometry(3,2,2)

    const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(this.geometry, material)
    this.scene.add(mesh)

    const center = new THREE.Vector3(0, 0, 0)
    const basis = createBasis([center, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0)])!
    const grid = createColoredGrid(60, 2, '#f00', '#00f', '#0f0', '#888', 0.3)
    alignGrid(grid, basis)
    this.scene.add(grid)

    look(this.camera.quaternion, center.clone().sub(this.camera.position).normalize())
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  render(){
    this.renderer.render(this.scene, this.camera)
  }
}
