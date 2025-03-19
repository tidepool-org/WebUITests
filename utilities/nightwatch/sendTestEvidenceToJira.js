const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const directoryPath = path.join(__dirname, "../test_evidence");
const jiraEmail = "webuiautomation+jira@tidepool.org";
const jiraToken = process.env.JIRA_API_TOKEN;
const jiraIssueKey = process.env.TEST_EXECUTION_KEY;
const jiraUrl = `https://tidepool.atlassian.net/rest/api/3/issue/${jiraIssueKey}/attachments`;

// Function to upload a single file to JIRA
async function uploadFileToJira(filePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(jiraUrl, form, {
      headers: {
        ...form.getHeaders(),
        "X-Atlassian-Token": "no-check",
        Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64")}`,
      },
    });

    console.log(
      `Uploaded ${path.basename(filePath)}: status ${response.status}`,
    );
  } catch (error) {
    console.error(
      `Error uploading ${path.basename(filePath)}: `,
      error.response?.data || error.message,
    );
  }
}

// Read all files from the directory and upload each to JIRA
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error("Failed to read directory: ", err);
  }
  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    uploadFileToJira(filePath);
  });
  return console.log("Files Uploading to Jira");
});
