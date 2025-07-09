import * as THREE from 'three'

export function look(camera: THREE.Quaternion,dir: THREE.Vector3) {
  const current = new THREE.Vector3(0, 0, -1).applyQuaternion(camera);
  const rotationAxis = new THREE.Vector3().crossVectors(current, dir);
  if (rotationAxis.lengthSq() < 0.000001) return;
  rotationAxis.normalize();
  const angle = current.angleTo(dir);
  const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
  
  camera.premultiply(rotationQuaternion);
  camera.normalize();
}