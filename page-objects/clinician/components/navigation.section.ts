import { Locator, Page } from '@playwright/test';
import NavigationMenu from './navigation-menu.section';

export default class NavigationSection {
  page: Page;

  container: Locator;

  menu: NavigationMenu;

  buttons: {
    viewData: Locator;
    patientProfile: Locator;
    share: Locator;
    uploadData: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('div#navPatientHeader');

    this.menu = new NavigationMenu(page);
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
