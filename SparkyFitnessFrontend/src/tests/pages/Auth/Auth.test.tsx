import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth from '@/pages/Auth/Auth';
import { useAuthSettings, useRegisterUserMutation } from '@/hooks/Auth/useAuth';
import type { LoginSettings } from '@/types/auth';

jest.mock('react-i18next', () =>
  jest.requireActual('@/tests/mocks/reactI18next')
);
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
jest.mock('@/contexts/PreferencesContext', () => ({
  usePreferences: () => ({ loggingLevel: 'ERROR' }),
}));
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ signIn: jest.fn(), user: null, loading: false }),
}));
jest.mock('@/hooks/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/lib/auth-client', () => ({
  authClient: {},
  followOAuthRedirect: jest.fn(),
  followOAuthRedirectOrThrow: jest.fn(),
}));
jest.mock('@/hooks/Auth/useAuth', () => {
  const mutation = () => ({ mutateAsync: jest.fn(), isPending: false });
  return {
    mfaFactorsOptions: jest.fn(),
    useAuthSettings: jest.fn(),
    useInitiateOidcLoginMutation: mutation,
    useLoginUserMutation: mutation,
    useDemoLoginMutation: mutation,
    useRegisterUserMutation: jest.fn(mutation),
    useRequestMagicLinkMutation: mutation,
  };
});

function renderWith(
  emailEnabled: boolean,
  magicLink: LoginSettings['magic_link'],
  passkeyEnabled = false,
  signupDisabled = true
) {
  jest.mocked(useAuthSettings).mockReturnValue({
    data: {
      email: { enabled: emailEnabled },
      passkey: { enabled: passkeyEnabled },
      magic_link: magicLink,
      oidc: { enabled: false, providers: [] },
      signup_disabled: signupDisabled,
    },
  } as unknown as ReturnType<typeof useAuthSettings>);
  render(<Auth />);
}

const magicLinkButton = () =>
  screen.queryByRole('button', { name: 'Request Magic Link' });

describe('Auth magic link button', () => {
  it.each([true, false])(
    'shows the button when magic link is on (passwords on: %s)',
    (emailEnabled) => {
      renderWith(emailEnabled, { enabled: true });
      expect(magicLinkButton()).toBeInTheDocument();
    }
  );

  it.each([true, false])(
    'hides the button when magic link is off (passwords on: %s)',
    (emailEnabled) => {
      renderWith(emailEnabled, { enabled: false });
      expect(magicLinkButton()).not.toBeInTheDocument();
    }
  );

  it('shows the button for a server that does not report magic link', () => {
    renderWith(false, undefined);
    expect(magicLinkButton()).toBeInTheDocument();
  });

  it('drops the "Or sign in with" divider when nothing follows it', () => {
    renderWith(true, { enabled: false });
    expect(screen.queryByText('Or sign in with')).not.toBeInTheDocument();
  });

  it('keeps the divider above the other sign-in options', () => {
    renderWith(true, { enabled: false }, true);
    expect(screen.getByText('Or sign in with')).toBeInTheDocument();
  });
});

describe('Auth password registration', () => {
  it('submits an eight-character password with only lowercase letters', async () => {
    const registerUser = jest.fn().mockResolvedValue({ userId: 'local-user' });
    jest.mocked(useRegisterUserMutation).mockReturnValue({
      mutateAsync: registerUser,
      isPending: false,
    } as unknown as ReturnType<typeof useRegisterUserMutation>);

    renderWith(true, { enabled: false }, false, false);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Sign Up' }), {
      key: 'Enter',
    });
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Local User' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'local@example.test' },
    });
    const password = screen.getByLabelText('Password', { exact: true });
    expect(password).toHaveAttribute('minlength', '8');
    fireEvent.change(password, { target: { value: 'pinecone' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() =>
      expect(registerUser).toHaveBeenCalledWith({
        email: 'local@example.test',
        fullName: 'Local User',
        password: 'pinecone',
      })
    );
  });
});
