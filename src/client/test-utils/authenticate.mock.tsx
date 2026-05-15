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

class MockAuthManager {
  public getToken = (): string | null => null;

  public setToken = (_token: string | null): void => undefined;

  public clearToken = (): void => undefined;

  public loggedIn = async (): Promise<boolean> => true;

  public authHeader = (): Record<string, string> => ({});

  public cookieSettings = (): Record<string, string> => ({ path: "/" });
}

class MockAuthClientClass {
  public loggedIn = async (): Promise<boolean> => mockAuthenticateState.loggedIn;

  public logOut = (setLoggedIn: (v: boolean) => void): void => {
    mockAuthenticateState.loggedIn = false;
    setLoggedIn(false);
  };

  public authHeader = (): Record<string, string> => ({});

  public getToken = (): string | null => null;
}

const defaultUser: User = {
  name: "Test User",
  role: "",
  serverParks: [""],
  defaultServerPark: "",
};

const mockAuthenticateState = {
  loggedIn: true,
  logOutFunction: () => undefined,
  user: defaultUser,
};

function resetMockAuthenticate(): void {
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
  };
}

export const MockAuthenticate = {
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
