import { getEnvironmentVariables } from "./config";
import { AuthManager } from "blaise-login-react-client";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });




    it("should return the correct environment variables", () => {
        const { BlaiseApiUrl, ProjectId, BucketName, BimsApiUrl, BimsClientId } = getEnvironmentVariables();


        expect(BlaiseApiUrl).toBe("http://mock-api");
        expect(ProjectId).toBe("a-project-name");
        expect(BucketName).toBe("unique-bucket");
        expect(BimsApiUrl).toBe("bims-mock-api");
        expect(BimsClientId).toBe("mock-client-id");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            BLAISE_API_URL: undefined,
            PROJECT_ID: undefined,
            BUCKET_NAME: undefined
        });

        const { BlaiseApiUrl, ProjectId, BucketName, BimsApiUrl, BimsClientId } = getEnvironmentVariables();


        expect(BlaiseApiUrl).toBe("http://ENV_VAR_NOT_SET");
        expect(ProjectId).toBe("ENV_VAR_NOT_SET");
        expect(BucketName).toBe("ENV_VAR_NOT_SET");
        expect(BimsApiUrl).toBe("ENV_VAR_NOT_SET");
        expect(BimsClientId).toBe("ENV_VAR_NOT_SET");
    });
});
