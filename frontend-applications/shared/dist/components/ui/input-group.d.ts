import React, { InputHTMLAttributes } from "react";
type InputGroupProps = {
    className?: string;
    children: React.ReactNode;
};
type InputTextProps = InputHTMLAttributes<HTMLInputElement>;
declare const InputGroup: {
    ({ className, children }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
    Text: ({ className, children }: InputGroupProps) => import("react/jsx-runtime").JSX.Element;
    Input: React.ForwardRefExoticComponent<InputTextProps & React.RefAttributes<HTMLInputElement>>;
};
export default InputGroup;
//# sourceMappingURL=input-group.d.ts.map