import { css, cx } from "@emotion/css";
import React, { ReactNode } from "react";

import { GrafanaTheme2, IconName } from "@grafana/data";
import { Card, Icon } from "@grafana/ui";
import { useStyles } from "../../../../theme";
import { DestinationFormType } from "../../types/destination";

interface Props extends SharedProps {
  icon: IconName;
  name: string;
  description: ReactNode;
  value: DestinationFormType;
}

export interface SharedProps {
  selected?: boolean;
  disabled?: boolean;
  onClick: (value: DestinationFormType) => void;
}

const DestinationType = (props: Props) => {
  const {
    name,
    description,
    icon,
    selected = false,
    value,
    onClick,
    disabled = false,
  } = props;
  const styles = useStyles(getStyles);

  const cardStyles = cx({
    [styles.wrapper]: true,
    [styles.disabled]: disabled,
  });

  return (
    <Card
      className={cardStyles}
      isSelected={selected}
      onClick={() => onClick(value)}
      disabled={disabled}
    >
      <Card.Figure>
        <Icon size="xxxl" name={icon} />
      </Card.Figure>
      <Card.Heading>{name}</Card.Heading>
      <Card.Description>{description}</Card.Description>
    </Card>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css`
    width: 380px !important;
    cursor: pointer;
    user-select: none;
  `,
  disabled: css`
    opacity: 0.5;
  `,
});

export { DestinationType };
