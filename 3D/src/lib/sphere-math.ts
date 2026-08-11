import * as THREE from "three";

/**
 * Converts spherical coordinates (in degrees) to a point on a sphere of the
 * given radius. lon=0 sits on the +Z axis, which is the "front" of the
 * sphere as seen by a camera placed on the +Z axis looking at the origin.
 */
export function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  radius: number
): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);

  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);

  return new THREE.Vector3(x, y, z);
}

export const FRONT_VECTOR = new THREE.Vector3(0, 0, 1);

/**
 * Quaternion that rotates `point` (a direction from the sphere's origin) so
 * it ends up facing the camera, i.e. aligned with FRONT_VECTOR.
 */
export function quaternionFacingFront(point: THREE.Vector3): THREE.Quaternion {
  const from = point.clone().normalize();
  return new THREE.Quaternion().setFromUnitVectors(from, FRONT_VECTOR);
}
