import { Matrix4, Mesh, Plane, Vector2, Vector3 } from 'three'
import { Brush, Evaluator, SUBTRACTION, INTERSECTION, REVERSE_SUBTRACTION } from 'three-bvh-csg'
import { Craft } from './craft'
import { alignGrid, createPyramid } from './object'
import { look } from './camera'

type OnFrame = (deltaTime: number) => boolean

export function putObject(craft?: Craft) {
  if (!craft) return
  craft.camera.position
  const geometry = createPyramid(4, 5, 5)
  const res = craft.addGeometry(geometry, true)
  res.position.copy(new Vector3(0, 0, -10).applyQuaternion(craft.camera.quaternion).add(craft.camera.position))
  craft.render()
}

export function deleteObject(craft?: Craft) {
  if (!craft) return
  const ss = new Set(craft.selectedObjects)
  craft.selectedObjects.forEach(o => craft.disposeWorkObject(o, false))
  craft.selectedObjects = []
  craft.workObjects = craft.workObjects.filter(o => !ss.has(o))
  craft.notifySelected()
  craft.render()
}

export function setBasis(craft: Craft | undefined) {
  if (!craft) return
  if (craft.pointer.visible) {
    craft.basis.o = craft.pointer.position
    alignGrid(craft.grid, craft.basis)
    craft.render()
  }
}

export function deselect(craft: Craft | undefined) {
  if (!craft) return
  craft.pointer.visible = false
  craft.selectedObjects = []
  craft.notifySelected()
}

export function lookSelected(craft: Craft | undefined): OnFrame | undefined {
  if (!craft) return
  return dt => {
    craft.center.lerp(craft.pointer.position, 5 * dt)
    look(craft.camera.position, craft.camera.quaternion, craft.center, new Vector3(0, 1, 0))
    return craft.center.distanceToSquared(craft.pointer.position) < 0.1
  }
}

export function selectByPointer(craft: Craft | undefined, pointer: Vector2): OnFrame | undefined {
  if (!craft) return
  const targets = craft.workObjects.map(s => s.mesh)
  craft.raycaster.setFromCamera(pointer, craft.camera)

  if (craft.pointerMode === 'pointer') {
    var plane = new Plane()
    plane.setFromNormalAndCoplanarPoint(craft.basis.z, craft.basis.o)
    const intersectPoint = craft.raycaster.ray.intersectPlane(plane, new Vector3())
    if (intersectPoint) {
      craft.pointer.visible = true
      craft.pointer.position.copy(intersectPoint)
      craft.render()
    }
    return
  }

  const hits = craft.raycaster.intersectObjects(targets, false)
  if (hits.length === 0) return

  const selected = craft.workObjects.find(o => o.mesh === hits[0].object)!

  if (craft.pointerMode === 'object') {
    if (!craft.selectedObjects.find(o => o === selected)) {
      craft.selectedObjects.push(selected)
      craft.notifySelected()
    } else {
      craft.selectedObjects = craft.selectedObjects.filter(o => o !== selected)
      craft.notifySelected()
    }
    return
  }

  const hit = hits[0]
  const hitFaceId = hit.faceIndex!
  const mesh = hits[0].object as Mesh
  const geom = mesh.geometry
  const index = geom.index
  const position = geom.attributes.position

  if (craft.pointerMode === 'face') {
    if (!craft.selectedFaces.find(s => s.faceId === hitFaceId))
      craft.selectedFaces.push({ faceId: hitFaceId, o: selected })
  }

  let i0, i1, i2
  if (index) {
    const faceIndex = hitFaceId * 3
    i0 = index.getX(faceIndex)
    i1 = index.getX(faceIndex + 1)
    i2 = index.getX(faceIndex + 2)
  } else {
    i0 = hitFaceId * 3
    i1 = i0 + 1
    i2 = i0 + 2
  }

  const v0 = new Vector3().fromBufferAttribute(position, i0).applyMatrix4(mesh.matrixWorld)
  const v1 = new Vector3().fromBufferAttribute(position, i1).applyMatrix4(mesh.matrixWorld)
  const v2 = new Vector3().fromBufferAttribute(position, i2).applyMatrix4(mesh.matrixWorld)

  const origin = craft.raycaster.ray.origin
  const d0 = origin.distanceTo(v0)
  const d1 = origin.distanceTo(v1)
  const d2 = origin.distanceTo(v2)

  let selectedVertex
  if (d0 <= d1 && d0 <= d2) selectedVertex = i0
  else if (d1 <= d2) selectedVertex = i1
  else selectedVertex = i2

  craft.selectedVertexes.push({ faceId: selectedVertex, o: selected })
}

export function cutMesh(craft?: Craft) {
  if (!craft) return
  const sel = craft.selectedObjects[0]
  if (!sel?.mesh?.geometry) return
  let targets = craft.selectedObjects.slice(1)
  if (targets.length === 0) targets = craft.workObjects

  const meshA = sel.mesh

  // Brush を作成してワールド行列を反映
  const brushA = new Brush(meshA.geometry)
  brushA.applyMatrix4(meshA.matrixWorld)
  brushA.geometry.computeBoundsTree()

  // Evaluator はループの外で一度だけ生成しておく
  const evaluator = new Evaluator()

  for (const { mesh: meshB } of targets) {
    if (!meshB.geometry) continue

    // BrushB 準備
    const brushB = new Brush(meshB.geometry)
    brushB.applyMatrix4(meshB.matrixWorld)
    brushB.geometry.computeBoundsTree()

    // 交差判定（A に対する B の変換行列を計算）
    const geoToBVH = new Matrix4().copy(meshA.matrixWorld).invert().multiply(meshB.matrixWorld)

    const isHit = brushA.geometry.boundsTree!.intersectsGeometry(brushB.geometry, geoToBVH)
    if (!isHit) continue

    // 1) A − B
    const brushA_subB = evaluator.evaluate(brushA, brushB, SUBTRACTION)
    // 2) B − A （REVERSE_SUBTRACTION 定数でも可）
    const brushB_subA = evaluator.evaluate(brushA, brushB, REVERSE_SUBTRACTION)
    // 3) A ∩ B
    const brushA_andB = evaluator.evaluate(brushA, brushB, INTERSECTION)

    // --- 既存メッシュに差し替え ---
    // A を A−B に
    meshA.geometry.dispose()
    meshA.geometry = brushA_subB.geometry
    meshA.geometry.computeBoundsTree()

    // B を B−A に
    meshB.geometry.dispose()
    meshB.geometry = brushB_subA.geometry
    meshB.geometry.computeBoundsTree()

    // --- 交差部分は新しいメッシュとして追加 ---
    craft.addGeometry(brushA_andB.geometry, true)
  }
}
