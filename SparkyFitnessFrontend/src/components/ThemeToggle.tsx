import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return t('themeToggle.light', 'Light mode');
      case 'dark':
        return t('themeToggle.dark', 'Dark mode');
      case 'system':
        return t('themeToggle.system', 'System theme');
    }
  };

  const label = getLabel();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      title={label}
    >
      {getIcon()}
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export default ThemeToggle;
