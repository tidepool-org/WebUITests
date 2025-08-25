"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountSettingsPage = void 0;
class AccountSettingsPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.saveConfirm = page.getByText(/All Changes Saved/i);
    }
}
exports.AccountSettingsPage = AccountSettingsPage;
exports.default = AccountSettingsPage;
