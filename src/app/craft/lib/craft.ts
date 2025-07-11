// components/ThreeScene.tsx
import React, { useRef, useEffect } from 'react'
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Object3D,
  Object3DEventMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { alignGrid, createColoredGrid, createPoint, createPyramid } from './object'
import { computeBoundsTree, acceleratedRaycast, disposeBoundsTree } from 'three-mesh-bvh'
import { look } from './camera'
import { Basis, createBasis } from './coordinate'

class WorkObject extends Group {
  constructor(
    readonly mesh: Mesh,
    readonly edge: LineSegments
  ) {
    super()
    this.mesh = mesh
    this.edge = edge
    this.add(this.mesh)
    this.add(this.edge)
  }
}

type FaceState = {
  o: WorkObject
  faceId: number
}

type VertexState = {
  o: WorkObject
  vertexId: number
}

export class Craft {
  basis: Basis
  readonly renderer
  readonly camera
  readonly grid
  readonly scene
  readonly material = new MeshStandardMaterial({ color: 0xffffff, flatShading: true })
  readonly lineMaterial = new LineBasicMaterial({ color: 0x0a0a0a })
  readonly sMaterial = new MeshBasicMaterial({ color: 0xffee99 })
  readonly sLineMaterial = new LineBasicMaterial({ color: 0xff8800, linewidth: 100 })
  readonly center: Vector3
  workObjects: WorkObject[] = []
  selectedObjects: WorkObject[] = []
  readonly selectedFaces: FaceState[] = []
  readonly selectedVertexes: FaceState[] = []
  readonly raycaster: Raycaster
  pointerMode: 'pointer' | 'vertex' | 'face' | 'object' = 'pointer'
  readonly pointer

  constructor(width: number, height: number) {
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
    BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
    Mesh.prototype.raycast = acceleratedRaycast

    this.scene = new Scene()
    this.scene.background = new Color(0xffffff)

    this.raycaster = new Raycaster()
    this.raycaster.firstHitOnly = true

    this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(0, 4, 10)

    this.pointer = createPoint()
    this.pointer.visible = false
    this.scene.add(this.pointer)

    const dir1 = new DirectionalLight(0xffffff, 3)
    dir1.position.set(100, 100, 100)
    this.scene.add(dir1)

    const dir2 = new DirectionalLight(0xffffff, 2)
    dir2.position.set(-100, -100, -100)
    this.scene.add(dir2)

    const ambient = new AmbientLight(0xffffff, 0.7)
    this.scene.add(ambient)

    this.center = new Vector3(0, 0, 0)
    this.basis = createBasis([this.center, new Vector3(0, 0, 1), new Vector3(1, 0, 0)])!
    this.grid = createColoredGrid(0.5, 100, 5, 5, 5, '#f00', '#05f', '#0d0', '#888', 0.3, 0.2)
    alignGrid(this.grid, this.basis)
    this.scene.add(this.grid)

    look(this.camera.position, this.camera.quaternion, this.center, new Vector3(0, 1, 0))
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  addGeometry(geometry: BufferGeometry, isWork: boolean) {
    const mesh = new Mesh(geometry, this.material)
    geometry.computeVertexNormals()
    geometry.computeBoundsTree()
    const edges = new EdgesGeometry(geometry)
    const edgeLines = new LineSegments(edges, this.lineMaterial)
    const o = new WorkObject(mesh, edgeLines)
    this.scene.add(o)
    if (isWork) this.workObjects.push(o)
    return o
  }

  disposeWorkObject(o: WorkObject, removeWork: boolean) {
    this.scene.remove(o)
    o.mesh.geometry.dispose()
    o.edge.geometry.dispose()
    if (removeWork) this.workObjects = this.workObjects.filter(oo => oo !== o)
  }

  notifySelected() {
    const set = new Set(this.selectedObjects)
    this.selectedObjects.forEach(o => {
      if (set.has(o)) {
        o.mesh.material = this.sMaterial
        o.edge.material = this.sLineMaterial
      } else {
        o.mesh.material = this.material
        o.edge.material = this.lineMaterial
      }
    })
    this.render()
  }

  dispose() {
    const toRemove: Object3D<Object3DEventMap>[] = []
    this.scene.traverse((o: any) => {
      const obj = o as Object3D<Object3DEventMap> & Mesh

      if (obj.geometry) {
        obj.geometry.dispose()
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((mat: any) => {
          if (mat.map) mat.map.dispose()
          mat.dispose()
        })
      }
      toRemove.push(obj)
    })
    toRemove.forEach(obj => {
      if (obj.parent) obj.parent.remove(obj)
    })
  }
}
