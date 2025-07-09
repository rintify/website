import * as THREE from 'three'

export function look(camera: THREE.Quaternion, dir: THREE.Vector3) {
  const current = new THREE.Vector3(0, 0, -1).applyQuaternion(camera)
  const rotationAxis = new THREE.Vector3().crossVectors(current, dir)
  if (rotationAxis.lengthSq() < 0.000001) return
  rotationAxis.normalize()
  const angle = current.angleTo(dir)
  const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle)

  camera.premultiply(rotationQuaternion)
  camera.normalize()
}

export function moveCenter(position: THREE.Vector3,center: THREE.Vector3, r: number, dt: number){
  position.add(center.clone().sub(position).multiplyScalar(1 - Math.pow(r,-dt)))
}

export function moveOrbit(
  position: THREE.Vector3,
  cameraQuat: THREE.Quaternion,
  center: THREE.Vector3,
  up: THREE.Vector3,
  direction: THREE.Vector2,
  omega: number,
  dt: number
) {
  const MIN_LAT = -Math.PI / 2 + 0.01
  const MAX_LAT = Math.PI / 2 - 0.01

  const offset = new THREE.Vector3().copy(position).sub(center)

  const angleH = direction.x * omega*dt
  if (angleH !== 0) {
    const qH = new THREE.Quaternion().setFromAxisAngle(up, angleH)
    offset.applyQuaternion(qH)
    cameraQuat.premultiply(qH)
  }

  const angleV = direction.y * omega*dt
  if (angleV !== 0) {
    const offsetNorm = offset.clone().normalize()
    const currentLat = Math.asin(offsetNorm.dot(up))

    const targetLat = THREE.MathUtils.clamp(currentLat + angleV, MIN_LAT, MAX_LAT)
    const deltaLat = targetLat - currentLat

    if (deltaLat !== 0) {
      const axisV = new THREE.Vector3().crossVectors(offset, up).normalize()
      const qV = new THREE.Quaternion().setFromAxisAngle(axisV, deltaLat)
      offset.applyQuaternion(qV)
      cameraQuat.premultiply(qV)
    }
  }

  position.copy(center).add(offset)
}
