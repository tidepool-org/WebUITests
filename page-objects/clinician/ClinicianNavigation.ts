import { Locator, Page } from '@playwright/test';

// List of workspace display names
export const WORKSPACE_NAMES = [
  'Admin Clinic (Base)',
  'Admin Clinic (Enterprise)',
  'Admin Clinic (Essential)',
  'Admin Clinic (Professional)',
  'Member Clinic (Base)',
  'Member Clinic (Enterprise)',
  'Member Clinic (Essential)',
  'Member Clinic (Professional)',
] as const;

// Key generator for workspace names
const workspaceKey = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '');
export type WorkspaceKey = ReturnType<typeof workspaceKey>;

// Unified navigation verification interface
export interface NavVerify {
  link: Locator;
  verifyURL: string;
  verifyElement: Locator;
  closeButton?: Locator;
}

export default class ClinicianNav {
  readonly workspaces: Record<WorkspaceKey, NavVerify>;

  readonly pages: Record<
    | 'PatientList'
    | 'WorkspaceSettings'
    | 'ManageWorkspaces'
    | 'AddPatient'
    | 'Profile'
    | 'ProfileEdit',
    NavVerify
  >;

  constructor(page: Page) {
    if (!page || typeof page.getByRole !== 'function') {
      throw new Error(
        '[ClinicianNav] Invalid Playwright Page object passed to ClinicianNav constructor.',
      );
    }

    const WORKSPACE_VERIFY_URL = 'clinic-workspace';
    this.workspaces = Object.fromEntries(
      WORKSPACE_NAMES.map(name => [
        workspaceKey(name),
        {
          link: page
            .locator('.workspace-item-clinic')
            .filter({ hasText: name })
            .getByRole('button', { name: 'Go To Workspace' }),
          verifyURL: WORKSPACE_VERIFY_URL,
          verifyElement: page.locator('h4').filter({ hasText: name }),
        },
      ]),
    ) as Record<WorkspaceKey, NavVerify>;

    this.pages = {
      PatientList: {
        link: page.getByRole('tab', { name: 'Patient List' }),
        verifyURL: 'clinic-workspace/patients',
        verifyElement: page.getByRole('heading', { name: 'Patients' }),
      },
      WorkspaceSettings: {
        link: page.getByRole('button', { name: 'Workspace Settings' }),
        verifyURL: 'clinic-workspace/workspace/settings',
        verifyElement: page.getByRole('heading', { name: 'Workspace Settings' }),
      },
      ManageWorkspaces: {
        link: page
          .locator('#navigationMenu button.navigation-menu-option')
          .filter({ hasText: 'Manage Workspaces' }),
        verifyURL: 'workspaces',
        verifyElement: page.getByText('Welcome To Tidepool'),
      },
      AddPatient: {
        link: page.getByRole('button', { name: 'Add Patient' }),
        verifyURL: 'clinic-workspace/patients/add',
        verifyElement: page.getByRole('heading', { name: 'Add Patient' }),
      },
      Profile: {
        link: page
          .getByRole('button', { name: 'Patient Profile Profile' })
          .or(page.getByRole('tab', { name: 'Profile' }))
          .or(page.getByRole('link', { name: 'Profile' }))
          .or(page.getByRole('button', { name: 'Profile' })),
        verifyURL: 'profile',
        verifyElement: page.getByRole('heading', { name: 'Edit Patient Details' }),
      },
      ProfileEdit: {
        link: page
          .getByRole('button', { name: 'Edit Patient Details' })
          .or(page.getByRole('button', { name: 'Edit Patient Details' })),
        verifyURL: 'profile',
        verifyElement: page
          .getByRole('button', { name: 'Save changes' })
          .or(page.getByRole('button', { name: 'Save Profile' }))
          .or(page.getByRole('button', { name: 'Save' })),
      },
    };
  }
}
