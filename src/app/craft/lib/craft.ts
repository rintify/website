// components/ThreeScene.tsx
import React, { useRef, useEffect } from 'react'
import {
  AmbientLight,
  BoxGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { alignGrid, createColoredGrid, createPyramid } from './object'
import { look } from './camera'
import { createBasis } from './world'

export class Craft {
  readonly renderer
  readonly camera
  readonly scene
  readonly geometry
  readonly material
  center: Vector3

  constructor(width: number, height: number) {
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.scene = new Scene()
    this.scene.background = new Color(0xffffff)

    this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(0, 4, 10)

    const dir1 = new DirectionalLight(0xffffff, 3)
    dir1.position.set(100, 100, 100)
    this.scene.add(dir1)

    const dir2 = new DirectionalLight(0xffffff, 2)
    dir2.position.set(-100, -100, -100)
    this.scene.add(dir2)

    const ambient = new AmbientLight(0xffffff, 0.7)
    this.scene.add(ambient)

    this.material = new MeshStandardMaterial({ color: 0xffffff, flatShading: true })

    this.geometry = createPyramid(5,5,5)
    const mesh = new Mesh(this.geometry, this.material)
    this.geometry.computeVertexNormals()
    this.scene.add(mesh)

    const edges = new EdgesGeometry(this.geometry) 

    const lineMaterial = new LineBasicMaterial({ color: 0x0a0a0a })
    const edgeLines = new LineSegments(edges, lineMaterial)
    this.scene.add(edgeLines)

    this.center = new Vector3(0, 0, 0)
    const basis = createBasis([this.center, new Vector3(0, 0, 1), new Vector3(1, 0, 0)])!
    const grid = createColoredGrid(0.5,100, 5, 5, 5, '#f00', '#05f', '#0d0', '#888', 0.3, 0.2)
    alignGrid(grid, basis)
    this.scene.add(grid)

    look(this.camera.quaternion, this.center.clone().sub(this.camera.position).normalize())
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}
