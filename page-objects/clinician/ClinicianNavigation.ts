import { Locator, Page } from '@playwright/test';

// Workspace verification interface (matching PatientNavigation format)
export interface WorkspaceNavVerify {
  name: string;
  link: Locator;
  verifyURL: string;
  verifyElement: Locator;
}

// Page navigation verification interface (matching PatientNavigation format)
export interface PageNavVerify {
  name: string;
  link: Locator;
  verifyURL: string;
  verifyElement: Locator;
  closeButton?: Locator;
}

export default class ClinicianNav {
  readonly page: Page;

  readonly workspaces: Record<
    | 'AdminClinicBase'
    | 'AdminClinicEnterprise'
    | 'MemberClinicBase'
    | 'MemberClinicEnterprise'
    | 'NonMemberClinicBase'
    | 'NonMemberClinicEnterprise'
    | 'PartnerClinicBase'
    | 'PartnerClinicEnterprise',
    WorkspaceNavVerify
  >;

  readonly pages: Record<
    'PatientList' | 'WorkspaceSettings' | 'ManageWorkspaces' | 'AddPatient' | 'Profile' | 'ProfileEdit',
    PageNavVerify
  >;

  constructor(page: Page) {
    this.page = page;

    // Define hardcoded workspace configurations (matching PatientNavigation approach)
    this.workspaces = {
      AdminClinicBase: {
        name: 'Admin Clinic (Base)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Admin Clinic (Base) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Admin Clinic (Base)' }),
      },
      AdminClinicEnterprise: {
        name: 'Admin Clinic (Enterprise)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Admin Clinic (Enterprise) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Admin Clinic (Enterprise)' }),
      },
      MemberClinicBase: {
        name: 'Member Clinic (Base)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Member Clinic (Base) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Member Clinic (Base)' }),
      },
      MemberClinicEnterprise: {
        name: 'Member Clinic (Enterprise)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Member Clinic (Enterprise) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Member Clinic (Enterprise)' }),
      },
      NonMemberClinicBase: {
        name: 'Non-Member Clinic (Base)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Non-Member Clinic (Base) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Non-Member Clinic (Base)' }),
      },
      NonMemberClinicEnterprise: {
        name: 'Non-Member Clinic (Enterprise)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Non-Member Clinic (Enterprise) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Non-Member Clinic (Enterprise)' }),
      },
      PartnerClinicBase: {
        name: 'Partner Clinic (Base)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Partner Clinic (Base) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Partner Clinic (Base)' }),
      },
      PartnerClinicEnterprise: {
        name: 'Partner Clinic (Enterprise)',
        link: page
          .locator('#navigationMenu button')
          .filter({ hasText: 'Partner Clinic (Enterprise) Workspace' }),
        verifyURL: 'clinic-workspace',
        verifyElement: page.locator('h4').filter({ hasText: 'Partner Clinic (Enterprise)' }),
      },
    };

    // Define clinician page navigation (matching PatientNavigation format)
    this.pages = {
      PatientList: {
        name: 'PatientList',
        link: page.getByRole('link', { name: 'Patients' }),
        verifyURL: 'clinic-workspace/patients',
        verifyElement: page.getByRole('heading', { name: 'Patients' }),
      },
      WorkspaceSettings: {
        name: 'WorkspaceSettings',
        link: page.getByRole('link', { name: 'Workspace Settings' }),
        verifyURL: 'clinic-workspace/workspace/settings',
        verifyElement: page.getByRole('heading', { name: 'Workspace Settings' }),
      },
      ManageWorkspaces: {
        name: 'ManageWorkspaces',
        link: page
          .locator('#navigationMenu button.navigation-menu-option')
          .filter({ hasText: 'Manage Workspaces' }),
        verifyURL: 'workspaces',
        verifyElement: page.getByText('Welcome To Tidepool'), // Should land back on the workspace selection page
      },
      AddPatient: {
        name: 'AddPatient',
        link: page.getByRole('button', { name: 'Add Patient' }),
        verifyURL: 'clinic-workspace/patients/add',
        verifyElement: page.getByRole('heading', { name: 'Add Patient' }),
      },
      Profile: {
        name: 'Profile',
        link: page
          .getByRole('button', { name: 'Patient Profile Profile' })
          .or(page.getByRole('tab', { name: 'Profile' }))
          .or(page.getByRole('link', { name: 'Profile' }))
          .or(page.getByRole('button', { name: 'Profile' })),
        verifyURL: 'profile',
        verifyElement: page
          .getByRole('button', { name: 'Edit' })
          .or(page.getByRole('button', { name: 'Edit Profile' })),
      },
      ProfileEdit: {
        name: 'ProfileEdit',
        link: page
          .getByRole('button', { name: 'Edit' })
          .or(page.getByRole('button', { name: 'Edit Profile' })),
        verifyURL: 'profile',
        verifyElement: page
          .getByRole('button', { name: 'Save changes' })
          .or(page.getByRole('button', { name: 'Save Profile' }))
          .or(page.getByRole('button', { name: 'Save' })),
      },
    };
  }
}
