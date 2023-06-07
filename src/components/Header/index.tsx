import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

import { useStyles } from '../../theme';
import ThemeSwitch from './ThemeSwitch';

const Header = () => {
  const styles = useStyles(getStyles);
  return (
    <div className={styles.header}>
      <div className={styles.flex}>
        <img src={`${process.env.PUBLIC_URL}/grafana.svg`} alt={'Grafana logo'} className={styles.logo} />
        <h4 className={styles.headerText}>Agent Config Generator</h4>
      </div>
      <div className={styles.flex}>
        <ThemeSwitch className={styles.themeSwitch} />
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    flex: css`
      display: flex;
      align-items: center;

      & > * {
        margin-right: ${theme.spacing(2)};
      }
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      height: 60px;
      width: 100vw;
      padding: 10px 40px;
      border: 1px solid ${theme.colors.border.weak};
      border-radius: 2px;
      color: ${theme.colors.text.primary};
    `,
    headerText: css`
      margin-bottom: 0;
    `,
    themeSwitch: css`
      color: ${theme.colors.text.primary};
      cursor: pointer;
    `,
    logo: css`
      width: 20px;
      height: 20px;
      margin-right: 10px;
    `,
    icon: css`
      color: ${theme.colors.text.primary};
    `,
  };
};
export default Header;
