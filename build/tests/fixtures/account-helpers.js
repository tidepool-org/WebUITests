"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const base_1 = require("@fixtures/base");
const AccountNavigation_1 = __importDefault(require("@pom/account/AccountNavigation"));
/**
 * Switch user authentication context by loading different storageState
 * @param userType - The user type corresponding to the storageState file (e.g., 'shared', 'clinician', 'claimed')
 * @param page - The Playwright page instance
 */
async function switchUser(userType, page) {
    try {
        // Import fs dynamically
        const fs = await Promise.resolve().then(() => __importStar(require('node:fs')));
        // Load the specified user's storage state
        const storageStatePath = `tests/.auth/${userType}.json`;
        const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
        // Clear existing cookies first
        await page.context().clearCookies();
        // Set cookies from the new user's storage state
        if (storageState.cookies) {
            await page.context().addCookies(storageState.cookies);
        }
        // Set localStorage from the new user's storage state
        if (storageState.origins) {
            for (const origin of storageState.origins) {
                await page.addInitScript(originData => {
                    if (originData.localStorage) {
                        for (const item of originData.localStorage) {
                            localStorage.setItem(item.name, item.value);
                        }
                    }
                }, origin);
            }
        }
        console.log(`✅ Successfully switched to ${userType} user authentication`);
    }
    catch (error) {
        throw new Error(`Failed to switch to ${userType} user: ${error}`);
    }
}
/**
 * Core navigation function that handles account navigation consistently
 */
async function navigateTo(targetPage, page) {
    const nav = new AccountNavigation_1.default(page);
    const pageConfig = nav.pages[targetPage];
    try {
        // Single page check at start
        if (page.isClosed())
            return;
        // Quick DOM ready check only
        await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => { });
        // Open navigation menu if needed (only for non-AccountNav targets)
        if (targetPage !== 'AccountNav') {
            const menuVisible = await nav.pages.AccountNav.verifyElement
                .isVisible({ timeout: 1000 })
                .catch(() => false);
            if (!menuVisible) {
                await nav.pages.AccountNav.link.click();
                await nav.pages.AccountNav.verifyElement.waitFor({ state: 'visible', timeout: 3000 });
            }
        }
        // Handle logout specially
        if (targetPage === 'Logout') {
            await pageConfig.link.click();
            await page
                .waitForURL(/.*login.*/, { waitUntil: 'domcontentloaded', timeout: 5000 })
                .catch(() => { });
        }
        else {
            // Standard navigation - click and verify
            await pageConfig.link.click();
            await pageConfig.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
        }
    }
    catch (error) {
        if (!page.isClosed())
            throw error;
    }
}
const test = base_1.test;
exports.test = test;
test.account = {
    navigateTo,
    switchUser,
};
