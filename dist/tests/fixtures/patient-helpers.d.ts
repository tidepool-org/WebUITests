import { test as base } from '@fixtures/base';
import PatientNav from '@pom/patient/PatientNavigation';
import type { Page } from '@playwright/test';
/**
 * Initialize patient navigation helpers after login
 */
declare function setupPatientSession(page: Page): Promise<PatientNav>;
/**
 * New scalable navigation function using state machine approach
 */
declare function navigateTo(targetPage: keyof PatientNav['pages'], page: Page): Promise<void>;
declare const test: typeof base & {
    patient: {
        navigateTo: typeof navigateTo;
        setup: typeof setupPatientSession;
    };
};
export { test };
