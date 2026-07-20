/**
 * Add test annotations to the test info for JIRA integration
 */
export default function addTestAnnotations(testInfo, annotations) {
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
