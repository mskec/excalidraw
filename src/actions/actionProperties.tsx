import React from "react";
import { Action } from "./types";
import { ExcalidrawElement, ExcalidrawTextElement } from "../element/types";
import { getCommonAttributeOfSelectedElements } from "../scene";
import { ButtonSelect } from "../components/ButtonSelect";
import { isTextElement, redrawTextBoundingBox } from "../element";
import { ColorPicker } from "../components/ColorPicker";
import { AppState } from "../../src/types";

const changeProperty = (
  elements: readonly ExcalidrawElement[],
  callback: (element: ExcalidrawElement) => ExcalidrawElement
) => {
  return elements.map(element => {
    if (element.isSelected) {
      return callback(element);
    }
    return element;
  });
};

const getFormValue = function<T>(
  editingElement: AppState["editingElement"],
  elements: readonly ExcalidrawElement[],
  getAttribute: (element: ExcalidrawElement) => T,
  defaultValue?: T
): T | null {
  return (
    (editingElement && getAttribute(editingElement)) ??
    getCommonAttributeOfSelectedElements(elements, getAttribute) ??
    defaultValue ??
    null
  );
};

const DimensionInput = function({
  selectedElements,
  label,
  prop,
  onChange
}: {
  selectedElements: ExcalidrawElement[];
  label: string;
  prop: "x" | "y" | "width" | "height";
  onChange: (formData: any) => void;
}) {
  return (
    <div>
      {label}:
      <input
        style={{ width: 40 }}
        type="number"
        value={selectedElements.length !== 1 ? "" : selectedElements[0][prop]}
        onChange={e => {
          const int = !e.target.value ? 0 : parseInt(e.target.value, 10);
          return onChange({
            [prop]: Number.isNaN(int) ? null : int ?? selectedElements[0][prop]
          });
        }}
        disabled={selectedElements.length !== 1}
      />
    </div>
  );
};

export const actionChangeDimensions: Action = {
  name: "changeDimensions",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        ...value,
        shape: "width" in value || "height" in value ? null : el.shape
      }))
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => {
    const selectedElements = elements.filter(
      el => el.type !== "selection" && el.isSelected
    );
    return (
      <>
        <h5>Dimensions</h5>
        <div style={{ display: "flex" }}>
          <DimensionInput
            selectedElements={selectedElements}
            label="X"
            prop="x"
            onChange={updateData}
          />
          <DimensionInput
            selectedElements={selectedElements}
            label="Y"
            prop="y"
            onChange={updateData}
          />
        </div>
        <div style={{ display: "flex" }}>
          <DimensionInput
            selectedElements={selectedElements}
            label="Width"
            prop="width"
            onChange={updateData}
          />
          <DimensionInput
            selectedElements={selectedElements}
            label="Height"
            prop="height"
            onChange={updateData}
          />
        </div>
      </>
    );
  }
};

export const actionChangeStrokeColor: Action = {
  name: "changeStrokeColor",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        strokeColor: value
      })),
      appState: { ...appState, currentItemStrokeColor: value }
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.stroke")}</h5>
      <ColorPicker
        type="elementStroke"
        color={getFormValue(
          appState.editingElement,
          elements,
          element => element.strokeColor,
          appState.currentItemStrokeColor
        )}
        onChange={updateData}
      />
    </>
  )
};

export const actionChangeBackgroundColor: Action = {
  name: "changeBackgroundColor",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        backgroundColor: value
      })),
      appState: { ...appState, currentItemBackgroundColor: value }
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.background")}</h5>
      <ColorPicker
        type="elementBackground"
        color={getFormValue(
          appState.editingElement,
          elements,
          element => element.backgroundColor,
          appState.currentItemBackgroundColor
        )}
        onChange={updateData}
      />
    </>
  )
};

export const actionChangeFillStyle: Action = {
  name: "changeFillStyle",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        fillStyle: value
      }))
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.fill")}</h5>
      <ButtonSelect
        options={[
          { value: "solid", text: t("labels.solid") },
          { value: "hachure", text: t("labels.hachure") },
          { value: "cross-hatch", text: t("labels.crossHatch") }
        ]}
        value={getFormValue(
          appState.editingElement,
          elements,
          element => element.fillStyle
        )}
        onChange={value => {
          updateData(value);
        }}
      />
    </>
  )
};

export const actionChangeStrokeWidth: Action = {
  name: "changeStrokeWidth",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        strokeWidth: value
      }))
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.strokeWidth")}</h5>
      <ButtonSelect
        options={[
          { value: 1, text: t("labels.thin") },
          { value: 2, text: t("labels.bold") },
          { value: 4, text: t("labels.extraBold") }
        ]}
        value={getFormValue(
          appState.editingElement,
          elements,
          element => element.strokeWidth
        )}
        onChange={value => updateData(value)}
      />
    </>
  )
};

export const actionChangeSloppiness: Action = {
  name: "changeSloppiness",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        roughness: value
      }))
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.sloppiness")}</h5>
      <ButtonSelect
        options={[
          { value: 0, text: t("labels.architect") },
          { value: 1, text: t("labels.artist") },
          { value: 3, text: t("labels.cartoonist") }
        ]}
        value={getFormValue(
          appState.editingElement,
          elements,
          element => element.roughness
        )}
        onChange={value => updateData(value)}
      />
    </>
  )
};

export const actionChangeOpacity: Action = {
  name: "changeOpacity",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => ({
        ...el,
        shape: null,
        opacity: value
      }))
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.opacity")}</h5>
      <input
        type="range"
        min="0"
        max="100"
        onChange={e => updateData(+e.target.value)}
        value={
          getFormValue(
            appState.editingElement,
            elements,
            element => element.opacity,
            100 /* default opacity */
          ) ?? undefined
        }
      />
    </>
  )
};

export const actionChangeFontSize: Action = {
  name: "changeFontSize",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => {
        if (isTextElement(el)) {
          const element: ExcalidrawTextElement = {
            ...el,
            shape: null,
            font: `${value}px ${el.font.split("px ")[1]}`
          };
          redrawTextBoundingBox(element);
          return element;
        }

        return el;
      })
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.fontSize")}</h5>
      <ButtonSelect
        options={[
          { value: 16, text: t("labels.small") },
          { value: 20, text: t("labels.medium") },
          { value: 28, text: t("labels.large") },
          { value: 36, text: t("labels.veryLarge") }
        ]}
        value={getFormValue(
          appState.editingElement,
          elements,
          element => isTextElement(element) && +element.font.split("px ")[0]
        )}
        onChange={value => updateData(value)}
      />
    </>
  )
};

export const actionChangeFontFamily: Action = {
  name: "changeFontFamily",
  perform: (elements, appState, value) => {
    return {
      elements: changeProperty(elements, el => {
        if (isTextElement(el)) {
          const element: ExcalidrawTextElement = {
            ...el,
            shape: null,
            font: `${el.font.split("px ")[0]}px ${value}`
          };
          redrawTextBoundingBox(element);
          return element;
        }

        return el;
      })
    };
  },
  PanelComponent: ({ elements, appState, updateData, t }) => (
    <>
      <h5>{t("labels.fontFamily")}</h5>
      <ButtonSelect
        options={[
          { value: "Virgil", text: t("labels.handDrawn") },
          { value: "Helvetica", text: t("labels.normal") },
          { value: "Cascadia", text: t("labels.code") }
        ]}
        value={getFormValue(
          appState.editingElement,
          elements,
          element => isTextElement(element) && element.font.split("px ")[1]
        )}
        onChange={value => updateData(value)}
      />
    </>
  )
};
