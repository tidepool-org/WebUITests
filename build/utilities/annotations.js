"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addTestAnnotations;
/**
 * Add test annotations to the test info for JIRA integration
 */
function addTestAnnotations(testInfo, annotations) {
    testInfo.annotations.push({
        type: 'test_key',
        description: annotations.testKey,
    });
    testInfo.annotations.push({
        type: 'test_summary',
        description: annotations.testSummary,
    });
    testInfo.annotations.push({
        type: 'requirements',
        description: annotations.requirements,
    });
    testInfo.annotations.push({
        type: 'test_description',
        description: annotations.testDescription,
    });
}
