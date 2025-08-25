"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const daily_chart_js_1 = __importDefault(require("@components/daily-chart.js"));
const PatientNavigation_js_1 = __importDefault(require("@pom/patient/PatientNavigation.js"));
const navigation_section_js_1 = __importDefault(require("@components/navigation.section.js"));
class PatientDataDailyPage {
    constructor(page) {
        this.page = page;
        this.navigationBar = new navigation_section_js_1.default(page);
        this.navigationSubMenu = new PatientNavigation_js_1.default(page);
        this.dailyChart = new daily_chart_js_1.default(page);
    }
}
exports.default = PatientDataDailyPage;
