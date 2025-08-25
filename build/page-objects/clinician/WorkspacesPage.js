"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("../../utilities/env"));
class WorkspacesPage {
    constructor(page) {
        this.url = `${env_1.default.BASE_URL}/workspaces`;
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
exports.default = WorkspacesPage;
