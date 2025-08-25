import env from '../../utilities/env';
export default class WorkspacesPage {
    constructor(page) {
        this.url = `${env.BASE_URL}/workspaces`;
        this.page = page;
        this.header = page.getByRole('heading', { name: 'Clinic Workspace' });
        this.subHeader = page.getByRole('paragraph', {
            name: 'View, share and manage patient data',
        });
        this.createClinicButton = page.getByRole('button', {
            name: 'Create a New Clinic',
        });
    }
    async goto() {
        await this.page.goto(this.url);
    }
    async visitFirstClinic() {
        await this.page.getByRole('button', { name: 'Go To Workspace' }).first().click();
    }
    /**
     * Visit a clinic by name
     * @param clinicName - The name of the clinic to visit
     */
    async visitClinic(clinicName) {
        // find child element with text and filter by parent element with class
        const child = this.page.getByText(clinicName);
        const parent = this.page.locator('.workspace-item-clinic').filter({ has: child });
        await parent.getByRole('button', { name: 'Go To Workspace' }).first().click();
    }
}
