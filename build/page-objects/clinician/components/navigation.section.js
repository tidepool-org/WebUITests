"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const navigation_menu_section_1 = __importDefault(require("./navigation-menu.section"));
class NavigationSection {
    constructor(page) {
        this.page = page;
        this.container = page.locator('div#navPatientHeader');
        this.menu = new navigation_menu_section_1.default(page);
        this.buttons = {
            viewData: this.container.getByRole('button', { name: 'View Data' }),
            patientProfile: this.container.getByRole('button', {
                name: 'Patient Profile',
            }),
            share: this.container.getByRole('button', { name: 'Share' }),
            uploadData: this.container.getByRole('button', { name: 'Upload Data' }),
        };
    }
}
exports.default = NavigationSection;
