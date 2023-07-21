import { css } from "@emotion/css";
import React, { ReactElement } from "react";

import { GrafanaTheme2 } from "@grafana/data";
import { FieldSet } from "@grafana/ui";
import { useStyles } from "../../../theme";

export interface StepProps {
  title: string;
  stepNo: number;
  description?: string | ReactElement;
}

export const Step = ({
  title,
  stepNo,
  children,
  description,
}: React.PropsWithChildren<StepProps>) => {
  const styles = useStyles(getStyles);

  return (
    <div className={styles.parent}>
      <div>
        <span className={styles.stepNo}>{stepNo}</span>
      </div>
      <div className={styles.content}>
        <FieldSet label={title} className={styles.fieldset}>
          {description && (
            <div className={styles.description}>{description}</div>
          )}
          {children}
        </FieldSet>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  fieldset: css`
    legend {
      font-size: 16px;
      padding-top: ${theme.spacing(0.5)};
    }
  `,
  parent: css`
    display: flex;
    flex-direction: row;
    max-width: ${theme.breakpoints.values.xl};
    & + & {
      margin-top: ${theme.spacing(4)};
    }
  `,
  description: css`
    margin-top: -${theme.spacing(2)};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing(2)};
  `,
  stepNo: css`
    display: inline-block;
    width: ${theme.spacing(4)};
    height: ${theme.spacing(4)};
    line-height: ${theme.spacing(4)};
    border-radius: ${theme.shape.radius.circle};
    text-align: center;
    color: ${theme.colors.text.maxContrast};
    background-color: ${theme.colors.background.canvas};
    font-size: ${theme.typography.size.lg};
    margin-right: ${theme.spacing(2)};
  `,
  content: css`
    flex: 1;
  `,
});
