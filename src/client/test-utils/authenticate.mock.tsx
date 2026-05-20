import React, { type ReactNode } from "react";

type User = {
  name: string;
  role: string;
  serverParks: string[];
  defaultServerPark: string;
};

type AuthenticateChildren = (
  user: User,
  loggedIn: boolean,
  logOutFunction: () => void,
) => ReactNode;

type AuthenticateProps = {
  title?: string;
  children: AuthenticateChildren;
};

type AuthManagerOptions = {
  sessionKey: string;
  cookieDomain?: string;
};

const mockToken = "example-token";

class MockAuthManager {
  public constructor(_options?: AuthManagerOptions) {}

  public getToken = (): string | null => (mockAuthenticateState.loggedIn ? mockToken : null);

  public setToken = (token: string | null): void => {
    mockAuthenticateState.loggedIn = token != null;
  };

  public clearToken = (): void => {
    mockAuthenticateState.loggedIn = false;
  };

  public loggedIn = async (): Promise<boolean> => true;

  public authHeader = (): Record<string, string> =>
    mockAuthenticateState.loggedIn ? { authorization: mockToken } : {};

  public cookieSettings = (): Record<string, string> => ({ path: "/" });
}

class MockAuthClientClass {
  public constructor(options?: AuthManagerOptions) {
    mockAuthenticateState.authClientOptions = options;
  }

  public loggedIn = async (): Promise<boolean> => mockAuthenticateState.loggedIn;

  public setToken = (token: string | null): void => {
    mockAuthenticateState.loggedIn = token != null;
  };

  public clearToken = (): void => {
    mockAuthenticateState.loggedIn = false;
  };

  public logOut = (): void => {
    mockAuthenticateState.loggedIn = false;
  };

  public authHeader = (): Record<string, string> =>
    mockAuthenticateState.loggedIn ? { authorization: mockToken } : {};

  public getToken = (): string | null => (mockAuthenticateState.loggedIn ? mockToken : null);
}

const defaultUser: User = {
  name: "Test User",
  role: "",
  serverParks: [""],
  defaultServerPark: "",
};

const mockAuthenticateState = {
  authClientOptions: undefined as AuthManagerOptions | undefined,
  loggedIn: true,
  logOutFunction: () => undefined,
  user: defaultUser,
};

function resetMockAuthenticate(): void {
  mockAuthenticateState.authClientOptions = undefined;
  mockAuthenticateState.loggedIn = true;
  mockAuthenticateState.logOutFunction = () => undefined;
  mockAuthenticateState.user = defaultUser;
}

function renderMockAuthenticate(props: unknown): React.ReactNode {
  const propsObj = props as AuthenticateProps;

  if (!mockAuthenticateState.loggedIn) {
    return <div>Enter your Blaise username and password</div>;
  }

  if (typeof propsObj.children === "function") {
    return (
      <>
        {propsObj.children(mockAuthenticateState.user, true, mockAuthenticateState.logOutFunction)}
      </>
    );
  }

  return <>{propsObj.children}</>;
}

export function mockLoginReactClientModule() {
  return {
    Authenticate: renderMockAuthenticate,
    AuthManager: MockAuthManager,
    AuthClient: MockAuthClientClass,
    LoginForm: () => null,
    createSessionKey: (environmentKey: string) => `blaise-user-${environmentKey}`,
  };
}

export const MockAuthenticate = {
  GetAuthClientOptions(): AuthManagerOptions | undefined {
    return mockAuthenticateState.authClientOptions;
  },
  OverrideReturnValues(user: Partial<User> | null, loggedIn: boolean): void {
    mockAuthenticateState.loggedIn = loggedIn;
    mockAuthenticateState.user = {
      ...defaultUser,
      ...(user ?? {}),
    };
  },
  prototype: {
    render: renderMockAuthenticate,
  },
};

resetMockAuthenticate();
