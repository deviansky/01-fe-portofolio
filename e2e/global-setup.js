import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
    const envPath = path.resolve(__dirname, '../.env.e2e');

    if (!fs.existsSync(envPath)) {
        throw new Error('File .env.e2e tidak ditemukan! Harap buat .env.e2e dari .env.e2e.example.');
    }

    dotenv.config({ path: envPath });

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
        throw new Error('Variabel E2E_USERNAME dan E2E_PASSWORD di .env.e2e wajib diisi!');
    }

    const authDir = path.resolve(__dirname, './.auth');
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    await page.fill('#admin-username', username);
    await page.fill('#admin-password', password);
    await page.click('button[type="submit"]');

    try {
        await page.waitForURL('**/admin/proyek', { timeout: 10000 });
    } catch (err) {
        const errorText = await page.locator('.admin-error-banner').innerText().catch(() => 'No error banner');
        console.error('globalSetup login failed. Error banner:', errorText);
        throw err;
    }

    await page.context().storageState({ path: path.resolve(authDir, 'admin.json') });
    await browser.close();
}
