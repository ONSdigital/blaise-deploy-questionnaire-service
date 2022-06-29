import { Logger } from "./logger";
import LoggingReleaseDateManager from "./loggingReleaseDateManager";
import {ReleaseDateManager} from "./releaseDateManager";


describe("loggingReleaseDateManager", () => {
    let instance: ReleaseDateManager;
    let logger: Logger
    let decorator: LoggingReleaseDateManager;

    beforeEach( () => {
        instance = {
            createReleaseDate: jest.fn(),
            deleteReleaseDate: jest.fn(),
            getReleaseDate: jest.fn(),
            updateReleaseDate: jest.fn(),
        };
        logger = {
            info: jest.fn(),
            error: jest.fn(),
        };
        decorator = new LoggingReleaseDateManager(instance, logger);
    })

    describe("createReleaseDate", () => {
        it("returns the result from the decorated instance", async () => {
            (instance.createReleaseDate as jest.Mock).mockReturnValue(Promise.resolve("29-06-2022"));
            expect(await decorator.createReleaseDate("DST211Z", "24-01-1988")).toEqual("29-06-2022");
        })

        it("calls the decorated instance with the provided args", async () => {
            await decorator.createReleaseDate("DST211Z", "24-01-1988");
            expect(instance.createReleaseDate).toHaveBeenCalledWith("DST211Z", "24-01-1988");
        })

        it("logs a success message", async () => {
            await decorator.createReleaseDate("DST211Z", "24-01-1988");
            expect(logger.info).toHaveBeenCalledWith("Successfully set TM release date to 24-01-1988 for questionnaire DST211Z");
            expect(logger.error).not.toHaveBeenCalled();
        })

        it("logs an error message", async () => {
            (instance.createReleaseDate as jest.Mock).mockReturnValue(Promise.reject("foo"));

            await expect(decorator.createReleaseDate("DST211Z", "29-06-2022")).rejects.toEqual("foo");
            expect(logger.error).toHaveBeenCalledWith("Failed to set TM release date to 29-06-2022 for questionnaire DST211Z");

            expect(logger.info).not.toHaveBeenCalled();
        })
    })


    describe("deleteReleaseDate", () => {
        it("calls the decorated instance with the provided args", async () => {
            await decorator.deleteReleaseDate("DST211Z");
            expect(instance.deleteReleaseDate).toHaveBeenCalledWith("DST211Z");
        })

        it("logs a success message", async () => {
            await decorator.deleteReleaseDate("DST211Z");
            expect(logger.info).toHaveBeenCalledWith("Successfully removed TM release date for questionnaire DST211Z");
            expect(logger.error).not.toHaveBeenCalled();
        })

        it("logs an error message", async () => {
            (instance.deleteReleaseDate as jest.Mock).mockReturnValue(Promise.reject("foo"));

            await expect(decorator.deleteReleaseDate("DST211Z")).rejects.toEqual("foo");
            expect(logger.error).toHaveBeenCalledWith("Failed to remove TM release date for questionnaire DST211Z");

            expect(logger.info).not.toHaveBeenCalled();
        })
    })

    describe("getReleaseDate", () => {
        it("returns the result from the decorated instance", async () => {
            (instance.getReleaseDate as jest.Mock).mockReturnValue(Promise.resolve("29-06-2022"));
            expect(await decorator.getReleaseDate("DST211Z")).toEqual("29-06-2022");
        })

        it("calls the decorated instance with the provided args", async () => {
            await decorator.getReleaseDate("DST211Z");
            expect(instance.getReleaseDate).toHaveBeenCalledWith("DST211Z");
        })
    })
    describe("updateReleaseDate", () => {
        it("returns the result from the decorated instance", async () => {
            (instance.updateReleaseDate as jest.Mock).mockReturnValue(Promise.resolve("29-06-2022"));
            expect(await decorator.updateReleaseDate("DST211Z", "24-01-1988")).toEqual("29-06-2022");
        })

        it("calls the decorated instance with the provided args", async () => {
            await decorator.updateReleaseDate("DST211Z", "24-01-1988");
            expect(instance.updateReleaseDate).toHaveBeenCalledWith("DST211Z", "24-01-1988");
        })

        it("logs a success message", async () => {
            await decorator.updateReleaseDate("DST211Z", "24-01-1988");
            expect(logger.info).toHaveBeenCalledWith("Successfully set TM release date to 24-01-1988 for questionnaire DST211Z");
            expect(logger.error).not.toHaveBeenCalled();
        })

        it("logs an error message", async () => {
            (instance.updateReleaseDate as jest.Mock).mockReturnValue(Promise.reject("foo"));

            await expect(decorator.updateReleaseDate("DST211Z", "29-06-2022")).rejects.toEqual("foo");
            expect(logger.error).toHaveBeenCalledWith("Failed to set TM release date to 29-06-2022 for questionnaire DST211Z");

            expect(logger.info).not.toHaveBeenCalled();
        })
    })
})
