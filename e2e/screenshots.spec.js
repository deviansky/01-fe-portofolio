import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, './screenshots');

if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Automated Screenshots Suite', () => {
    let createdProjectId = null;
    let createdProjectSlug = null;

    test.afterAll(async ({ request }) => {
        try {
            const response = await request.get('http://localhost:8000/api/admin/projects');
            if (response.ok()) {
                const json = await response.json();
                const projects = json.data || json || [];
                for (const p of projects) {
                    if (p.title && p.title.startsWith('[E2E]')) {
                        await request.delete(`http://localhost:8000/api/admin/projects/${p.id}`);
                        console.log(`Cleaned up screenshot E2E project ID ${p.id}`);
                    }
                }
            }
        } catch (e) {
            console.error('Cleanup error:', e);
        }
    });

    test('01. Capture: Login error', async ({ page }) => {
        const randomUser = `tes-salah-${Date.now()}`;
        await page.goto('http://localhost:5173/admin/login');
        await page.fill('#admin-username', randomUser);
        await page.fill('#admin-password', 'wrongpass');
        await page.click('button[type="submit"]');

        await expect(page.locator('.admin-error-banner')).toBeVisible();
        await page.screenshot({ path: path.join(screenshotsDir, '01-admin-login-salah.png'), fullPage: true });
    });

    test('02. Capture: Filter Web di daftar proyek', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/proyek');
        await page.waitForLoadState('networkidle');

        await page.selectOption('#filter-category', 'web');
        await page.waitForTimeout(300);

        await page.screenshot({ path: path.join(screenshotsDir, '02-admin-daftar-proyek-web.png'), fullPage: true });
    });

    test('03. Capture: Editor baru kosong', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/proyek/baru');
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: path.join(screenshotsDir, '03-admin-editor-baru-kosong.png'), fullPage: true });
    });

    test('04, 05, 06. Capture: Editor terisi, tersimpan, published', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/proyek/baru');
        await page.waitForLoadState('networkidle');

        // Fill form
        await page.fill('#input-title', '[E2E] Proyek Uji E2E');
        await page.selectOption('#select-category', 'web');
        await page.fill('textarea', 'Ringkasan uji E2E otomatis untuk pembuatan screenshot.');

        // Upload cover image
        const coverPath = path.resolve(__dirname, './fixtures/cover.png');
        await page.setInputFiles('input[type="file"][accept*="image"]', coverPath);

        // Fill TipTap editor
        const tiptapEditor = page.locator('.tiptap-content .tiptap');
        await tiptapEditor.focus();
        await page.keyboard.type('Konten proyek uji E2E.');

        // Add stack
        const stackInput = page.locator('.tag-field');
        await stackInput.fill('React');
        await stackInput.press('Enter');
        await stackInput.fill('Laravel');
        await stackInput.press('Enter');

        // Add highlight
        await page.click('button:has-text("Tambah poin")');
        await page.fill('input[placeholder="Poin 1"]', 'Fitur unggulan 1');

        await page.screenshot({ path: path.join(screenshotsDir, '04-admin-editor-baru-terisi.png'), fullPage: true });

        // Click "Simpan draft"
        await page.click('button:has-text("Simpan draft")');
        await page.waitForURL(/\/admin\/proyek\/\d+$/);

        const match = page.url().match(/\/admin\/proyek\/(\d+)$/);
        createdProjectId = match[1];
        createdProjectSlug = 'proyek-uji-e2e';

        await page.screenshot({ path: path.join(screenshotsDir, '05-admin-editor-tersimpan.png'), fullPage: true });

        // Click "Publikasikan"
        await page.click('button:has-text("Publikasikan")');
        await page.waitForTimeout(500);

        await page.screenshot({ path: path.join(screenshotsDir, '06-admin-editor-published.png'), fullPage: true });
    });

    test('07 & 08. Capture: Mobile Editor (Form & Preview)', async ({ page }) => {
        if (!createdProjectId) return;

        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`http://localhost:5173/admin/proyek/${createdProjectId}`);
        await page.waitForLoadState('networkidle');

        // Form tab (default)
        await page.screenshot({ path: path.join(screenshotsDir, '07-admin-editor-mobile-form.png'), fullPage: true });

        // Preview tab
        await page.click('button:has-text("Preview")');
        await page.waitForTimeout(300);

        await page.screenshot({ path: path.join(screenshotsDir, '08-admin-editor-mobile-preview.png'), fullPage: true });
    });

    test('09. Capture: Editor 404', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('http://localhost:5173/admin/proyek/999999');
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: path.join(screenshotsDir, '10-admin-editor-404.png'), fullPage: true });
    });

    test('10, 11, 12. Capture: Situs Publik (Kartu, Modal, Detail)', async ({ page }) => {
        // Unauthenticated guest context for public site screenshots
        await page.context().clearCookies();

        await page.setViewportSize({ width: 1366, height: 768 });
        await page.goto('http://localhost:5173/#proyek');
        await page.waitForLoadState('networkidle');

        // 11. Public homepage projects section
        await page.screenshot({ path: path.join(screenshotsDir, '11-publik-beranda-kartu-e2e.png'), fullPage: true });

        // 12. Public Modal
        const cardTitle = page.locator('#proyek .pj-open', { hasText: '[E2E] Proyek Uji E2E' }).first();
        if (await cardTitle.isVisible()) {
            await cardTitle.click();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(screenshotsDir, '12-publik-modal-proyek.png'), fullPage: true });
            await page.keyboard.press('Escape');
        }

        // 13. Detail Page
        if (createdProjectSlug) {
            await page.goto(`http://localhost:5173/proyek/${createdProjectSlug}`);
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: path.join(screenshotsDir, '13-publik-halaman-detail.png'), fullPage: true });
        }
    });
});
