interface LuxuryHeroProps {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    autoRotateBackground?: boolean;
    rotationInterval?: number;
    className?: string;
}
export default function LuxuryHero({ title, subtitle, description, primaryCTA, secondaryCTA, autoRotateBackground, rotationInterval, className }: LuxuryHeroProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=LuxuryHero.d.ts.map