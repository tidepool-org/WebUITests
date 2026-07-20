export class AccountSettingsPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.saveButton = page.getByRole('button', { name: /save/i });
        this.saveConfirm = page.getByText(/All Changes Saved/i);
    }
}
export default AccountSettingsPage;
