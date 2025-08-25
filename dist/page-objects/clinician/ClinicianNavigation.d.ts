import { Locator, Page } from '@playwright/test';
export interface WorkspaceNavVerify {
    name: string;
    link: Locator;
    verifyURL: string;
    verifyElement: Locator;
}
export interface PageNavVerify {
    name: string;
    link: Locator;
    verifyURL: string;
    verifyElement: Locator;
    closeButton?: Locator;
}
export default class ClinicianNav {
    readonly page: Page;
    readonly workspaces: Record<'AdminClinicBase' | 'AdminClinicEnterprise' | 'MemberClinicBase' | 'MemberClinicEnterprise' | 'NonMemberClinicBase' | 'NonMemberClinicEnterprise' | 'PartnerClinicBase' | 'PartnerClinicEnterprise', WorkspaceNavVerify>;
    readonly pages: Record<'PatientList' | 'WorkspaceSettings' | 'AddPatient' | 'Profile' | 'ProfileEdit', PageNavVerify>;
    constructor(page: Page);
}
