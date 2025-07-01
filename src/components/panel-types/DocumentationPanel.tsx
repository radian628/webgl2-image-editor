import React, { createContext, JSX, useContext } from "react";
import { PanelContentsItem, PanelType } from "./PanelSelector";

export const DocumentationContext = createContext<
  | {
      documentation: {
        component: () => JSX.Element;
      };
      setDocumentation: (docs: { component: () => JSX.Element }) => void;
    }
  | undefined
>(undefined);

export function useDocumentation() {
  const { documentation, setDocumentation } = useContext(DocumentationContext)!;
  return [documentation, setDocumentation] as const;
}

export function DocumentationPanel(props: {
  data: PanelType<"documentation">;
  setData: (d: (d: PanelContentsItem) => PanelContentsItem) => void;
}) {
  const [Documentation] = useDocumentation();

  return (
    <div>
      <Documentation.component></Documentation.component>
    </div>
  );
}
