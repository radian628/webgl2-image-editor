import React, { useState } from "react";
import { PanelLayoutData, PanelLayoutDataItem } from "./Panels";
import { v4 } from "uuid";
import "./PanelMenu.css";

export function PanelMenu<T>(props: {
  index: number;
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  inVertical: boolean;
  newPanelState: T;
}) {
  const [state, setState] = useState<"normal" | "open">("normal");

  function splitSameAxis(right: boolean) {
    const proportion = props.panels[props.index].proportion;
    const panels2 = [...props.panels];
    const newItems: PanelLayoutData<T> = [
      {
        variant: {
          type: "data",
          data: props.newPanelState,
        },
        id: v4(),
        proportion: proportion / 2,
      },
      {
        ...props.panels[props.index],
        proportion: proportion / 2,
      },
    ];
    if (right) newItems.reverse();
    panels2.splice(props.index, 1, ...newItems);
    props.setPanels((panels) => panels2);
  }

  function splitDiffAxis(right: boolean) {
    const panels2 = [...props.panels];
    const newPanelItem = {
      id: v4(),
      proportion: props.panels[props.index].proportion,
      variant: {
        type: "nested",
        subpanels: [
          {
            variant: {
              type: "data",
              data: props.newPanelState,
            },
            id: v4(),
            proportion: 0.5,
          },
          {
            ...props.panels[props.index],
            proportion: 0.5,
          },
        ],
      },
    } satisfies PanelLayoutDataItem<T>;
    if (right) newPanelItem.variant.subpanels.reverse();
    panels2.splice(props.index, 1, newPanelItem);
    props.setPanels((panels) => panels2);
  }

  if (state === "open") {
    return (
      <div className="open-panel-menu">
        <button
          className="close-button"
          onClick={(e) => {
            setState("normal");
          }}
        >
          -
        </button>
        <button
          className="left-button"
          onClick={() => {
            (props.inVertical ? splitDiffAxis : splitSameAxis)(false);
            setState("normal");
          }}
        >
          Left
        </button>
        <button
          className="right-button"
          onClick={() => {
            (props.inVertical ? splitDiffAxis : splitSameAxis)(true);
            setState("normal");
          }}
        >
          Right
        </button>
        <button
          className="up-button"
          onClick={() => {
            (!props.inVertical ? splitDiffAxis : splitSameAxis)(false);
            setState("normal");
          }}
        >
          Up
        </button>
        <button
          className="down-button"
          onClick={() => {
            (!props.inVertical ? splitDiffAxis : splitSameAxis)(true);
            setState("normal");
          }}
        >
          Down
        </button>
      </div>
    );
  }

  return (
    <div className="panel-menu">
      <button
        onClick={(e) => {
          setState("open");
        }}
      >
        +
      </button>
    </div>
  );
}
