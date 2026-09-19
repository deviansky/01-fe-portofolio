import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Admin E2E Test Suite', () => {
    let createdProjectId = null;

    // Cleanup any test project starting with [E2E] after all tests complete
    test.afterAll(async ({ request }) => {
        try {
            const response = await request.get('http://localhost:8000/api/admin/projects');
            if (response.ok()) {
                const json = await response.json();
                const projects = json.data || json || [];
                for (const p of projects) {
                    if (p.title && p.title.startsWith('[E2E]')) {
                        await request.delete(`http://localhost:8000/api/admin/projects/${p.id}`);
                        console.log(`Cleaned up E2E project ID ${p.id}: ${p.title}`);
                    }
                }
            }
        } catch (e) {
            console.error('Error during test cleanup:', e);
        }
    });

    test.beforeEach(async ({ page }) => {
        // Monitor console errors
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('pageerror', (err) => {
            consoleErrors.push(err.message);
        });

        // Attach listener check at end of each test if needed
    });

    test('01. Login salah menampilkan pesan error', async ({ browser }) => {
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        const randomUser = `tes-salah-${Date.now()}`;
        await page.goto('http://localhost:5173/admin/login');
        await page.fill('#admin-username', randomUser);
        await page.fill('#admin-password', 'wrongpassword');
        await page.click('button[type="submit"]');

        const alertBanner = page.locator('.admin-error-banner');
        await expect(alertBanner).toBeVisible();
        await expect(alertBanner).toContainText(/Username atau password salah|Terlalu banyak percobaan/);
        await context.close();
    });

    test('02. Filter kategori di /admin/proyek', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/proyek');
        await page.waitForLoadState('networkidle');

        // Filter by Web category
        const categorySelect = page.locator('#filter-category');
        await categorySelect.selectOption('Web');

        await expect(page).toHaveURL(/category=web/i);

        // Reset filter
        const resetButton = page.locator('button:has-text("Reset filter"), a:has-text("Reset filter")');
        if (await resetButton.isVisible()) {
            await resetButton.click();
            await expect(page).not.toHaveURL(/category=web/);
        }
    });

    test('03 & 04 & 05 & 06. Proyek Baru: create, draft check, preview, publish, edit Ctrl+S', async ({ page, request }) => {
        const timestamp = Date.now();
        const testTitle = `[E2E] Proyek uji ${timestamp}`;

        await page.goto('http://localhost:5173/admin/proyek/baru');
        await page.waitForLoadState('networkidle');

        // Verification before saving
        await expect(page.locator('.editor-title')).toHaveText('Proyek baru');
        await expect(page.locator('.editor-status-badge')).toHaveText('Draft');

        const saveDraftBtn = page.locator('button:has-text("Simpan draft")');
        const publishBtn = page.locator('button:has-text("Publikasikan")');
        await expect(saveDraftBtn).toBeVisible();
        await expect(publishBtn).toBeVisible();
        await expect(page.locator('a:has-text("Buka di situs")')).not.toBeVisible();

        // Fill form
        await page.fill('#input-title', testTitle);
        await page.selectOption('#select-category', 'web');
        await page.fill('#input-role', 'Fullstack Developer');
        await page.fill('textarea', 'Ringkasan uji E2E untuk verifikasi otomatis.');

        // Upload cover image
        const coverPath = path.resolve(__dirname, './fixtures/cover.png');
        await page.setInputFiles('input[type="file"][accept*="image"]', coverPath);

        // TipTap editor content
        const tiptapEditor = page.locator('.tiptap-content .tiptap');
        await tiptapEditor.focus();
        await page.keyboard.type('Deskripsi proyek uji');

        // Add 2 stack technologies
        const stackInput = page.locator('.tag-field');
        await stackInput.fill('React');
        await stackInput.press('Enter');
        await stackInput.fill('Playwright');
        await stackInput.press('Enter');

        // Add 1 highlight item
        await page.click('button:has-text("Tambah poin")');
        await page.fill('input[placeholder="Poin 1"]', 'Pengembangan frontend E2E test suite');

        // Listen for save API response
        const [response] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/api/admin/projects')),
            saveDraftBtn.click(),
        ]);
        const resBody = await response.json().catch(() => ({}));
        console.log('Save Draft API status:', response.status(), resBody);

        await page.waitForURL(/\/admin\/proyek\/\d+$/);

        const match = page.url().match(/\/admin\/proyek\/(\d+)$/);
        expect(match).toBeTruthy();
        createdProjectId = match[1];

        // GET /api/portfolio should NOT include draft project slug
        const publicPortfolioRes = await request.get('http://localhost:8000/api/portfolio');
        const portfolioJson = await publicPortfolioRes.json();
        const projectsList = portfolioJson.projects || [];
        const foundDraft = projectsList.find((p) => p.title === testTitle);
        expect(foundDraft).toBeFalsy();

        // Preview tabs
        const previewIframe = page.frameLocator('iframe[title="Live Preview"]');
        await expect(previewIframe.locator('h1, .pj-title, .pj-modal-title')).toContainText(testTitle);

        // Publish project
        const [pubResponse] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/api/admin/projects/')),
            publishBtn.click(),
        ]);
        const pubBody = await pubResponse.json().catch(() => ({}));
        console.log('Publish API status:', pubResponse.status(), pubBody);

        const unpublishBtn = page.locator('button:has-text("Jadikan draft")');
        const saveChangesBtn = page.locator('button:has-text("Simpan perubahan")');
        const viewSiteLink = page.locator('a:has-text("Buka di situs")');
        await expect(unpublishBtn).toBeVisible();
        await expect(saveChangesBtn).toBeVisible();
        await expect(viewSiteLink).toBeVisible();

        // Edit title and Ctrl+S
        await page.fill('#input-title', '[E2E] Proyek uji diubah');
        const [ctrlSResponse] = await Promise.all([
            page.waitForResponse((res) => res.url().includes('/api/admin/projects/')),
            page.keyboard.press('Control+S'),
        ]);
        console.log('Ctrl+S API status:', ctrlSResponse.status());

        // Reload page and check title persisted
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#input-title')).toHaveValue('[E2E] Proyek uji diubah');
    });

    test('07. Penjaga perubahan (Navigation Guard)', async ({ page }) => {
        if (!createdProjectId) return;
        await page.goto(`http://localhost:5173/admin/proyek/${createdProjectId}`);
        await page.waitForLoadState('networkidle');

        // Make form dirty
        await page.fill('#input-role', 'Fullstack Engineer');

        // Setup dialog listener
        let dialogTriggered = false;
        page.once('dialog', async (dialog) => {
            dialogTriggered = true;
            await dialog.dismiss(); // Cancel leave
        });

        // Click "Proyek" link in sidebar
        await page.click('aside a[href*="/admin/proyek"]');
        await page.waitForTimeout(300);

        expect(dialogTriggered).toBe(true);
        // Should remain on editor page
        await expect(page).toHaveURL(new RegExp(`/admin/proyek/${createdProjectId}`));
    });

    test('08. Sanitasi XSS lewat API Admin', async ({ request }) => {
        if (!createdProjectId) return;

        const getRes = await request.get(`http://localhost:8000/api/admin/projects/${createdProjectId}`);
        const currentData = (await getRes.json()).data;

        const xssPayload = {
            title: currentData.title,
            slug: currentData.slug,
            summary: currentData.summary,
            description: '<p>ok</p><script>alert(1)</script><a href="#" onclick="x" style="color:red">b</a>',
            category: currentData.category,
            role: currentData.role,
            year: currentData.year,
            stack: currentData.stack,
            highlights: currentData.highlights,
            status: currentData.status,
            is_featured: currentData.is_featured,
            is_confidential: currentData.is_confidential,
        };

        const putRes = await request.put(`http://localhost:8000/api/admin/projects/${createdProjectId}`, {
            data: xssPayload,
        });
        console.log('Test 08 PUT status:', putRes.status());

        // GET project back
        const res = await request.get(`http://localhost:8000/api/admin/projects/${createdProjectId}`);
        const data = await res.json();
        const projectObj = data.data || data;
        const sanitizedHtml = projectObj.description || '';

        expect(sanitizedHtml).not.toContain('<script>');
        expect(sanitizedHtml).not.toContain('onclick');
        expect(sanitizedHtml).not.toContain('style=');
        expect(sanitizedHtml).toContain('<p>ok</p>');
    });

    test('09. "Jadikan draft" menghapus proyek dari /api/portfolio', async ({ page, request }) => {
        if (!createdProjectId) return;

        await page.goto(`http://localhost:5173/admin/proyek/${createdProjectId}`);
        await page.waitForLoadState('networkidle');

        const draftBtn = page.locator('button:has-text("Jadikan draft")');
        if (await draftBtn.isVisible()) {
            await draftBtn.click();
            await page.waitForTimeout(500);
        }

        const publicRes = await request.get('http://localhost:8000/api/portfolio');
        const publicJson = await publicRes.json();
        const projectsList = publicJson.projects || [];
        const found = projectsList.find((p) => p.id === Number(createdProjectId));
        expect(found).toBeFalsy();
    });

    test('10. Halaman 404 Editor pada ID tidak ada', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/proyek/999999');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h2')).toHaveText('Proyek tidak ditemukan.');
        await expect(page.locator('p.form-hint')).toHaveText('Proyek ini mungkin sudah dihapus atau alamatnya salah.');
        const backBtn = page.locator('a:has-text("Kembali ke daftar proyek")');
        await expect(backBtn).toBeVisible();
    });
});
