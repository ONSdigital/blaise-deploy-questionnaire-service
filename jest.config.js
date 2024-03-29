module.exports = {
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "^axios$": require.resolve("axios")
    },
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],
    testTimeout: 30000
};

process.env = Object.assign(process.env, {
    BLAISE_API_URL: "mock-api",
    PROJECT_ID: "a-project-name",
    BUCKET_NAME: "unique-bucket",
    SERVER_PARK: "server-park",
    BIMS_API_URL: "bims-mock-api",
    BIMS_CLIENT_ID: "mock-client-id"
});
