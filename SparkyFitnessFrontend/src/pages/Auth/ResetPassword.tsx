import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { usePreferences } from '@/contexts/PreferencesContext';
import { debug, info } from '@/utils/logging';
import useToggle from '@/hooks/use-toggle';
import PasswordToggle from '@/components/PasswordToggle';
import { useResetPasswordMutation } from '@/hooks/Auth/useAuth';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { loggingLevel } = usePreferences();
  debug(loggingLevel, 'ResetPassword: Component rendered.');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isToggled: showPassword, toggleHandler: passwordToggleHandler } =
    useToggle();
  const { mutateAsync: resetPassword } = useResetPasswordMutation();

  const token = searchParams.get('token');
  const passwordsMatch = newPassword === confirmPassword;
  const missingTokenMessage = t(
    'auth.resetPassword.invalidOrMissingPasswordReset',
    'Invalid or missing password reset token.'
  );

  useEffect(() => {
    if (!token) {
      setMessage(missingTokenMessage);
      toast({
        title: t('common.error', 'Error'),
        description: missingTokenMessage,
        variant: 'destructive',
      });
    }
  }, [token, t, missingTokenMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !passwordsMatch) return;
    info(loggingLevel, 'ResetPassword: Attempting to reset password.');
    setLoading(true);
    setMessage('');

    try {
      await resetPassword({ token, newPassword });
      navigate('/'); // Redirect to root
    } catch {
      setMessage(t('auth.passwordResetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-gray-">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/images/SparkyFitness.webp"
              alt={t(
                'auth.resetPassword.sparkyFitnessLogo',
                'SparkyFitness Logo'
              )}
              className="h-10 w-10 mr-2"
            />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-300">
              SparkyFitness
            </CardTitle>
          </div>
          <CardDescription>
            {t(
              'auth.resetPassword.setYourNewPassword',
              'Set your new password.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="new-password">
                {t('auth.resetPassword.newPassword', 'New Password')}
              </Label>
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t(
                  'auth.resetPassword.enterNewPassword',
                  'Enter new password'
                )}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                aria-describedby="reset-password-hint"
                autoComplete="new-password"
              />
              <PasswordToggle
                showPassword={showPassword}
                passwordToggleHandler={passwordToggleHandler}
              />
              <p
                id="reset-password-hint"
                className="text-sm text-muted-foreground"
              >
                {t('settings.accountSecurity.passwordLengthError')}
              </p>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirm-password">
                {t(
                  'auth.resetPassword.confirmNewPassword',
                  'Confirm New Password'
                )}
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t(
                  'auth.resetPassword.confirmNewPassword2',
                  'Confirm new password'
                )}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <PasswordToggle
                showPassword={showPassword}
                passwordToggleHandler={passwordToggleHandler}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-sm">
                  {t('settings.accountSecurity.newPasswordsDoNotMatch')}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token || !passwordsMatch}
            >
              {loading
                ? t('auth.resetPassword.resetting', 'Resetting...')
                : t('auth.resetPassword.resetPassword', 'Reset Password')}
            </Button>
            {message && (
              <p className="text-center text-sm text-muted-foreground">
                {message}
              </p>
            )}
            <div className="text-center text-sm">
              <a href="/" className="font-medium text-primary hover:underline">
                {t('auth.resetPassword.backToSignIn', 'Back to Sign In')}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
