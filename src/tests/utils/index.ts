// @ts-ignore
const flushPromises = () => new Promise(setTimeout);

export function mock_server_request_Return_JSON(returnedStatus: number, returnedJSON: unknown) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

export function mock_server_request_function(mock_function: any) {
    global.fetch = mock_function();
}

export default () => flushPromises().then(flushPromises);
