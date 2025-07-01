import { JSX, useState } from "react";
import {
  PanelLayoutData,
  PanelLayoutDataItem,
  RootPanelLayout,
} from "./panel-layout/Panels";
import { PanelContents, PanelContentsItem } from "./panel-types/PanelSelector";
import React from "react";
import { v4 } from "uuid";
import { Panel } from "./panel-types/Panel";
import { DocumentationContext } from "./panel-types/DocumentationPanel";

export type ImageEditorDragState =
  | {
      type: "panel";
      panel: PanelLayoutDataItem<PanelContents>;
    }
  | {
      type: "item";
      item: PanelContentsItem;
    };

export function ImageEditorPanels() {
  const [panels, setPanels] = useState<PanelLayoutData<PanelContents>>([
    {
      proportion: 1,
      variant: {
        type: "data",
        data: { items: [{ type: "none", id: v4() }], openIndex: 0 },
      },
      id: "a",
    },
  ]);

  const dragToPanel = (
    d: ImageEditorDragState
  ): PanelLayoutDataItem<PanelContents> =>
    d.type === "panel"
      ? d.panel
      : {
          id: v4(),
          proportion: 1,
          variant: {
            type: "data",
            data: {
              items: [d.item],
              openIndex: 0,
            },
          },
        };

  const [documentation, setDocumentation] = useState<{
    component: () => JSX.Element;
  }>({
    component: () => <></>,
  });

  return (
    <DocumentationContext.Provider value={{ documentation, setDocumentation }}>
      <RootPanelLayout
        panels={panels}
        setPanels={setPanels}
        panelComponent={Panel}
        vertical={false}
        defaultEmptyConfiguration={[
          {
            proportion: 1,
            variant: {
              type: "data",
              data: { items: [{ type: "none", id: v4() }], openIndex: 0 },
            },
            id: v4(),
          },
        ]}
        panelToDrag={(p) =>
          ({ type: "panel", panel: p }) as ImageEditorDragState
        }
        dragToPanel={dragToPanel}
        mergePanelWithDrag={(
          panel,
          drag
        ): PanelLayoutDataItem<PanelContents> => {
          if (drag.type === "panel" || panel.variant.type === "nested") {
            return dragToPanel(drag);
          } else {
            const newItems = [...panel.variant.data.items];
            newItems.splice(panel.variant.data.openIndex, 0, drag.item);
            return {
              proportion: 1,
              id: v4(),
              variant: {
                type: "data",
                data: {
                  items: newItems,
                  openIndex: panel.variant.data.openIndex,
                },
              },
            };
          }
        }}
      ></RootPanelLayout>
    </DocumentationContext.Provider>
  );
}
