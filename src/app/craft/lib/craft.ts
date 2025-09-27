import React, { useRef, useEffect } from 'react'
import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
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
  Plane,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { alignGrid, createColoredGrid, createPoint, createPyramid, createCross } from './object'
import { computeBoundsTree, acceleratedRaycast, disposeBoundsTree } from 'three-mesh-bvh'
import { look } from './camera'
import { Basis, createBasis } from './world'
import { deselect } from './operate'

export class WorkObject extends Group {
  readonly mesh: Mesh
  readonly edge: LineSegments
  readonly points: Points

  constructor(craft: Craft, geometry: BufferGeometry) {
    super()
    this.mesh = new Mesh(geometry, craft.material)
    geometry.computeVertexNormals()
    geometry.computeBoundsTree()

    const edges = new EdgesGeometry(geometry)
    this.edge = new LineSegments(edges, craft.lineMaterial)

    const posAttr = edges.getAttribute('position')
    const uniqueVerts = new Set<string>()
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i).toFixed(5)
      const y = posAttr.getY(i).toFixed(5)
      const z = posAttr.getZ(i).toFixed(5)
      uniqueVerts.add(`${x},${y},${z}`)
    }

    const cornerPositions = new Float32Array(uniqueVerts.size * 3)
    let idx = 0
    for (let key of uniqueVerts) {
      const [x, y, z] = key.split(',').map(Number)
      cornerPositions[idx++] = x
      cornerPositions[idx++] = y
      cornerPositions[idx++] = z
    }

    const ptsGeom = new BufferGeometry()
    ptsGeom.setAttribute('position', new BufferAttribute(cornerPositions, 3))

    this.points = new Points(ptsGeom, craft.pointMaterial)

    this.add(this.points)
    this.add(this.mesh)
    this.add(this.edge)

    craft.scene.add(this)
    craft.workObjects.push(this)
  }

  onSelected(craft: Craft, selected: boolean) {
    if (selected) {
      this.mesh.material = craft.sMaterial
      this.edge.material = craft.sLineMaterial
    } else {
      this.mesh.material = craft.material
      this.edge.material = craft.lineMaterial
    }
  }

  dispose(craft: Craft) {
    craft.scene.remove(this)
    this.mesh.geometry.dispose()
    this.edge.geometry.dispose()
  }
}

export class WorkPosition extends Points {
  constructor(
    craft: Craft,
    readonly o: WorkObject | undefined,
    pos: Vector3
  ) {
    const pointPosition = new Float32Array([0, 0, 0])
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(pointPosition, 3))

    super(geometry, craft.pointMaterial)
    this.o = o
    craft.scene.add(this)
    this.position.copy(pos)
  }

  onSelected(craft: Craft, selected: boolean) {
    if (selected) {
      this.material = craft.spointMaterial
    } else {
      this.material = craft.pointMaterial
    }
  }

  dispose(craft: Craft) {
    craft.scene.remove(this)
    this.geometry.dispose()
  }
}

export type Selectable = WorkObject | WorkPosition

export class Craft {
  basis: Basis
  readonly renderer
  readonly camera
  readonly grid
  readonly scene
  readonly centerPoint: Group // centerを可視化する十字（center座標を保持）

  readonly material = new MeshStandardMaterial({ color: 0xffffff, flatShading: true })
  readonly lineMaterial = new LineBasicMaterial({ color: 0x0a0a0a })
  readonly sMaterial = new MeshBasicMaterial({ color: 0xffee99 })
  readonly sLineMaterial = new LineBasicMaterial({ color: 0xff8800, linewidth: 100 })
  readonly spointMaterial = new PointsMaterial({
    color: 0xff00ff,
    size: 0.1,
  })
  readonly pointMaterial = new PointsMaterial({
    color: 0x000000,
    size: 0.01,
  })

  readonly up: Vector3 = new Vector3(0, 1, 0)
  workObjects: WorkObject[] = []
  selectedPositions: WorkPosition[] = []
  readonly raycaster: Raycaster

  // centerの座標を取得するgetter
  get center(): Vector3 {
    return this.centerPoint.position
  }

  isDragging = false
  dragStartPoint: Vector3 | null = null
  dragObjects: WorkObject[] = []
  initialPositions: Vector3[] = []
  panStartPointer: Vector2 | null = null
  panStartCameraPosition: Vector3 | null = null
  panStartCenter: Vector3 | null = null

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

