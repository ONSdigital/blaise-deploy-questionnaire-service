const flushPromises = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

export default () => flushPromises().then(flushPromises);
