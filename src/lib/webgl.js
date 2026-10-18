// Cheap capability checks used to decide whether the 3D LayerStack may load at all.
// Nothing here imports three, so it is safe in the main bundle.

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext() // release the probe context immediately
    return true
  } catch {
    return false
  }
}

// Devices that should keep the lightweight SVG: very low memory/cores, or Save-Data on.
export function isLowEndDevice() {
  const n = navigator
  return Boolean((n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || n.connection?.saveData)
}

export const whenIdle = (fn) =>
  'requestIdleCallback' in window ? { idle: requestIdleCallback(fn, { timeout: 1500 }) } : { timer: setTimeout(fn, 200) }

export const cancelIdle = (h) => {
  if (h.idle !== undefined) cancelIdleCallback(h.idle)
  else clearTimeout(h.timer)
}
