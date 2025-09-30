import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    min: number;
    max: number;
    step?: number;
    defaultValue?: [number, number];
    label?: string;
}
declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLSpanElement>>;
export { Slider };
//# sourceMappingURL=slider.d.ts.map