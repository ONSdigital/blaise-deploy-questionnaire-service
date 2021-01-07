import {getEnvironmentVariables} from "../Config";

const Cloud = require("@google-cloud/storage");

const { Storage } = Cloud;

const {PROJECT_ID} = getEnvironmentVariables();

const storage = new Storage({
  projectId: PROJECT_ID,
});

module.exports = storage;
