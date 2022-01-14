export type RouteMock = {
  Path: string;
  Method?: string;
  Status: number;
  JSON?: any;
}

export class Mocker {
  mocks: RouteMock[];

  constructor() {
    this.mocks = [];
  }

  set(new_mock: RouteMock): void {
    this.mocks.forEach((mock, index) => {
      if (mock.Path == new_mock.Path && mock.Method == new_mock.Method) {
        this.mocks.splice(index, 1);
      }
    });
    this.mocks.push(new_mock);
  }

  mocker(url: RequestInfo, config?: RequestInit): Promise<Partial<Response>> {
    let mock = this.exactMatch(url, config);
    if (mock === undefined) {
      mock = this.exactPathMatch(url);
    }
    if (mock === undefined) {
      mock = this.partialMatchWithMethod(url, config);
    }
    if (mock === undefined) {
      mock = this.partialMatch(url);
    }
    if (mock) {
      console.log("Matched mock");
      console.log(mock);
      let json = mock.JSON;
      if (json === undefined) {
        json = {};
      }
      return Promise.resolve({
        status: mock.Status,
        json: () => Promise.resolve(json)
      });
    }
    console.log("No matching mock");
    console.log(url);
    return Promise.reject("No matching mock");
  }

  applyMocks(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn((url: RequestInfo, config?: RequestInit) => this.mocker(url, config));
  }

  exactMatch(url: RequestInfo, config?: RequestInit): RouteMock | undefined {
    for (const mock of this.mocks) {
      if (mock.Path === url.toString() && config?.method == mock.Method) {
        return mock;
      }
    }
    return undefined;
  }

  exactPathMatch(url: RequestInfo): RouteMock | undefined {
    for (const mock of this.mocks) {
      if (mock.Path === url.toString() && mock.Method === undefined) {
        return mock;
      }
    }
    return undefined;
  }

  partialMatchWithMethod(url: RequestInfo, config?: RequestInit): RouteMock | undefined {
    for (const mock of this.mocks) {
      if (url.toString().includes(mock.Path) && config?.method === mock.Method) {
        return mock;
      }
    }
    return undefined;
  }

  partialMatch(url: RequestInfo,): RouteMock | undefined {
    for (const mock of this.mocks) {
      if (url.toString().includes(mock.Path) && mock.Method === undefined) {
        return mock;
      }
    }
    return undefined;
  }
}
