"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@fixtures/base");
const PatientNavigation_1 = __importDefault(require("@pom/patient/PatientNavigation"));
const navigation_section_1 = __importDefault(require("@components/navigation.section"));
function createSection(page, selector) {
    const parsedSelector = selector === 'tubing-primes' ? 'siteChanges' : selector;
    const container = page.locator(`.Calendar-container-${parsedSelector}`);
    return {
        container,
        firstDayOfData: container.locator(`.Calendar-day--${parsedSelector}.Calendar-day`).first(),
        calendarDayhover: {
            el: container.locator('.Calendar-day--HOVER'),
            async text() {
                return container.locator('.Calendar-day--HOVER').locator('.Calendar-weekday').textContent();
            },
        },
    };
}
/**
 * helper function to create a stat object with locators for the container, header, hoverBar, and hoverBarLabel
 */
function createStat(page, selector) {
    const container = page.locator(`#Stat--${selector}`);
    return {
        container,
        header: container.locator('[class^="Stat--chartTitleText"]'),
        hoverBar: container.locator('.HoverBar'),
        hoverBarLabel: container.locator('.HoverBarLabel'),
    };
}
// list of sections in the stats sidebar
const statsSideBarSection = [
    'timeInRange',
    'readingsInRange',
    'averageGlucose',
    'totalInsulin',
    'carbs',
    'standardDev',
    'coefficientOfVariation',
    'sensorUsage',
    'glucoseManagementIndicator',
    'totalInsulin',
    'averageDailyDose',
];
let PatientDataBasicsPage = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _goto_decorators;
    return _a = class PatientDataBasicsPage {
            constructor(page) {
                this.page = __runInitializers(this, _instanceExtraInitializers);
                this.page = page;
                this.url = '/patients/data/basics';
                this.emailInput = page.getByRole('textbox', { name: 'Email' });
                this.navigationBar = new navigation_section_1.default(page);
                this.navigationSubMenu = new PatientNavigation_1.default(page);
                this.headerBgReading = page.getByRole('heading', { name: 'BG readings' });
                this.headerBolusing = page.getByRole('heading', { name: 'Bolusing' });
                this.statsSidebar = {
                    toggleContainer: page.locator('.toggle-container'),
                    async toggleTo(toState) {
                        const activeToggleState = await page
                            .locator(".toggle-container span[class*='TwoOptionToggle--active']")
                            .innerText();
                        if (activeToggleState === 'BGM' && toState === 'CGM') {
                            await this.toggleContainer.click();
                        }
                        else if (activeToggleState === 'CGM' && toState === 'BGM') {
                            await this.toggleContainer.click();
                        }
                    },
                    ...Object.fromEntries(statsSideBarSection.map(stat => [stat, createStat(page, stat)])),
                };
                // charts
                this.bgReadingsSection = createSection(page, 'fingersticks');
                this.bolusingSection = createSection(page, 'boluses');
                this.tubingPrimeSection = {
                    ...createSection(page, 'tubing-primes'),
                    settings: page.locator('.SiteChangeSelector-option').first(),
                    settingsOption: {
                        fillTubing: page.getByLabel('Tubing Fill'),
                        fillCannula: page.getByLabel('Cannula Fill'),
                    },
                    tubingIcons: page.locator('.Change--tubing').first(),
                    cannulaIcons: page.locator('.Change--cannula').first(),
                    filledDay: createSection(page, 'tubing-primes')
                        .container.locator('.Calendar-day')
                        .filter({ has: page.locator('.Change-daysSince-text') })
                        .first(),
                };
                this.basalsSection = createSection(page, 'basals');
            }
            async goto() {
                await this.page.goto(this.url);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _goto_decorators = [(0, base_1.step)('Navigate to the basics page')];
            __esDecorate(_a, null, _goto_decorators, { kind: "method", name: "goto", static: false, private: false, access: { has: obj => "goto" in obj, get: obj => obj.goto }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.default = PatientDataBasicsPage;
