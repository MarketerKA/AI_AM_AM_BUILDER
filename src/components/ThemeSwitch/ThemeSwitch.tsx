import { useTheme } from '@/contexts/ThemeContext';
import styles from './ThemeSwitch.module.scss';

export const ThemeSwitch = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button className={styles.themeSwitch} onClick={toggleTheme}>
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};
