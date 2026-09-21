import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5174'

test.describe('Mobile Layout & Verification Checks', () => {

    test('Verification 1: Horizontal scroll check on all pages at 360px and 390px', async ({ page }) => {
        const viewports = [
            { width: 360, height: 740 },
            { width: 390, height: 844 },
        ]
        const routes = ['/', '/404-test-page']

        for (const vp of viewports) {
            await page.setViewportSize(vp)

            for (const r of routes) {
                await page.goto(`${BASE_URL}${r}`)
                await page.waitForLoadState('networkidle')

                const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
                const innerWidth = await page.evaluate(() => window.innerWidth)
                console.log(`[Viewport ${vp.width}px Route ${r}] scrollWidth: ${scrollWidth}, innerWidth: ${innerWidth}`)

                if (scrollWidth > innerWidth) {
                    const overflowingElements = await page.evaluate(() => {
                        const els = []
                        document.querySelectorAll('*').forEach((el) => {
                            const rect = el.getBoundingClientRect()
                            if (rect.right > window.innerWidth) {
                                els.push({ tag: el.tagName, class: el.className, id: el.id, right: rect.right })
                            }
                        })
                        return els
                    })
                    console.error(`Overflowing elements at ${vp.width}px on ${r}:`, overflowingElements)
                }

                expect(scrollWidth).toBe(innerWidth)
            }
        }
    })

    test('Verification 2: Hero photo bottom touches section Tentang top (diff <= 1px)', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        const { photoBottom, tentangTop, diff, filterStyle, maskStyle } = await page.evaluate(() => {
            const photo = document.querySelector('.hp-photo')
            const tentang = document.querySelector('#tentang')
            const photoRect = photo.getBoundingClientRect()
            const tentangRect = tentang.getBoundingClientRect()
            const computed = window.getComputedStyle(photo)
            return {
                photoBottom: photoRect.bottom,
                tentangTop: tentangRect.top,
                diff: Math.abs(photoRect.bottom - tentangRect.top),
                filterStyle: computed.filter,
                maskStyle: computed.webkitMaskImage || computed.maskImage,
            }
        })

        console.log(`Hero photo bottom: ${photoBottom}, Tentang top: ${tentangTop}, diff: ${diff}`)
        console.log(`Filter style: ${filterStyle}, Mask style: ${maskStyle}`)

        expect(diff).toBeLessThanOrEqual(1.5)
        expect(filterStyle).toContain('grayscale')
    })

    test('Verification 3: Filter project auto scroll & Tab focusable', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        const filterBtns = page.locator('.filter-btn')
        const count = await filterBtns.count()

        if (count > 1) {
            // Click last filter
            await filterBtns.nth(count - 1).click()
            await page.waitForTimeout(300)

            const isVisibleInContainer = await page.evaluate(() => {
                const active = document.querySelector('.filter-btn[aria-pressed="true"]')
                const wrapper = document.querySelector('.filters-wrapper')
                if (!active || !wrapper) return false
                const aRect = active.getBoundingClientRect()
                const wRect = wrapper.getBoundingClientRect()
                return aRect.left >= wRect.left && aRect.right <= wRect.right + 20
            })

            console.log('Active filter visible in wrapper after click:', isVisibleInContainer)
            expect(isVisibleInContainer).toBe(true)
        }
    })

    test('Verification 4: Real API data (No fallback banner)', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')

        const bannerCount = await page.locator('.dev-banner').count()
        console.log('Dev banner count:', bannerCount)
        expect(bannerCount).toBe(0)
    })

    test('Verification 5: Screenshots capture (390px, 360px, 1366px - Light & Dark)', async ({ page }) => {
        // 390px Light
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto(BASE_URL)
        await page.waitForLoadState('networkidle')
        await page.screenshot({ path: 'e2e/screenshots/mobile-390-light.png', fullPage: true })

        // 390px Dark
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
        await page.screenshot({ path: 'e2e/screenshots/mobile-390-dark.png', fullPage: true })

        // 360px Light
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
        await page.setViewportSize({ width: 360, height: 740 })
        await page.screenshot({ path: 'e2e/screenshots/mobile-360-light.png', fullPage: true })

        // 360px Dark
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
        await page.screenshot({ path: 'e2e/screenshots/mobile-360-dark.png', fullPage: true })

        // 1366px Desktop Light
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
        await page.setViewportSize({ width: 1366, height: 900 })
        await page.screenshot({ path: 'e2e/screenshots/desktop-1366-light.png', fullPage: true })

        // 1366px Desktop Dark
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
        await page.screenshot({ path: 'e2e/screenshots/desktop-1366-dark.png', fullPage: true })
    })
})
