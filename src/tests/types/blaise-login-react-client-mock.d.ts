declare module "blaise-login-react/blaise-login-react-client" {
  export function mockLoginReactClientModule(): {
    Authenticate: (props: {
      title?: string;
      children: (user: unknown, loggedIn: boolean, logOutFunction: () => void) => unknown;
    }) => unknown;
    AuthManager: new () => {
      authHeader: () => Record<string, string>;
    };
  };

  export const MockAuthenticate: {
    OverrideReturnValues: (user: Record<string, unknown> | null, loggedIn: boolean) => void;
  };
}
