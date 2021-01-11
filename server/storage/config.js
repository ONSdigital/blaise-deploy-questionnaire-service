import {getEnvironmentVariables} from "../Config";
import path from "path";

const serviceKey = path.join(__dirname, "./keys.json");

const Cloud = require("@google-cloud/storage");

const { Storage } = Cloud;

const {PROJECT_ID} = getEnvironmentVariables();

const storage = new Storage({
  projectId: PROJECT_ID,
  keyFilename: serviceKey,
});

module.exports = storage;
