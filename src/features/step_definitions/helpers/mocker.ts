import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export type RouteMock = {
  Path: string;
  Method?: string;
  Status: number;
  JSON?: any;
}

export class Mocker {
  mocks: RouteMock[];
  mock: MockAdapter;

  constructor() {
    this.mocks = [];
    this.mock = new MockAdapter(axios);
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
      if (mock.Method?.toUpperCase() == "GET") {
        this.mock.onGet(mock.Path).reply(mock.Status, mock.JSON);
      }
      if (mock.Method?.toUpperCase() == "POST") {
        this.mock.onPost(mock.Path).reply(mock.Status, mock.JSON);
      }
      if (mock.Method?.toUpperCase() == "DELETE") {
        this.mock.onDelete(mock.Path).reply(mock.Status, mock.JSON);
      }
      if (mock.Method?.toUpperCase() == "PUT") {
        this.mock.onPut(mock.Path).reply(mock.Status, mock.JSON);
      }
      if (mock.Method?.toUpperCase() == "PATCH") {
        this.mock.onPatch(mock.Path).reply(mock.Status, mock.JSON);
      }
    }
    console.log("No matching mock");
    console.log(url);
    return Promise.reject("No matching mock");
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
