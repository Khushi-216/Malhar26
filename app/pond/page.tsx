"use client";

import { useEffect, useRef, useState } from 'react'
const lake = '/assets/pondBG.mp4'
const lilypad = '/assets/lilypad.png'
const jumpVideo = '/assets/Jump.mp4'
const puddlesFrontImg = '/assets/puddlesFront.png'
const turn1Img = '/assets/turn1.png'
const turn2Img = '/assets/turn2.png'
const standingImg = '/assets/Standing.png'
const crouchImg = '/assets/Crouch.png'
const jump1Img = '/assets/Jump1.png'
const apexImg = '/assets/Apex.png'
const jump2Img = '/assets/Jump2.png'
const landingImg = '/assets/Landing.png'

const Preloader = () => {
  useEffect(() => {
    const assets = [
      { type: 'video', src: lake },
      { type: 'video', src: jumpVideo },
      { type: 'image', src: lilypad },
      { type: 'image', src: puddlesFrontImg },
      { type: 'image', src: turn1Img },
      { type: 'image', src: turn2Img },
      { type: 'image', src: standingImg },
      { type: 'image', src: crouchImg },
      { type: 'image', src: jump1Img },
      { type: 'image', src: apexImg },
      { type: 'image', src: jump2Img },
      { type: 'image', src: landingImg },
    ]
    let loaded = 0
    const checkDone = () => {
      loaded++
      if (loaded === assets.length) {
        window.parent.postMessage('POND_LOADED', '*')
      }
    }
    assets.forEach(asset => {
      if (asset.type === 'video') {
        const v = document.createElement('video')
        v.onloadeddata = checkDone
        v.onerror = checkDone
        v.src = asset.src
      } else {
        const i = new Image()
        i.onload = checkDone
        i.onerror = checkDone
        i.src = asset.src
      }
    })
  }, [])
  return null
}

