import { getConfigFromEnv } from "./config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const config = getConfigFromEnv();

        expect(config.BlaiseApiUrl).toBe("http://mock-api");
        expect(config.ProjectId).toBe("a-project-name");
        expect(config.BucketName).toBe("unique-bucket");
        expect(config.BimsApiUrl).toBe("bims-mock-api");
        expect(config.BimsClientId).toBe("mock-client-id");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            BLAISE_API_URL: undefined,
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined
        });

        const config = getConfigFromEnv();

        expect(config.BlaiseApiUrl).toBe("http://ENV_VAR_NOT_SET");
        expect(config.ProjectId).toBe("ENV_VAR_NOT_SET");
        expect(config.BucketName).toBe("ENV_VAR_NOT_SET");
        expect(config.BimsApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(config.BimsClientId).toBe("ENV_VAR_NOT_SET");
        expect(config.Roles).toStrictEqual(["DST", "BDSS", "Researcher", "IPS Researcher"]);
    });
});
