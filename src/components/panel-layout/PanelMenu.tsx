import React, { useState } from "react";
import {
  PanelLayoutData,
  PanelLayoutDataItem,
  usePanelDragContext,
} from "./Panels";
import { v4 } from "uuid";
import "./PanelMenu.css";
import { lens } from "../../utils/lens";

export function PanelMenu<T>(props: {
  index: number;
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  inVertical: boolean;
  newPanelState: T;
}) {
  const [state, setState] = useState<"normal" | "open">("normal");

  const [dragItem, setDragItem] = usePanelDragContext<T>();

  function splitSameAxis(right: boolean, newItemData?: PanelLayoutDataItem<T>) {
    const proportion = props.panels[props.index].proportion;
    const panels2 = [...props.panels];
    const newItems: PanelLayoutData<T> = [
      newItemData
        ? {
            ...newItemData,
            id: v4(),
            proportion: proportion / 2,
          }
        : {
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

  function splitDiffAxis(right: boolean, newItemData?: PanelLayoutDataItem<T>) {
    const panels2 = [...props.panels];
    const newPanelItem = {
      id: v4(),
      proportion: props.panels[props.index].proportion,
      variant: {
        type: "nested",
        subpanels: [
          newItemData
            ? {
                ...newItemData,
                id: v4(),
                proportion: 0.5,
              }
            : {
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

  if (dragItem) {
    return (
      <div className="drag-menu">
        <div
          className="drag-target drag-target-left"
          onMouseUp={(e) => {
            (props.inVertical ? splitDiffAxis : splitSameAxis)(false, dragItem);
            setDragItem((p) => undefined);
          }}
        ></div>
        <div
          className="drag-target drag-target-right"
          onMouseUp={(e) => {
            (props.inVertical ? splitDiffAxis : splitSameAxis)(true, dragItem);
            setDragItem((p) => undefined);
          }}
        ></div>
        <div
          className="drag-target drag-target-up"
          onMouseUp={(e) => {
            (!props.inVertical ? splitDiffAxis : splitSameAxis)(
              false,
              dragItem
            );
            setDragItem((p) => undefined);
          }}
        ></div>
        <div
          className="drag-target drag-target-down"
          onMouseUp={(e) => {
            (!props.inVertical ? splitDiffAxis : splitSameAxis)(true, dragItem);
            setDragItem((p) => undefined);
          }}
        ></div>
      </div>
    );
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

  function exit() {
    const panels2 = [...props.panels];
    panels2.splice(props.index, 1);
    const sum = panels2.reduce((prev, curr) => prev + curr.proportion, 0);
    props.setPanels((panels) =>
      panels2.map((p) => ({ ...p, proportion: p.proportion / sum }))
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
      <button
        className="exit-button"
        onClick={(e) => {
          exit();
        }}
      >
        X
      </button>
      <div
        className="drag-handle"
        onMouseDown={(e) => {
          setDragItem((p) => props.panels[props.index]);
          exit();
        }}
      >
        Drag
      </div>
    </div>
  );
}
