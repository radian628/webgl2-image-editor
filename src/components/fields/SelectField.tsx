import React, { useMemo } from "react";
import { JSX } from "react";
import "./SelectField.css";

export function SelectField<T extends string>(props: {
  value: T;
  setValue: (t: T) => void;
  // actual value, html value, display
  options: [T, JSX.Element | string][];
  showAll?: boolean;
}) {
  if (props.showAll) {
    return (
      <div className="show-all-select-field">
        {props.options.map(([value, display]) => (
          <button
            onClick={(e) => {
              props.setValue(value);
            }}
            className={props.value === value ? "selected" : ""}
          >
            {display}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={props.value}
      onChange={(e) => {
        props.setValue(e.currentTarget.value as T);
      }}
    >
      {props.options.map(([value, display]) => (
        <option key={value} value={value}>
          {display}
        </option>
      ))}
    </select>
  );
}
