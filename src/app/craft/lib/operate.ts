import { EdgesGeometry, Matrix4, Mesh, Plane, Points, Quaternion, Vector2, Vector3 } from 'three'
import { Brush, Evaluator, SUBTRACTION, INTERSECTION, REVERSE_SUBTRACTION } from 'three-bvh-csg'
import { Craft, WorkObject, WorkPosition } from './craft'
import { alignGrid, createPyramid } from './object'
import { look } from './camera'
import { createBasis } from './world'
import { unescape } from 'querystring'

export type CraftAnimate = (deltaTime: number) => boolean | void

export function putObject(craft?: Craft) {
  if (!craft) return
  craft.camera.position
  const geometry = createPyramid(4, 5, 5)
  const w = new WorkObject(craft, geometry)
  w.position.copy(new Vector3(0, 0, -10).applyQuaternion(craft.camera.quaternion).add(craft.camera.position))
  craft.render()
}

export function deleteObject(craft?: Craft) {
  if (!craft) return
  craft.disposeWorkObject(...craft.selectedPositions.map(a => a.o).filter(a => !!a))
  deselect(craft)
  craft.render()
}

export function setBasis(craft: Craft | undefined): CraftAnimate | undefined {
  if (!craft) return
  if (craft.selectedPositions.length >= 1) {
    const points = craft.selectedPositions.map(p => p.position)
    const newBasis = createBasis(points, craft.basis)
    if (newBasis) {
      craft.basis = newBasis
      return dt => {
        craft.grid.position.lerp(craft.basis.o, 5 * dt)
        const quaternion = new Quaternion().setFromRotationMatrix(
          new Matrix4().makeBasis(craft.basis.x, craft.basis.y, craft.basis.z)
        )
        craft.grid.quaternion.slerp(quaternion, 5 * dt)
        if (craft.basis.o.distanceToSquared(craft.grid.position) < 0.001 && Math.abs(craft.grid.quaternion.dot(quaternion)) > 0.999999) {
          craft.grid.position.copy(craft.basis.o)
          craft.grid.quaternion.copy(quaternion)
          deselect(craft)
          return true
        }
      }
    }
  }
}

export function rotateBasis(craft: Craft | undefined): CraftAnimate | undefined {
  if (!craft) return
  ;[craft.basis.x, craft.basis.y, craft.basis.z] = [craft.basis.z, craft.basis.x, craft.basis.y]
  return dt => {
    const quaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().makeBasis(craft.basis.x, craft.basis.y, craft.basis.z)
    )
    craft.grid.quaternion.slerp(quaternion, 5 * dt)
    if (Math.abs(craft.grid.quaternion.dot(quaternion)) > 0.999999) {
      craft.grid.quaternion.copy(quaternion)
      return true
    }
  }
}

export function deselect(craft: Craft | undefined) {
  if (!craft) return
  craft.selectedPositions.forEach(p => p.dispose(craft))
  craft.selectedPositions = []
  craft.updateSelected()
  craft.render()
}

export function lookSelected(craft: Craft | undefined): CraftAnimate | undefined {
  if (!craft) return
  const av =
    craft.selectedPositions.length === 0
      ? craft.workObjects.length === 0
        ? craft.basis.o
        : craft.workObjects
            .reduce((s, o) => s.add(o.position), new Vector3())
            .multiplyScalar(1 / craft.workObjects.length)
      : craft.selectedPositions
          .reduce((s, o) => s.add(o.position), new Vector3())
          .multiplyScalar(1 / craft.selectedPositions.length)
  craft.center.copy(av)
  craft.up.copy(craft.basis.z)
  deselect(craft)
  return dt => {
    const quaternion = new Quaternion().setFromRotationMatrix(
      new Matrix4().lookAt(craft.camera.position, craft.center, craft.up)
    )
    craft.camera.quaternion.slerp(quaternion, 5 * dt)
    if (Math.abs(craft.camera.quaternion.dot(quaternion)) > 0.999999) {
      craft.camera.quaternion.copy(quaternion)
      return true
    }
  }
}

export function selectByPointer(craft: Craft | undefined, pointer: Vector2): CraftAnimate | undefined {
  if (!craft) return
  craft.raycaster.setFromCamera(pointer, craft.camera)
  craft.raycaster.params.Points.threshold = 0.1

  const hits = craft.raycaster.intersectObjects(
    craft.workObjects.flatMap(s => [s.points, s.mesh]),
    false
  )
  if (hits.length > 0) {
    const hit = hits[0]
    if (hit.object instanceof Points) {
      const hitO = hit.object as Points
      const parent = hitO.parent as WorkObject

      const index = hit.index!
      const posAttr = hitO.geometry.getAttribute('position')
      const x = posAttr.getX(index)
      const y = posAttr.getY(index)
      const z = posAttr.getZ(index)
      const worldVertex = new Vector3(x, y, z)
      hitO.localToWorld(worldVertex)

      const newPos = new WorkPosition(craft, parent, worldVertex)
      const existingIndex = craft.selectedPositions.findIndex(p => p.position.equals(newPos.position) && p.parent === newPos.parent)
      if (existingIndex !== -1) {

        const [removed] = craft.selectedPositions.splice(existingIndex, 1)
        removed.dispose(craft)
      } else {

        craft.selectedPositions.push(newPos)
      }
      craft.updateSelected()
      craft.render()
      return
    } else if (hit.object instanceof Mesh) {
      const parent = hit.object.parent as WorkObject
      const face = hit.face!
      const indices = [face.a, face.b, face.c]
      const posAttr = hit.object.geometry.getAttribute('position')
      const facePositions: WorkPosition[] = []
      for (const index of indices) {
        const x = posAttr.getX(index)
        const y = posAttr.getY(index)
        const z = posAttr.getZ(index)
        const worldVertex = new Vector3(x, y, z)
        hit.object.localToWorld(worldVertex)
        facePositions.push(new WorkPosition(craft, parent, worldVertex))
      }
      const allSelected = facePositions.every(fp => craft.selectedPositions.some(sp => sp.position.equals(fp.position) && sp.parent === fp.parent))
      if (allSelected) {

        for (const fp of facePositions) {
          const index = craft.selectedPositions.findIndex(sp => sp.position.equals(fp.position) && sp.parent === fp.parent)
          if (index !== -1) {
            const [removed] = craft.selectedPositions.splice(index, 1)
            removed.dispose(craft)
          }
        }
      } else {

        for (const fp of facePositions) {
          craft.selectedPositions.push(fp)
        }
      }
      craft.updateSelected()
      craft.render()
      return
    }
  }
}
