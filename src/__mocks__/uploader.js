let uploadSuccess = true;

function uploader() {
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
            if (uploadSuccess) {
                callback();
            } else {
                callback("Failed");
            }
        },
        abort: function () {
            return;
        },
        __setMockStatus: function (success = true) {
            uploadSuccess = success;
        }
    };
}

function __setMockStatus(success = true) {
    uploadSuccess = success;
}

uploader.__setMockStatus = __setMockStatus;

export default uploader;
