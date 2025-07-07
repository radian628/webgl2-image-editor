import React, { useEffect } from "react";
import { useState } from "react";

type NumberInputProps = {
  setValue: (x: number) => void;
  value: number;
  options: {
    stepSize: number;
    min: number;
    max: number;
    sensitivity: number;
  };
};

export function NumberField(props: NumberInputProps) {
  let [isMouseDown, setIsMouseDown] = useState(false);
  let [prevNumber, setPrevNumber] = useState(0);
  let [deltaX, setDeltaX] = useState(0);

  const input = (
    <input
      className="number-field"
      onMouseDown={(e) => {
        e.currentTarget.requestPointerLock();
        setIsMouseDown(true);
        setDeltaX(0);
        setPrevNumber(props.value);
      }}
      onChange={(e) => {
        setNumber(Number(e.currentTarget.value));
      }}
      type="number"
      value={(props.value.toPrecision(14) as unknown as number) / 1}
    ></input>
  );

  useEffect(() => {
    let mouseUpListener = (e: MouseEvent) => {
      document.exitPointerLock();
      setIsMouseDown(false);
    };

    let mouseMoveListener = (e: MouseEvent) => {
      if (isMouseDown) {
        setDeltaX(deltaX + e.movementX * props.options.sensitivity);
        const num =
          Math.floor((prevNumber + deltaX) / props.options.stepSize) *
          props.options.stepSize;
        setNumber(num);
      }
    };

    document.addEventListener("mouseup", mouseUpListener);
    document.addEventListener("mousemove", mouseMoveListener);

    return () => {
      document.removeEventListener("mouseup", mouseUpListener);
      document.removeEventListener("mousemove", mouseMoveListener);
    };
  });

  function setNumber(num: number) {
    props.setValue(
      Math.max(Math.min(num, props.options.max), props.options.min)
    );
  }

  return input;
}
