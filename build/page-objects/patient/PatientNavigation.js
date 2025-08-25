"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PatientNav {
    // currentDate: Locator;
    constructor(page) {
        this.page = page;
        this.pages = {
            ViewData: {
                name: 'ViewData',
                link: page.getByRole('button', { name: 'View Data View' }),
                verifyURL: 'data',
                verifyElement: page.locator('div.patient-data-subnav-inner'),
            },
            Basics: {
                name: 'Basics',
                link: page.getByRole('link', { name: 'Basics' }),
                verifyURL: 'data/basics',
                verifyElement: page.locator('.js-basics.patient-data-subnav-tablink.patient-data-subnav-active'),
            },
            ChartDateRange: {
                name: 'ChartDateRange',
                link: page
                    .locator('button svg, .css-15vjjnj svg, [aria-label*="calendar"], [title*="calendar"]')
                    .first(), // Calendar icon in blue navigation bar
                verifyURL: '',
                verifyElement: page.locator('#printDateRangePickerInner').locator('*').first(), // Any content inside the dialog
                closeButton: page.getByRole('button', { name: 'close dialog' }),
            },
            Daily: {
                name: 'Daily',
                link: page.getByRole('link', { name: 'Daily' }),
                verifyURL: 'data/daily',
                verifyElement: page.locator('.js-daily.patient-data-subnav-tablink.patient-data-subnav-active'),
            },
            ChartDate: {
                name: 'ChartDate',
                link: page.locator('#tidelineLabel .css-15vjjnj svg'), // Using the same calendar icon selector
                verifyURL: '',
                verifyElement: page.getByRole('heading', { name: 'Chart Date' }),
                closeButton: page.getByRole('button', { name: 'close dialog' }),
            },
            BGLog: {
                name: 'BGLog',
                link: page.getByRole('link', { name: 'BG Log' }),
                verifyURL: 'data/bglog',
                verifyElement: page.locator('.js-bgLog.patient-data-subnav-tablink.patient-data-subnav-active'),
            },
            Trends: {
                name: 'Trends',
                link: page.getByRole('link', { name: 'Trends' }),
                verifyURL: 'data/trends',
                verifyElement: page.locator('.js-trends.patient-data-subnav-tablink.patient-data-subnav-active'),
            },
            Devices: {
                name: 'Devices',
                link: page.getByRole('link', { name: 'Devices' }),
                verifyURL: 'data/devices',
                verifyElement: page.locator('.js-settings.patient-data-subnav-tablink.patient-data-subnav-active'),
            },
            Print: {
                name: 'Print',
                link: page.getByRole('link', { name: 'Print PDF report Print' }), // Print link from the snapshot
                verifyURL: '',
                verifyElement: page.getByRole('heading', { name: 'Print Report' }), // Assuming modal title
                closeButton: page.getByRole('button', { name: 'close dialog' }),
            },
            Profile: {
                name: 'Profile',
                link: page.getByRole('button', { name: 'Profile Profile' }),
                verifyURL: '',
                verifyElement: page.getByRole('button', { name: 'Edit' }), // Edit button is visible on profile page
            },
            ProfileEdit: {
                name: 'ProfileEdit',
                link: page.getByRole('button', { name: 'Edit' }),
                verifyURL: 'profile',
                verifyElement: page.getByRole('button', { name: 'Save changes' }), // Save changes button appears when in edit mode
            },
            Share: {
                name: 'Share',
                link: page.getByRole('button', { name: 'Share Share' }),
                verifyURL: 'share',
                verifyElement: page.getByRole('heading', { name: 'Access Management' }),
            },
            ShareData: {
                name: 'ShareData',
                link: page.getByRole('button', { name: 'Share Data' }),
                verifyURL: 'share/invite',
                verifyElement: page.getByRole('heading', { name: 'Share your data' }),
            },
            UploadData: {
                name: 'UploadData',
                link: page.getByRole('button', { name: 'Upload Data Upload' }),
                verifyURL: 'upload',
                verifyElement: page.getByRole('heading', { name: 'Upload Data' }),
            },
        };
    }
}
exports.default = PatientNav;
