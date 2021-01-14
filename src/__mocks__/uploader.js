export default function () {
    // return {
    //     options: jest.fn().mockReturnThis(),
    //     continue: jest.fn().mockReturnThis(),
    //     onProgress: jest.fn().mockReturnThis(),
    //     end: jest.fn().mockReturnValue({error: null, data: null}),
    //     abort: jest.fn().mockReturnThis(),
    //     send: this.end(),
    // };

    return {
        options: function (options) {
            return this;
        },
        send: function (file) {
            return this;
        },
        continue: function () {
            return;
        },
        onProgress: function (callback) {
            return this;
        },
        end: function (callback) {
            callback();
        },
        abort: function () {
            return;
        }
    };
}
