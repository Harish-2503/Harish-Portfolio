import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { BoxGeometry, EdgesGeometry } from 'three'
import { A, STEP, T, Y0 } from './LayerStack'
import { layerOrder } from '../../lib/layers'

// Same stack as the SVG, as real geometry. The SVG is a 2:1 isometric drawing, which is an
// orthographic camera at 45 degrees azimuth and 30 degrees elevation. Slab dimensions are
// derived from the SVG constants so the silhouette lands on the SVG one (1 world unit = 1 SVG px).
const RAD = Math.PI / 180
const COS30 = Math.cos(30 * RAD)
const SIDE = A * Math.SQRT2 // square slab whose diagonal is the SVG's 2A
const THICK = T / COS30 // vertical edges are foreshortened by cos(30)
const PITCH = STEP / COS30
const GROUP_Y = (250 - Y0) / COS30 // puts the SVG's view centre at the world origin
const GROUND_Y = -((3 * STEP + T + 22) / COS30) // SVG ground diamond sits 22px under the last slab
const VIEW_W = 440 // SVG viewBox width the camera frames
const PARALLAX = [8, 4, 0, -4] // same per-slab shift as the SVG, in px at full pointer deflection
const RIGHT = [Math.SQRT1_2, -Math.SQRT1_2] // screen-right in world x,z for a 45deg azimuth
const TILT = { az: 5 * RAD, el: 4 * RAD } // same limits as the hero's CSS tilt (+-5deg / +-4deg)

// Light direction solved so faces land near the SVG shades (top 1.0, left 0.82, right 0.66 in sRGB)
const LIGHT = [0.239, 0.839, 0.489]
const AMBIENT = Math.PI * 0.161
const KEY = Math.PI

const FALLBACK = { design: '#FF6B4A', interface: '#2742E6', logic: '#8FB4FF', data: '#18206B', cream: '#FBF8F2', ink: '#14161F' }
function readColors() {
  const css = getComputedStyle(document.documentElement)
  const get = (k) => css.getPropertyValue(`--color-${k}`).trim() || FALLBACK[k.replace('layer-', '')]
  return {
    layers: Object.fromEntries(layerOrder.map((id) => [id, get(`layer-${id}`)])),
    cream: get('cream'),
    ink: get('ink'),
  }
}

function Driver({ px, py, onReady }) {
  const { camera, size, invalidate } = useThree()
  const frames = useRef(0)

  // Frames are on demand: redraw only when the pointer springs move or the canvas resizes.
  useEffect(() => {
    const off = [px.on('change', invalidate), py.on('change', invalidate)]
    return () => off.forEach((f) => f())
  }, [px, py, invalidate])

  useFrame(() => {
    const az = 45 * RAD + px.get() * TILT.az
    const el = 30 * RAD + py.get() * TILT.el
    const r = 2000
    camera.position.set(r * Math.cos(el) * Math.sin(az), r * Math.sin(el), r * Math.cos(el) * Math.cos(az))
    camera.zoom = size.width / VIEW_W
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    // frameloop is on demand, so ask for one more frame; the second one proves the first was presented.
    if (frames.current < 2) {
      frames.current += 1
      if (frames.current === 1) invalidate()
      else onReady?.()
    }
  })
  return null
}

function Stack({ px, colors }) {
  const refs = useRef([])
  const { box, edges } = useMemo(() => {
    const box = new BoxGeometry(SIDE, THICK, SIDE)
    return { box, edges: new EdgesGeometry(box) }
  }, [])
  useEffect(() => () => { box.dispose(); edges.dispose() }, [box, edges])

  useFrame(() => {
    const p = px.get()
    refs.current.forEach((g, i) => {
      if (!g) return
      const s = p * PARALLAX[i]
      g.position.set(RIGHT[0] * s, -i * PITCH - THICK / 2, RIGHT[1] * s)
    })
  })

  return (
    <group position={[0, GROUP_Y, 0]}>
      {/* ground: the SVG's faint diamond, plus a real shadow catcher */}
      <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y + 0.5, 0]} renderOrder={-1}>
        <planeGeometry args={[SIDE, SIDE]} />
        <meshBasicMaterial color={colors.ink} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>
      {layerOrder.map((id, i) => (
        <group key={id} ref={(el) => (refs.current[i] = el)} name={id}>
          <mesh geometry={box} castShadow receiveShadow>
            <meshLambertMaterial color={colors.layers[id]} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={colors.cream} />
          </lineSegments>
        </group>
      ))}
    </group>
  )
}

// px / py: -1..1 spring motion values from usePointerTilt (mouse only; touch never tilts).
export default function LayerStack3D({ px, py, onReady, onFail }) {
  const colors = useMemo(readColors, [])
  const L = LIGHT.map((v) => v * 700)
  return (
    <Canvas
      orthographic
      flat
      shadows="percentage"
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ near: 1, far: 4000, zoom: 1, position: [1400, 1000, 1400] }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onFail?.()
        })
      }}
    >
      <ambientLight intensity={AMBIENT} />
      <directionalLight
        position={L}
        intensity={KEY}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-340}
        shadow-camera-right={340}
        shadow-camera-top={340}
        shadow-camera-bottom={-340}
        shadow-camera-near={1}
        shadow-camera-far={1600}
        shadow-bias={-0.0004}
        shadow-normalBias={1}
        shadow-radius={3}
        shadow-intensity={0.25}
      />
      <Stack px={px} colors={colors} />
      <Driver px={px} py={py} onReady={onReady} />
    </Canvas>
  )
}
