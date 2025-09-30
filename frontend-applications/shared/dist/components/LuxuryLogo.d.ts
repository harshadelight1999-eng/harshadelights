interface LuxuryLogoProps {
    variant?: 'elegant' | 'elegantAlt';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    style?: 'default' | 'glow' | 'float' | 'shimmer';
    href?: string;
    className?: string;
    priority?: boolean;
}
export default function LuxuryLogo({ variant, size, style, href, className, priority }: LuxuryLogoProps): import("react/jsx-runtime").JSX.Element;
export declare const LogoVariants: {
    Header: (props: Partial<LuxuryLogoProps>) => import("react/jsx-runtime").JSX.Element;
    Hero: (props: Partial<LuxuryLogoProps>) => import("react/jsx-runtime").JSX.Element;
    Footer: (props: Partial<LuxuryLogoProps>) => import("react/jsx-runtime").JSX.Element;
    Loading: (props: Partial<LuxuryLogoProps>) => import("react/jsx-runtime").JSX.Element;
    Card: (props: Partial<LuxuryLogoProps>) => import("react/jsx-runtime").JSX.Element;
};
export {};
//# sourceMappingURL=LuxuryLogo.d.ts.map