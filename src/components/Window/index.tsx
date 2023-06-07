import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { PropsWithChildren } from 'react';

import { useStyles } from '../../theme';

const Window = (props: PropsWithChildren<{}>) => {
  const styles = useStyles(getStyles);

  return (
    <div className={styles.container}>
      <div className={styles.contents}>{props.children}</div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      height: 80vh;
      width: 100%;
      padding-top: 20px;
      display: flex;
      justify-content: center;
    `,
    contents: css`
      height: 80vh;
      width: 80vw;
      margin: 1vh 1vw;
      padding: 10px;
      border: rgba(204, 204, 220, 0.07) solid 1px;
      border-radius: 2px;
      background-color: ${theme.colors.background.secondary};
    `,
  };
};

export default Window;
