export default class ClinicAdminPage {
    constructor(page) {
        this.url = '/clinic-admin';
        this.name = 'ClinicAdminPage'; // Added name for step decorator context
        this.page = page;
        this.clinicDetailsHeader = page.getByText('Workspace Settings');
        // Assuming the edit button is specifically associated with the details section
        this.editDetailsButton = page.getByRole('button', { name: 'Edit' });
        this.editClinicModal = page.getByRole('dialog'); // General dialog selector
        this.editClinicModalTitle = this.editClinicModal.getByRole('heading', {
            name: 'Edit Workspace Details',
        });
        this.addressInput = this.editClinicModal.getByLabel('Address', { exact: true }); // Use exact label match
        this.saveChangesButton = this.editClinicModal.getByRole('button', { name: 'Save Changes' });
        // Assuming the details are within a specific container section related to the header
        this.clinicDetailsSection = page.locator('div:has(> span:text-is("Workspace Settings")) + div');
    }
    /**
     * Waits for essential elements of the Clinic Admin page to be loaded.
     */
    async waitForLoadState() {
        await this.page.waitForLoadState(); // Wait for base elements like header/footer
        await this.clinicDetailsHeader.waitFor({ state: 'visible', timeout: 40000 });
        await this.editDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
    }
}
