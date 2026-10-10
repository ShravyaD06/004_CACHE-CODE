import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <span className="tooltip-host">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        aria-describedby="theme-tooltip"
        className="theme-toggle"
        onClick={toggleTheme}
      >
        <Sun size={15} aria-hidden="true" className="theme-toggle__icon" />
        <span className="theme-toggle__thumb" aria-hidden="true" />
        <Moon size={15} aria-hidden="true" className="theme-toggle__icon" />
      </button>
      <span id="theme-tooltip" role="tooltip" className="tooltip">
        {label}
      </span>
    </span>
  );
}