    const dir1 = new DirectionalLight(0xffffff, 3)
    dir1.position.set(100, 100, 100)
    this.scene.add(dir1)

    const dir2 = new DirectionalLight(0xffffff, 2)
    dir2.position.set(-100, -100, -100)
    this.scene.add(dir2)

    const ambient = new AmbientLight(0xffffff, 0.7)
    this.scene.add(ambient)

    // centerを十字で可視化
    this.centerPoint = createCross(0.001, 0x888888)
    this.centerPoint.position.set(0, 0, 0)
    this.scene.add(this.centerPoint)

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

  disposeWorkObject(...os: Selectable[]) {
    const ss = new Set(os)
    os.forEach(o => {
      if (o instanceof WorkObject) {
        o.dispose(this)
      }
    })
    this.selectedPositions = this.selectedPositions.filter(o => !ss.has(o))
    this.updateSelected()
    this.workObjects = this.workObjects.filter(o => !ss.has(o))
  }

  updateSelected() {
    const set = new Set(this.selectedPositions.map(s => s.o))
    this.workObjects.forEach(o => {
      o.onSelected(this, set.has(o))
    })
    this.selectedPositions.forEach(o => o.onSelected(this, true))
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

  dragStart(pointer: Vector2): boolean {
    const selectedObjects = this.selectedPositions.map(p => p.o).filter(o => o) as WorkObject[]

    if (selectedObjects.length === 0) {
      this.isDragging = true
      this.panStartPointer = pointer.clone()
      this.panStartCameraPosition = this.camera.position.clone()
      this.panStartCenter = this.center.clone()
      return true
    }

    this.raycaster.setFromCamera(pointer, this.camera)

    const intersects = this.raycaster.intersectObjects(selectedObjects.map(obj => obj.mesh))
    let hitPoint: Vector3 | null = null

    if (intersects.length > 0) {
      hitPoint = intersects[0].point.clone()
    } else {
      const workPlane = new Plane()
      workPlane.setFromNormalAndCoplanarPoint(this.basis.z, this.basis.o)
      hitPoint = this.raycaster.ray.intersectPlane(workPlane, new Vector3())
    }

    if (hitPoint) {
      this.isDragging = true
      this.dragStartPoint = hitPoint.clone()
      this.dragObjects = selectedObjects
      this.initialPositions = selectedObjects.map(o => o.position.clone())
      return true
    }
    return false
  }

  dragMove(pointer: Vector2) {
    if (!this.isDragging) return

    if (this.panStartPointer && this.panStartCameraPosition && this.panStartCenter) {
      const deltaPointer = pointer.clone().sub(this.panStartPointer)

      const cameraMatrix = this.camera.matrix
      const right = new Vector3().setFromMatrixColumn(cameraMatrix, 0)
      const up = new Vector3().setFromMatrixColumn(cameraMatrix, 1)

      const distance = this.camera.position.distanceTo(this.center)
      const fov = (this.camera.fov * Math.PI) / 180
      const scale = 2 * Math.tan(fov / 2) * distance

      const panX = -deltaPointer.x * scale * this.camera.aspect
      const panY = -deltaPointer.y * scale

      const panDelta = right.multiplyScalar(panX).add(up.multiplyScalar(panY))

      this.camera.position.copy(this.panStartCameraPosition).add(panDelta)
      this.center.copy(this.panStartCenter).add(panDelta)

      this.render()
      return
    }

    if (this.dragStartPoint) {
      this.raycaster.setFromCamera(pointer, this.camera)

      const dragPlane = new Plane()
      dragPlane.setFromNormalAndCoplanarPoint(this.basis.z, this.dragStartPoint)

      const intersectPoint = this.raycaster.ray.intersectPlane(dragPlane, new Vector3())
      if (intersectPoint) {
        const delta = intersectPoint.sub(this.dragStartPoint)
        this.dragObjects.forEach((obj, i) => {
          obj.position.copy(this.initialPositions[i]).add(delta)
        })
        this.render()
      }
    }
  }

  dragEnd() {
    // オブジェクトのドラッグが行われていた場合、選択解除
    if (this.dragObjects.length > 0) {
      deselect(this)
    }
    
    this.isDragging = false
    this.dragStartPoint = null
    this.dragObjects = []
    this.initialPositions = []
    this.panStartPointer = null
    this.panStartCameraPosition = null
    this.panStartCenter = null
  }
}
