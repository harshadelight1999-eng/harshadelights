import React, { InputHTMLAttributes } from "react";
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    helper?: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export interface InputGroupProps {
    className?: string;
    children: React.ReactNode;
    error?: string;
    label?: string;
}
export interface InputGroupTextProps {
    className?: string;
    children: React.ReactNode;
}
declare const InputGroup: {
    ({ className, children, error, label }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
    Text: ({ className, children }: InputGroupTextProps) => import("react/jsx-runtime").JSX.Element;
    Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
};
export { Input, InputGroup };
//# sourceMappingURL=Input.d.ts.map