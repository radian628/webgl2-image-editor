import React, { useEffect, useRef, useState } from "react";
import { JSX } from "react";
import "./Panels.css";

export type PanelLayoutDataItem<T> = {
  proportion: number;
  variant:
    | {
        type: "data";
        data: T;
      }
    | {
        type: "nested";
        subpanels: PanelLayoutData<T>;
      };
  id: string;
};

export type PanelLayoutData<T> = PanelLayoutDataItem<T>[];

export type PanelComponent<T> = (props: {
  data: T;
  setData: (d: T) => void;
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  index: number;
  inVertical: boolean;
}) => JSX.Element;

function PanelLayoutItem<T>(props: {
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  panelComponent: PanelComponent<T>;
  vertical: boolean;
  index: number;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const tempDeltaRef = useRef(0);
  const oldProportionRef = useRef(0);
  const oldProportionRefPrev = useRef(0);

  const rootRect = props.rootRef.current?.getBoundingClientRect();
  const rootLength =
    (props.vertical ? rootRect?.height : rootRect?.width) ?? 100;

  useEffect(() => {
    if (isDragging) {
      const mouseupListener = (e: MouseEvent) => {
        setIsDragging(false);
      };
      const mousemoveListener = (e: MouseEvent) => {
        const deltaInPixels = props.vertical ? e.movementY : e.movementX;
        let delta = deltaInPixels / rootLength;
        tempDeltaRef.current += delta;
        props.setPanels((panels) => {
          // if (
          //   panels[i].proportion + delta < 0 ||
          //   panels[i + 1].proportion - delta < 0
          // ) {
          //   accumulatedDelta.current += delta;
          //   delta = 0;
          //   console.log(accumulatedDelta.current);
          // }

          let totalDelta = Math.min(
            Math.max(tempDeltaRef.current, -oldProportionRefPrev.current),
            oldProportionRef.current
          );

          return panels.map((p, j) => {
            if (j === i) {
              return {
                ...p,
                proportion: oldProportionRefPrev.current + totalDelta,
              };
            } else if (j === i + 1) {
              return {
                ...p,
                proportion: oldProportionRef.current - totalDelta,
              };
            } else {
              return p;
            }
          });
        });
      };
      document.addEventListener("mouseup", mouseupListener);
      document.addEventListener("mousemove", mousemoveListener);
      return () => {
        document.removeEventListener("mouseup", mouseupListener);
        document.removeEventListener("mousemove", mousemoveListener);
      };
    }
  }, [isDragging]);

  const i = props.index;
  const p = props.panels[i];
  return (
    <div
      className="panel"
      style={{
        [props.vertical ? "height" : "width"]: `${p.proportion * 100}%`,
      }}
    >
      {p.variant.type === "data" ? (
        <props.panelComponent
          inVertical={props.vertical}
          index={i}
          panels={props.panels}
          setPanels={props.setPanels}
          data={p.variant.data}
          setData={(d) =>
            props.setPanels((panels) =>
              panels.map((p2, j) =>
                j === i
                  ? {
                      ...p2,
                      variant: {
                        ...p2.variant,
                        data: d,
                      },
                    }
                  : p2
              )
            )
          }
        ></props.panelComponent>
      ) : (
        <PanelLayout
          panels={p.variant.subpanels}
          setPanels={(d) =>
            props.setPanels((panels) =>
              panels.map((p2, j) =>
                j === i
                  ? {
                      ...p2,
                      variant: {
                        type: "nested",
                        subpanels: d(
                          (p2.variant.type === "nested"
                            ? p2.variant.subpanels
                            : undefined)!
                        ),
                      },
                    }
                  : p2
              )
            )
          }
          panelComponent={props.panelComponent}
          vertical={!props.vertical}
        ></PanelLayout>
      )}
      {i !== props.panels.length - 1 && (
        <div
          className="panel-dragger"
          onMouseDown={(e) => {
            oldProportionRef.current = props.panels[props.index + 1].proportion;
            oldProportionRefPrev.current = props.panels[props.index].proportion;
            tempDeltaRef.current = 0;
            setIsDragging(true);
          }}
        ></div>
      )}
    </div>
  );
}

function PanelLayout<T>(props: {
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  panelComponent: PanelComponent<T>;
  vertical: boolean;
}) {
  const panelRootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={panelRootRef}
      className={
        "panel-set " +
        (props.vertical ? "panel-set-vertical" : "panel-set-horizontal")
      }
    >
      {props.panels.map((p, i) => (
        <PanelLayoutItem
          key={p.id}
          {...props}
          index={i}
          rootRef={panelRootRef}
        ></PanelLayoutItem>
      ))}
    </div>
  );
}

export function RootPanelLayout<T>(props: {
  panels: PanelLayoutData<T>;
  setPanels: React.Dispatch<React.SetStateAction<PanelLayoutData<T>>>;
  panelComponent: PanelComponent<T>;
  vertical: boolean;
}) {
  return <PanelLayout {...props}></PanelLayout>;
}
