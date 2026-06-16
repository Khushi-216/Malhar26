import { useEffect, useRef } from 'react'
import lake from './assets/lake.png'
import lilypad from './assets/lilypad.png'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const targetY = useRef(0)
  const currentY = useRef(0)
  const initialized = useRef(false)

  const lilypadRefs = useRef<(HTMLImageElement | null)[]>([])
  const positions = useRef<{ x: number, y: number, text: string }[]>([])

  const circleRef = useRef<HTMLDivElement>(null)
  const circleTextRef = useRef<HTMLSpanElement>(null)

  const updatePositions = () => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    positions.current = lilypadRefs.current.map(img => {
      if (!img) return { x: 0, y: 0, text: '' }
      const rect = img.getBoundingClientRect()
      return {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        text: img.alt
      }
    })
  }

  useEffect(() => {
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number

    const updatePosition = () => {
      const winH = window.innerHeight
      const cH = container.offsetHeight

      // Initialize at the bottom once the image has loaded enough to be taller than the window
      if (!initialized.current && cH > winH) {
        targetY.current = winH - cH
        currentY.current = targetY.current
        initialized.current = true
        updatePositions()
      }

      // Smooth interpolation (lerp)
      currentY.current += (targetY.current - currentY.current) * 0.08

      // Apply the translation to the container
      container.style.transform = `translateY(${currentY.current}px)`

      // Update circle position
      if (positions.current.length === 5 && circleRef.current && circleTextRef.current) {
        const minOffset = Math.min(winH - cH, 0)
        const maxOffset = 0

        let p = 0
        if (maxOffset - minOffset !== 0) {
          p = (currentY.current - minOffset) / (maxOffset - minOffset)
        }
        p = Math.max(0, Math.min(1, p))

        const segment = p * 4
        let index = Math.floor(segment)
        let fraction = segment % 1

        if (index >= 4) {
          index = 3
          fraction = 1
        }

        const p1 = positions.current[index]
        const p2 = positions.current[index + 1]

        if (p1 && p2) {
          // linear interpolation between points
          let x = p1.x + (p2.x - p1.x) * fraction
          let y = p1.y + (p2.y - p1.y) * fraction

          // curve: inverted parabola for jumping
          // A parabola is 4 * fraction * (1 - fraction)
          const jumpHeight = 150 // pixels
          const jumpCurve = 4 * fraction * (1 - fraction)

          y -= jumpCurve * jumpHeight // Jump 'up' visually
          x += jumpCurve * (jumpHeight * 0.2) // Slight rightward curve

          const scale = 1 + jumpCurve * 0.4 // Grow by up to 40% at the peak of the jump

          circleRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`

          // Update text based on which lilypad we are closer to
          circleTextRef.current.innerText = fraction < 0.5 ? p1.text : p2.text
        }
      }

      animationId = requestAnimationFrame(updatePosition)
    }

    animationId = requestAnimationFrame(updatePosition)

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const winH = window.innerHeight
      const cH = container.offsetHeight

      targetY.current += e.deltaY

      const minOffset = Math.min(winH - cH, 0)
      const maxOffset = 0

      if (targetY.current > maxOffset) targetY.current = maxOffset
      if (targetY.current < minOffset) targetY.current = minOffset
    }

    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      touchStartY = touchY

      const winH = window.innerHeight
      const cH = container.offsetHeight

      targetY.current += deltaY

      const minOffset = Math.min(winH - cH, 0)
      const maxOffset = 0

      if (targetY.current > maxOffset) targetY.current = maxOffset
      if (targetY.current < minOffset) targetY.current = minOffset
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden bg-[#1e1e1e] fixed inset-0 touch-none">
      <div
        ref={containerRef}
        className="relative w-full will-change-transform"
      >
        {/* Background image defining the container's height */}
        <img
          src={lake}
          alt="Lake background"
          className="w-full h-auto block"
          onLoad={updatePositions}
        />

        {/* Overlay container for the 5 lilypad sections */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col pt-[12.5%] pb-[5%]">
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[4] = el }}
              src={lilypad} alt="2025"
              className="max-h-full max-w-full ml-[34%] scale-80 rotate-[30deg]"
              onLoad={updatePositions}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[3] = el }}
              src={lilypad} alt="2024"
              className="max-h-full max-w-full ml-[62%] scale-80"
              onLoad={updatePositions}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[2] = el }}
              src={lilypad} alt="2023"
              className="max-h-full max-w-full ml-[25%] scale-80"
              onLoad={updatePositions}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[1] = el }}
              src={lilypad} alt="2022"
              className="max-h-full max-w-full ml-[57%] scale-80"
              onLoad={updatePositions}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[0] = el }}
              src={lilypad} alt="2021"
              className="max-h-full max-w-full ml-[33%] scale-80"
              onLoad={updatePositions}
            />
          </div>
        </div>

        {/* Jumping Yellow Circle */}
        <div
          ref={circleRef}
          className="absolute top-0 left-0 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 text-xl shadow-2xl z-10 will-change-transform pointer-events-none"
          style={{ transform: 'translate(-1000px, -1000px)' }} // Hidden until initialized
        >
          <span ref={circleTextRef}></span>
        </div>
      </div>
    </div>
  )
}

export default App
