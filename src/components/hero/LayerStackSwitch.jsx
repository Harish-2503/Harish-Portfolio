import { Component, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cancelIdle, hasWebGL, isLowEndDevice, whenIdle } from '../../lib/webgl'
import LayerStack from './LayerStack'

const SETTLE_MS = 1700 // let the SVG entrance finish before the 3D scene takes over
const FADE_MS = 500
const STACK_W = 440 // viewBox widths: the 3D canvas covers the stack, never the label column
const LABELED_W = 600

class Boundary extends Component {
  state = { bad: false }
  static getDerivedStateFromError() {
    return { bad: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.bad ? null : this.props.children
  }
}

// The SVG LayerStack is always rendered and is what the layout is built from, so nothing can shift.
// The 3D scene is loaded after the hero paints, drawn invisibly on top, and crossfaded in once it has
// rendered and the SVG entrance is over. Any failure removes it and the SVG simply remains.
export default function LayerStackSwitch({ animated, ready, labeled, px, py, delay, stagger, className }) {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const idleX = useMotionValue(0)
  const idleY = useMotionValue(0)
  const sx = px ?? idleX
  const sy = py ?? idleY

  const [Scene, setScene] = useState(null)
  const [failed, setFailed] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [settled, setSettled] = useState(false)
  const [swapped, setSwapped] = useState(false)

  // Load the 3D chunk only after the hero has started, in idle time, and only on capable devices.
  useEffect(() => {
    if (reduce || failed || !ready || Scene) return
    let live = true
    const h = whenIdle(() => {
      if (!hasWebGL() || isLowEndDevice()) return setFailed(true)
      import('./LayerStack3D')
        .then((m) => live && setScene(() => m.default))
        .catch(() => live && setFailed(true))
    })
    return () => {
      live = false
      cancelIdle(h)
    }
  }, [reduce, failed, ready, Scene])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setSettled(true), SETTLE_MS)
    return () => clearTimeout(t)
  }, [ready])

  const show3D = Boolean(Scene) && !reduce && !failed
  const revealed = show3D && sceneReady && settled

  useEffect(() => {
    if (!show3D) setSceneReady(false)
  }, [show3D])

  // Once the canvas is fully opaque, hide the SVG slabs (keeping its labels and accessible title).
  useEffect(() => {
    if (!revealed) return setSwapped(false)
    const t = setTimeout(() => setSwapped(true), FADE_MS + 50)
    return () => clearTimeout(t)
  }, [revealed])

  const rotateY = useTransform(sx, [-1, 1], [-5, 5])
  const rotateX = useTransform(sy, [-1, 1], [4, -4])

  return (
    <div className={`relative ${className ?? ''}`} data-stack3d={revealed ? 'on' : show3D ? 'loading' : failed || reduce ? 'svg' : 'idle'}>
      <motion.div style={revealed ? undefined : { rotateX, rotateY, transformPerspective: 1100 }} className={swapped ? '[&_polygon]:hidden' : undefined}>
        <LayerStack animated={animated} ready={ready} labeled={labeled} px={sx} delay={delay} stagger={stagger} className="h-auto w-full" />
      </motion.div>
      {show3D && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full"
          style={{ width: labeled ? `${(STACK_W / LABELED_W) * 100}%` : '100%', opacity: revealed ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
        >
          <Boundary onFail={() => setFailed(true)}>
            <Scene px={sx} py={sy} onReady={() => setSceneReady(true)} onFail={() => setFailed(true)} />
          </Boundary>
        </div>
      )}
    </div>
  )
}
