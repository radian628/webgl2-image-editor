import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import "./Close.css";

export function CloseButtonGeneric(props: {
  onClick: () => void;
  className: string;
}) {
  return (
    <button onClick={props.onClick} className={props.className}>
      <CloseIcon></CloseIcon>
    </button>
  );
}

export function CloseButtonNoBackground(props: { onClick: () => void }) {
  return (
    <CloseButtonGeneric
      className="close-button-no-background"
      onClick={props.onClick}
    ></CloseButtonGeneric>
  );
}
