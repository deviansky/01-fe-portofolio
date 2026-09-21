import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5176'
const SCREENSHOT_DIR = path.resolve('e2e/screenshots')

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function run() {
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    const results = {
        horizontalScroll: [],
        heroAlignment: null,
        activeFilterScroll: false,
        apiSource: null,
        screenshots: [],
    }

    console.log('--- STARTING VERIFICATION ---')

    // 1. Horizontal Scroll Check across ALL pages at 360px & 390px
    const viewports = [360, 390]
    const routes = ['/', '/proyek/sistem-erp-distribusi', '/404-nonexistent-page']

    for (const w of viewports) {
        await page.setViewportSize({ width: w, height: 750 })
        for (const r of routes) {
            await page.goto(`${BASE_URL}${r}`)
            await page.waitForTimeout(1000)

            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
            const innerWidth = await page.evaluate(() => window.innerWidth)
            const match = scrollWidth === innerWidth

            let overflowDetails = []
            if (!match) {
                overflowDetails = await page.evaluate(() => {
                    const els = []
                    document.querySelectorAll('*').forEach((el) => {
                        const rect = el.getBoundingClientRect()
                        if (rect.right > window.innerWidth) {
                            els.push({ tag: el.tagName, className: el.className, id: el.id, right: rect.right })
                        }
                    })
                    return els
                })
            }

            results.horizontalScroll.push({ viewport: w, route: r, scrollWidth, innerWidth, match, overflowDetails })
            console.log(`[Viewport ${w}px | Route ${r}] scrollWidth: ${scrollWidth}, innerWidth: ${innerWidth}, OK: ${match}`)
        }
    }

    // 2. Hero photo bottom alignment check
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE_URL)
    await page.waitForSelector('.hp-photo')
    await page.waitForFunction(() => {
        const img = document.querySelector('.hp-photo')
        return img && img.complete && img.naturalHeight !== 0
    })
    await page.waitForTimeout(500)

    const heroCheck = await page.evaluate(() => {
        const photo = document.querySelector('.hp-photo')
        const tentang = document.querySelector('#tentang')
        if (!photo || !tentang) return null
        const photoRect = photo.getBoundingClientRect()
        const tentangRect = tentang.getBoundingClientRect()
        const computed = window.getComputedStyle(photo)
        return {
            photoBottom: photoRect.bottom,
            tentangTop: tentangRect.top,
            diff: Math.abs(photoRect.bottom - tentangRect.top),
            filter: computed.filter,
            mask: computed.webkitMaskImage || computed.maskImage,
        }
    })
    results.heroAlignment = heroCheck
    console.log('Hero alignment check:', heroCheck)

    // 3. Active filter auto-scroll check
    const filterCheck = await page.evaluate(async () => {
        const filterBtns = document.querySelectorAll('.filter-btn')
        if (filterBtns.length <= 1) return true
        const lastBtn = filterBtns[filterBtns.length - 1]
        lastBtn.click()
        await new Promise((res) => setTimeout(res, 400))
        const wrapper = document.querySelector('.filters-wrapper')
        if (!wrapper) return false
        const aRect = lastBtn.getBoundingClientRect()
        const wRect = wrapper.getBoundingClientRect()
        return aRect.left >= wRect.left && aRect.right <= wRect.right + 30
    })
    results.activeFilterScroll = filterCheck
    console.log('Active filter auto-scroll check:', filterCheck)

    // 4. API connection check (no dev banner)
    const devBannerCount = await page.locator('.dev-banner').count()
    results.apiSource = devBannerCount === 0 ? 'REAL_API' : 'FALLBACK'
    console.log('API source check:', results.apiSource, '(Dev banner count:', devBannerCount, ')')

    // 5. Take Screenshots
    // 390px Light & Dark
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE_URL)
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-390-light.png'), fullPage: true })

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-390-dark.png'), fullPage: true })

    // 360px Light & Dark
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(BASE_URL)
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-360-light.png'), fullPage: true })

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-360-dark.png'), fullPage: true })

    // 1366px Desktop Light & Dark
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))
    await page.setViewportSize({ width: 1366, height: 900 })
    await page.goto(BASE_URL)
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-1366-light.png'), fullPage: true })

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-1366-dark.png'), fullPage: true })

    console.log('--- VERIFICATION COMPLETE ---')
    await browser.close()
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
