import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// easing utama, mirip expo.out: cepat di awal lalu mengendap pelan
export const EASE = 'expo.out'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// pointer halus = mouse/trackpad. Kursor custom & efek magnet hanya untuk ini.
export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export { gsap, ScrollTrigger }
