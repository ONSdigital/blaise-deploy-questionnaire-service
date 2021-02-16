// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const flushPromises = () => new Promise(setTimeout);

export function mock_server_request_Return_JSON(returnedStatus: number, returnedJSON: unknown): void {
    global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

export function mock_server_request_function(mock_function: any): void {
    jest.spyOn(global, "fetch").mockImplementation(mock_function);
}

export default () => flushPromises().then(flushPromises);