export default function PondApp() {
  const [isPreload, setIsPreload] = useState(false);
  const searchParamsRef = useRef<URLSearchParams | null>(null);

  useEffect(() => {
    searchParamsRef.current = new URLSearchParams(window.location.search);
    setIsPreload(searchParamsRef.current.get('preload') === 'true');
  }, []);

  const containerRef = useRef<HTMLDivElement>(null)
  const targetY = useRef(0)
  const currentY = useRef(0)
  const initialized = useRef(false)

  const lilypadRefs = useRef<(HTMLImageElement | null)[]>([])
  const positions = useRef<{ x: number, y: number, text: string }[]>([])

  const circleRef = useRef<HTMLDivElement>(null)
  const circleTextRef = useRef<HTMLSpanElement>(null)
  const image1Ref = useRef<HTMLImageElement>(null)
  const image2Ref = useRef<HTMLImageElement>(null)
  const imageRefsState = useRef<string[]>([puddlesFrontImg, puddlesFrontImg])
  const activeImageIndex = useRef<number>(1)
  const currentActiveSrc = useRef<string>(puddlesFrontImg)
  const introStartTime = useRef<number | null>(null)
  const introSequenceDone = useRef(false)

  const [playingYear, setPlayingYear] = useState<string | null>(null)
  const [blankYear, setBlankYear] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLilypadClick = (year: string) => {
    setPlayingYear(year)
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video play error:", e))
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen().catch(e => console.error("Fullscreen error:", e))
      }
    }
  }

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
    if (isPreload) return;

    const container = containerRef.current
    if (!container) return

    let animationId: number

    const updatePosition = () => {
      if (!containerRef.current) return // Stop loop if unmounted
      const winH = window.innerHeight
      const cH = container.offsetHeight

      // Initialize at the bottom once the image has loaded enough to be taller than the window
      if (!initialized.current && cH > winH) {
        const searchParams = new URLSearchParams(window.location.search);
        const startParam = searchParams.get('start');

        let initialY = winH - cH; // Default to bottom
        if (startParam === 'puddle') {
          initialY = winH - cH; // Puddle coordinates (bottom)
        }
        // TODO: Add logic here for other start positions (e.g. ?start=2025)

        targetY.current = initialY
        currentY.current = targetY.current
        initialized.current = true
        // Always start intro sequence from puddlefront frame
        introStartTime.current = performance.now()
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
          let motionFraction = 0
          if (fraction <= 0.20) {
            motionFraction = 0
          } else if (fraction >= 0.92) {
            motionFraction = 1
          } else {
            motionFraction = (fraction - 0.20) / (0.92 - 0.20)
          }

          // linear interpolation between points
          let x = p1.x + (p2.x - p1.x) * motionFraction
          let y = p1.y + (p2.y - p1.y) * motionFraction

          // curve: inverted parabola for jumping
          // A parabola is 4 * motionFraction * (1 - motionFraction)
          const jumpHeight = 150 // pixels
          const jumpCurve = 4 * motionFraction * (1 - motionFraction)

          y -= jumpCurve * jumpHeight // Jump 'up' visually
          x += jumpCurve * (jumpHeight * 0.2) // Slight rightward curve

          const scale = 1 + jumpCurve * 0.1 // Grow by up to 10% at the peak of the jump

          circleRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -75%) scale(${scale})`

          const isMovingRight = p2.x > p1.x;

          // Define text styles for each animation frame so you can easily tweak them!
          // You can set different 'left' values depending on whether it's moving Right or Left
          const textStyles = {
            standing: { top: '57%', left: { movingRight: '50%', movingLeft: '50%' }, fontSize: '28px' },
            crouch: { top: '53%', left: { movingRight: '48%', movingLeft: '52%' }, fontSize: '27px' },
            jump1: { top: '57%', left: { movingRight: '45%', movingLeft: '56%' }, fontSize: '27px' },
            apex: { top: '55%', left: { movingRight: '50%', movingLeft: '51.5%' }, fontSize: '27px' },
            jump2: { top: '52%', left: { movingRight: '51%', movingLeft: '50%' }, fontSize: '27px' },
            landing: { top: '57%', left: { movingRight: '45%', movingLeft: '56%' }, fontSize: '27px' }
          }

          let currentImage = standingImg
          let currentTextStyle = textStyles.standing

          if (!introSequenceDone.current && introStartTime.current !== null) {
            const elapsed = (performance.now() - introStartTime.current) / 1000

            if (elapsed < 1) {
              currentImage = puddlesFrontImg
            } else if (elapsed < 1 + 0.08) {
              currentImage = turn1Img
            } else if (elapsed < 1 + 0.08 + 0.08) {
              currentImage = turn2Img
            } else {
              currentImage = standingImg
              introSequenceDone.current = true
            }
          } else {
            if (motionFraction < 0.000001) { currentImage = standingImg; currentTextStyle = textStyles.standing; }
            else if (motionFraction < 0.15) { currentImage = crouchImg; currentTextStyle = textStyles.crouch; }
            else if (motionFraction < 0.38) { currentImage = jump1Img; currentTextStyle = textStyles.jump1; }
            else if (motionFraction < 0.6) { currentImage = apexImg; currentTextStyle = textStyles.apex; }
            else if (motionFraction < 0.75) { currentImage = jump2Img; currentTextStyle = textStyles.jump2; }
            else if (motionFraction < 0.98) { currentImage = landingImg; currentTextStyle = textStyles.landing; }
            else { currentImage = standingImg; currentTextStyle = textStyles.standing; }
          }

          if (circleTextRef.current) {
            circleTextRef.current.style.top = currentTextStyle.top
            circleTextRef.current.style.left = isMovingRight ? currentTextStyle.left.movingRight : currentTextStyle.left.movingLeft
            circleTextRef.current.style.fontSize = currentTextStyle.fontSize
          }

          if (image1Ref.current && image2Ref.current) {
            if (currentActiveSrc.current !== currentImage) {
              const nextImgRef = activeImageIndex.current === 1 ? image2Ref.current : image1Ref.current
              const currentImgRef = activeImageIndex.current === 1 ? image1Ref.current : image2Ref.current

              nextImgRef.setAttribute('src', currentImage)
              nextImgRef.style.opacity = '1'

              currentImgRef.style.opacity = '0'

              imageRefsState.current[activeImageIndex.current === 1 ? 1 : 0] = currentImage

              activeImageIndex.current = activeImageIndex.current === 1 ? 2 : 1
              currentActiveSrc.current = currentImage
            }

            const flip = p2.x > p1.x ? -1 : 1;

            const isTurn1 = imageRefsState.current[0] === puddlesFrontImg || imageRefsState.current[0] === turn1Img || imageRefsState.current[0] === turn2Img;
            const scale1 = isTurn1 ? 0.62 : 1;
            const translateY1 = isTurn1 ? '15%' : '0%';

            const isTurn2 = imageRefsState.current[1] === puddlesFrontImg || imageRefsState.current[1] === turn1Img || imageRefsState.current[1] === turn2Img;
            const scale2 = isTurn2 ? 0.62 : 1;
            const translateY2 = isTurn2 ? '15%' : '0%';

            image1Ref.current.style.transform = `scaleX(${flip}) scale(${scale1}) translateY(${translateY1})`;
            image2Ref.current.style.transform = `scaleX(${flip}) scale(${scale2}) translateY(${translateY2})`;
          }

          // Update text based on which lilypad we are closer to
          if (currentImage === puddlesFrontImg || currentImage === turn1Img || currentImage === turn2Img) {
            circleTextRef.current.innerText = ''
          } else {
            let textToShow = fraction < 0.5 ? p1.text : p2.text
            if (textToShow === 'SCROLL' && (currentImage === crouchImg || currentImage === jump1Img || currentImage === apexImg)) {
              textToShow = 'YAY!!!'
            }
            circleTextRef.current.innerText = textToShow

            if (textToShow === 'SCROLL' || textToShow === 'YAY!!!') {
              circleTextRef.current.style.fontSize = '20px'
            }
          }
        }
      }

      animationId = requestAnimationFrame(updatePosition)
    }

    animationId = requestAnimationFrame(updatePosition)

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!introSequenceDone.current) return

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

      if (!introSequenceDone.current) return

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
  }, [isPreload])

  if (isPreload) {
    return <Preloader />
  }

  return (
    <div className="w-full h-[167vw] overflow-hidden bg-[#1e1e1e] fixed inset-0 touch-none">
      <div
        ref={containerRef}
        className="relative w-full will-change-transform"
      >
        {/* Background video defining the container's height */}
        <video
          src={lake}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
          onLoadedData={updatePositions}
        />

        {/* Overlay container for the 5 lilypad sections */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col pt-[12.5%] pb-[5%]">
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[4] = el }}
              src={lilypad} alt="2022"
              className="max-h-full max-w-full ml-[23%] scale-65 rotate-[30deg] cursor-pointer"
              onLoad={updatePositions}
              onClick={() => handleLilypadClick("2022")}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[3] = el }}
              src={lilypad} alt="2023"
              className="max-h-full max-w-full ml-[65%] scale-72 rotate-[98deg] cursor-pointer"
              onLoad={updatePositions}
              onClick={() => handleLilypadClick("2023")}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[2] = el }}
              src={lilypad} alt="2024"
              className="max-h-full max-w-full ml-[25%] scale-66 rotate-[21deg] cursor-pointer"
              onLoad={updatePositions}
              onClick={() => handleLilypadClick("2024")}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[1] = el }}
              src={lilypad} alt="2025"
              className="max-h-full max-w-full ml-[47%] scale-65 rotate-[65deg] cursor-pointer"
              onLoad={updatePositions}
              onClick={() => handleLilypadClick("2025")}
            />
          </div>
          <div className="w-full h-1/5 flex items-center">
            <img
              ref={el => { lilypadRefs.current[0] = el }}
              src={lilypad} alt="SCROLL"
              className="max-h-full max-w-full ml-[2%] translate-y-30 scale-60 rotate-[93deg] cursor-pointer opacity-0"
              onLoad={updatePositions}
            />
          </div>
        </div>

        {/* Jumping Character */}
        <div
          ref={circleRef}
          className="absolute top-0 left-0 w-96 h-96 flex items-center justify-center font-bold text-white z-10 will-change-transform pointer-events-none"
          style={{ transform: 'translate(-1000px, -1000px)' }} // Hidden until initialized
        >
          <img ref={image1Ref} src={puddlesFrontImg} alt="character" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-100 ease-in-out" style={{ opacity: 1 }} />
          <img ref={image2Ref} src={puddlesFrontImg} alt="character" className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-100 ease-in-out" style={{ opacity: 0 }} />
          <span ref={circleTextRef} className="absolute -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-md tracking-wider transition-all duration-100 ease-in-out"></span>
        </div>

        {/* Fullscreen Video Overlay */}
        <div
          className={`fixed inset-0 z-50 bg-black flex items-center justify-center ${playingYear ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <video
            ref={videoRef}
            src={jumpVideo}
            playsInline
            className="w-full h-full object-contain"
            onEnded={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(e => console.error("Exit fullscreen error:", e))
              }
              window.location.href = `/vault-experience?year=${playingYear}`
            }}
          />
        </div>
      </div>
    </div>
  )
}
