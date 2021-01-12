import {getEnvironmentVariables} from "../Config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });




    it("should return the correct environment variables", () => {
        const {BLAISE_API_URL, PROJECT_ID, BUCKET_NAME} = getEnvironmentVariables();


        expect(BLAISE_API_URL).toBe("mock-api");
        expect(PROJECT_ID).toBe("a-project-name");
        expect(BUCKET_NAME).toBe("unique-bucket");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            BLAISE_API_URL: undefined,
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined
        });

        const {BLAISE_API_URL, PROJECT_ID, BUCKET_NAME} = getEnvironmentVariables();


        expect(BLAISE_API_URL).toBe("ENV_VAR_NOT_SET");
        expect(PROJECT_ID).toBe("ENV_VAR_NOT_SET");
        expect(BUCKET_NAME).toBe("ENV_VAR_NOT_SET");
    });
});
