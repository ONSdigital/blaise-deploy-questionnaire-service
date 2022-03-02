// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const flushPromises = () => new Promise(setTimeout);

export default () => flushPromises().then(flushPromises);
