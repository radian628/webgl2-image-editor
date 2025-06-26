import React, {
  createContext,
  createRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { JSX } from "react";
import "./Panels.css";
import { lens } from "../../utils/lens";

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

export type PanelComponentProps<T> = {
  data: T;
  setData: (d: T) => void;
  panels: PanelLayoutData<T>;
  setPanels: (f: (p: PanelLayoutData<T>) => PanelLayoutData<T>) => void;
  index: number;
  inVertical: boolean;
};

export type PanelComponent<T> = (props: PanelComponentProps<T>) => JSX.Element;

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

function killSinglets<T>(data: PanelLayoutData<T>): PanelLayoutData<T> {
  return data.map((d) =>
    d.variant.type === "nested"
      ? d.variant.subpanels.length === 1
        ? lens(killSinglets(d.variant.subpanels)[0]).proportion.$(
            (n) => d.proportion
          )
        : {
            ...d,
            variant: {
              ...d.variant,
              subpanels: killSinglets(d.variant.subpanels),
            },
          }
      : d
  );
}

export const PanelDragContext = createContext<{
  dragItem: PanelLayoutDataItem<any> | undefined;
  setDragItem: (
    fn: (
      p: PanelLayoutDataItem<any> | undefined
    ) => PanelLayoutDataItem<any> | undefined
  ) => void;
}>(undefined as any);

export function usePanelDragContext<T>(): [
  PanelLayoutDataItem<T> | undefined,
  (
    fn: (
      p: PanelLayoutDataItem<T> | undefined
    ) => PanelLayoutDataItem<T> | undefined
  ) => void
] {
  const { dragItem, setDragItem } = useContext(PanelDragContext);
  return [dragItem, setDragItem] as const;
}

export function RootPanelLayout<T>(props: {
  panels: PanelLayoutData<T>;
  setPanels: React.Dispatch<React.SetStateAction<PanelLayoutData<T>>>;
  panelComponent: PanelComponent<T>;
  vertical: boolean;
  defaultEmptyConfiguration: PanelLayoutData<T>;
}) {
  const [dragItem, setDragItem] = useState<PanelLayoutDataItem<T> | undefined>(
    undefined
  );

  const dragGhostRef = createRef<HTMLDivElement>();

  useEffect(() => {
    console.log("got here", dragItem);
    if (dragItem) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }

    if (dragGhostRef.current) {
      const dragGhost = dragGhostRef.current;
      const listener = (e: MouseEvent) => {
        dragGhost.style.left = `${e.clientX + 20}px`;
        dragGhost.style.top = `${e.clientY}px`;
      };
      document.addEventListener("mousemove", listener);
      return () => document.removeEventListener("mousemove", listener);
    }
  }, [dragItem]);

  return (
    <PanelDragContext.Provider value={{ dragItem, setDragItem }}>
      <PanelLayout
        panels={props.panels}
        setPanels={(cb) => {
          const panels = killSinglets(cb(props.panels));
          props.setPanels(
            panels.length === 0 ? props.defaultEmptyConfiguration : panels
          );
        }}
        panelComponent={props.panelComponent}
        vertical={props.vertical}
      ></PanelLayout>
      {dragItem && (
        <div className="drag-ghost" ref={dragGhostRef}>
          Dragging Panel
        </div>
      )}
    </PanelDragContext.Provider>
  );
}
