import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * PreviewFrame: Iframe sandbox untuk live preview proyek.
 * Memuat iframe dengan lebar 1100px atau 390px yang di-scale dengan CSS transform,
 * menyalin stylesheet dan theme dari dokumen utama, serta menonaktifkan navigasi link.
 */
export default function PreviewFrame({ width = 1100, children }) {
    const containerRef = useRef(null)
    const iframeRef = useRef(null)
    const [mounted, setMounted] = useState(false)
    const [scale, setScale] = useState(1)
    const [contentHeight, setContentHeight] = useState(600)

    // Handle mounting iframe content Document
    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        const handleLoad = () => {
            setMounted(true)
        }

        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            setMounted(true)
        } else {
            iframe.addEventListener('load', handleLoad)
        }

        return () => {
            iframe.removeEventListener('load', handleLoad)
        }
    }, [])

    // Sync styles, theme, and event listeners into iframe
    useEffect(() => {
        if (!mounted || !iframeRef.current) return
        const iframe = iframeRef.current
        const doc = iframe.contentDocument
        if (!doc) return

        // Sync theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
        doc.documentElement.setAttribute('data-theme', currentTheme)

        // Sync stylesheets & inline styles
        const syncStyles = () => {
            doc.head.innerHTML = ''
            const styleElements = document.querySelectorAll('link[rel="stylesheet"], style')
            styleElements.forEach((el) => {
                doc.head.appendChild(el.cloneNode(true))
            })
        }

        syncStyles()

        // Observe parent head changes (Vite HMR & dynamic CSS)
        const headObserver = new MutationObserver(() => {
            syncStyles()
        })
        headObserver.observe(document.head, { childList: true, subtree: true })

        // Observe theme attribute changes on documentElement
        const themeObserver = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-theme') || 'light'
            doc.documentElement.setAttribute('data-theme', theme)
        })
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

        // Prevent link navigation inside iframe
        const handleClick = (e) => {
            const anchor = e.target.closest('a')
            if (anchor) {
                e.preventDefault()
                e.stopPropagation()
            }
        }

        doc.body.addEventListener('click', handleClick, true)

        return () => {
            headObserver.disconnect()
            themeObserver.disconnect()
            if (doc.body) {
                doc.body.removeEventListener('click', handleClick, true)
            }
        }
    }, [mounted])

    // Measure content height and scale factor
    useEffect(() => {
        if (!mounted || !iframeRef.current) return
        const iframe = iframeRef.current
        const doc = iframe.contentDocument
        if (!doc || !doc.body) return

        // Height Observer
        const heightObserver = new ResizeObserver(() => {
            if (doc.body) {
                const newHeight = Math.max(300, doc.body.scrollHeight || doc.body.offsetHeight)
                setContentHeight(newHeight)
            }
        })
        heightObserver.observe(doc.body)

        // Container Scale Observer
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth
                if (containerWidth > 0 && width > 0) {
                    const newScale = Math.min(1, containerWidth / width)
                    setScale(newScale)
                }
            }
        }

        const containerObserver = new ResizeObserver(updateScale)
        if (containerRef.current) {
            containerObserver.observe(containerRef.current)
        }

        updateScale()

        return () => {
            heightObserver.disconnect()
            containerObserver.disconnect()
        }
    }, [mounted, width])

    const scaledHeight = Math.round(contentHeight * scale)

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                overflow: 'hidden',
                height: `${scaledHeight}px`,
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <iframe
                ref={iframeRef}
                title="Live Preview"
                style={{
                    width: `${width}px`,
                    height: `${contentHeight}px`,
                    border: 'none',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    background: 'var(--bg, #ffffff)',
                    borderRadius: 'var(--r-md, 8px)',
                }}
            />
            {mounted && iframeRef.current?.contentDocument?.body && (
                createPortal(children, iframeRef.current.contentDocument.body)
            )}
        </div>
    )
}
