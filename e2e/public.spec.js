import { test, expect } from '@playwright/test';

test.describe('Public Website E2E Test Suite', () => {
    // Use empty storageState for public site tests (unauthenticated guest user)
    test.use({ storageState: { cookies: [], origins: [] } });

    test('01. Beranda: Banner data cadangan TIDAK ada & semua section utama tampil', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        await page.waitForLoadState('networkidle');

        // Verify backup data banner is NOT visible
        const backupBanner = page.locator('text=Mode data cadangan');
        await expect(backupBanner).not.toBeVisible();

        // Verify main sections exist
        await expect(page.locator('#top')).toBeVisible();
        await expect(page.locator('#tentang')).toBeVisible();
        await expect(page.locator('#keahlian')).toBeVisible();
        await expect(page.locator('#proyek')).toBeVisible();
        await expect(page.locator('#pengalaman')).toBeVisible();
        await expect(page.locator('#pendidikan')).toBeVisible();
        await expect(page.locator('#kontak')).toBeVisible();
    });

    test('02. Modal Proyek: Klik kartu proyek membuka modal & Esc menutupnya', async ({ page }) => {
        await page.goto('http://localhost:5173/');
        await page.waitForLoadState('networkidle');

        const projectCardTitle = page.locator('#proyek article h3 button').first();
        await expect(projectCardTitle).toBeVisible();

        const titleText = await projectCardTitle.innerText();
        await projectCardTitle.click();

        // Verify modal is open
        const modal = page.locator('dialog.pj-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('#pj-modal-title, h2')).toHaveText(titleText);

        // Press Escape to close modal
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
    });

    test('03. Halaman Detail Proyek: Load /proyek/:slug & cek gambar sampul', async ({ page, request }) => {
        // Fetch a valid project slug from public API
        const res = await request.get('http://localhost:8000/api/portfolio');
        const json = await res.json();
        const projects = json.data?.projects || json.projects || [];
        expect(projects.length).toBeGreaterThan(0);

        const sampleSlug = projects[0].slug;
        await page.goto(`http://localhost:5173/proyek/${sampleSlug}`);
        await page.waitForLoadState('networkidle');

        // Title & content visible
        await expect(page.locator('h1')).toBeVisible();

        // Check cover image load
        const coverImg = page.locator('.detail-cover');
        if (await coverImg.isVisible()) {
            const naturalWidth = await coverImg.evaluate((img) => img.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);
        }
    });

    test('04. Navigasi Navbar dari Halaman Detail ke Section #proyek', async ({ page, request }) => {
        const res = await request.get('http://localhost:8000/api/portfolio');
        const json = await res.json();
        const projects = json.data?.projects || json.projects || [];
        const sampleSlug = projects[0].slug;

        await page.goto(`http://localhost:5173/proyek/${sampleSlug}`);
        await page.waitForLoadState('networkidle');

        // Open mobile menu if collapsed
        const menuBtn = page.locator('.nav-menu-btn');
        if (await menuBtn.isVisible()) {
            await menuBtn.click();
        }

        // Click "Proyek" link in navbar
        const navProjectLink = page.locator('header nav a:has-text("Proyek")');
        await navProjectLink.click();

        await page.waitForURL('http://localhost:5173/#proyek');
        await expect(page.locator('#proyek')).toBeVisible();
    });

    test('05. Halaman 404 Publik pada URL tidak valid', async ({ page }) => {
        await page.goto('http://localhost:5173/halaman-ngawur-123');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1')).toHaveText('Halaman tidak ditemukan');
        const homeBtn = page.locator('a:has-text("Kembali ke beranda")');
        await expect(homeBtn).toBeVisible();
    });
});
