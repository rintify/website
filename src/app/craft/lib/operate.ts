import { EdgesGeometry, Matrix4, Mesh, Plane, Points, Quaternion, Vector2, Vector3 } from 'three'
import { Brush, Evaluator, SUBTRACTION, INTERSECTION, REVERSE_SUBTRACTION } from 'three-bvh-csg'
import { Craft, WorkObject, WorkPosition } from './craft'
import { alignGrid, createPyramid } from './object'
import { look } from './camera'
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
  craft.render()
}

export function setBasis(craft: Craft | undefined): CraftAnimate | undefined {
  if (!craft) return
  if (craft.selectedPositions.length >= 1) {
    craft.basis.o.copy(craft.selectedPositions[0].position)
    return dt => {
      craft.grid.position.lerp(craft.basis.o, 5 * dt)
      if (craft.basis.o.distanceToSquared(craft.grid.position) < 0.001) {
        craft.grid.position.copy(craft.basis.o)
        return true
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
      ? craft.basis.o
      : craft.selectedPositions
          .reduce((s, o) => s.add(o.position), new Vector3())
          .multiplyScalar(1 / craft.selectedPositions.length)
  craft.center.copy(av)
  craft.up.copy(craft.basis.z)
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
    craft.workObjects.map(s => s.points),
    false
  )
  if (hits.length === 0) {
    var plane = new Plane()
    plane.setFromNormalAndCoplanarPoint(craft.basis.z, craft.basis.o)
    const intersectPoint = craft.raycaster.ray.intersectPlane(plane, new Vector3())
    if (intersectPoint) {
      craft.selectedPositions.push(new WorkPosition(craft, undefined, intersectPoint))
      craft.updateSelected()
      craft.render()
    }
    return
  }

  const hit = hits[0]
  const hitO = hit.object as Points
  const parent = hitO.parent as WorkObject

  const index = hit.index!
  const posAttr = hitO.geometry.getAttribute('position')
  const x = posAttr.getX(index)
  const y = posAttr.getY(index)
  const z = posAttr.getZ(index)
  const worldVertex = new Vector3(x, y, z)
  hitO.localToWorld(worldVertex);

  craft.selectedPositions.push(new WorkPosition(craft, parent, worldVertex))
  craft.updateSelected()
  craft.render()
}
