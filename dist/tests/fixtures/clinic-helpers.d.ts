import { test as base } from '@fixtures/base';
import type { Page } from '@playwright/test';
import ClinicianNav from '../../page-objects/clinician/ClinicianNavigation';
export type WorkspaceKey = 'AdminClinicBase' | 'AdminClinicEnterprise' | 'MemberClinicBase' | 'MemberClinicEnterprise' | 'NonMemberClinicBase' | 'NonMemberClinicEnterprise' | 'PartnerClinicBase' | 'PartnerClinicEnterprise';
export type PageKey = 'PatientList' | 'WorkspaceSettings' | 'AddPatient' | 'Profile' | 'ProfileEdit';
/**
 * Initialize clinician navigation helpers after login
 */
declare function setupClinicianSession(page: Page): Promise<ClinicianNav>;
/**
 * Navigate to workspace selection page
 */
declare function navigateToWorkspaceSelection(page: Page): Promise<void>;
/**
 * Navigate to a specific workspace using hardcoded workspace key
 */
declare function navigateToWorkspace(workspaceKey: WorkspaceKey, page: Page): Promise<void>;
/**
 * Core navigation function that handles workspace prerequisites and page navigation
 */
declare function navigateTo(targetPage: PageKey, page: Page, workspaceKey?: WorkspaceKey): Promise<void>;
/**
 * Execute test logic across multiple workspaces
 */
declare function executeAcrossWorkspaces(workspaceConfigs: {
    workspaceKey: WorkspaceKey;
}[], action: (config: {
    workspaceKey: WorkspaceKey;
}) => Promise<void>, page: Page): Promise<void>;
/**
 * Find and access any patient whose name contains the search term (optimized version)
 * @param searchTerm - Partial name to search for (e.g., "Custodial")
 * @param page - The Playwright page object
 * @returns The full name of the patient that was accessed
 */
declare function findAndAccessPatientByPartialName(searchTerm: string, page: Page): Promise<string>;
/**
 * Find and access any available patient (fastest option)
 * @param page - The Playwright page object
 * @returns The full name of the first patient that was accessed
 */
declare function findAndAccessAnyPatient(page: Page): Promise<string>;
/**
 * Access a specific patient by name and navigate to their summary page
 * @param patientName - The name of the patient to access
 * @param page - The Playwright page object
 */
declare function accessPatient(patientName: string, page: Page): Promise<void>;
declare const test: typeof base & {
    clinician: {
        navigateTo: typeof navigateTo;
        navigateToWorkspace: typeof navigateToWorkspace;
        navigateToWorkspaceSelection: typeof navigateToWorkspaceSelection;
        executeAcrossWorkspaces: typeof executeAcrossWorkspaces;
        accessPatient: typeof accessPatient;
        findAndAccessPatientByPartialName: typeof findAndAccessPatientByPartialName;
        findAndAccessAnyPatient: typeof findAndAccessAnyPatient;
        setup: typeof setupClinicianSession;
    };
};
export { test };
