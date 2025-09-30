/**
 * Asset Management Utility for Harsha Delights
 * Centralized system for managing team-changeable assets
 */
export declare const backgrounds: {
    readonly hero: {
        readonly bg1: "/assets/branding/backgrounds/BG01.png";
        readonly bg2: "/assets/branding/backgrounds/BG-02.png";
        readonly bg3: "/assets/branding/backgrounds/BG-03.png";
        readonly bg4: "/assets/branding/backgrounds/BG-04.png";
        readonly bg5: "/assets/branding/backgrounds/BG-5.png";
        readonly bg6: "/assets/branding/backgrounds/BG-06.png";
        readonly bg7: "/assets/branding/backgrounds/BG-07.png";
    };
    readonly getRandomHero: () => "/assets/branding/backgrounds/BG01.png" | "/assets/branding/backgrounds/BG-02.png" | "/assets/branding/backgrounds/BG-03.png" | "/assets/branding/backgrounds/BG-04.png" | "/assets/branding/backgrounds/BG-5.png" | "/assets/branding/backgrounds/BG-06.png" | "/assets/branding/backgrounds/BG-07.png";
};
export declare const logos: {
    readonly elegant: "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png";
    readonly elegantAlt: "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png";
    readonly getDefault: () => "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png";
    readonly getVariant: (variant?: "elegant" | "elegantAlt") => "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png" | "/assets/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png";
};
export declare const products: {
    readonly confectionery: "/assets/products/confectionery";
    readonly seasonal: "/assets/products/seasonal";
    readonly premium: "/assets/products/premium";
    readonly categories: "/assets/products/categories";
    readonly getImagePath: (category: "confectionery" | "seasonal" | "premium" | "categories", filename: string) => string;
};
export declare const luxuryStyles: {
    readonly backgrounds: {
        readonly royalGradient: "bg-royal-gradient";
        readonly goldGradient: "bg-gold-gradient";
        readonly luxuryGradient: "bg-luxury-gradient";
        readonly hero: (bgNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7) => string;
    };
    readonly fonts: {
        readonly royal: "font-royal";
        readonly luxury: "font-luxury";
        readonly elegant: "font-elegant";
        readonly premium: "font-premium";
    };
    readonly animations: {
        readonly shimmer: "animate-royal-shimmer";
        readonly float: "animate-luxury-float";
        readonly glow: "animate-gold-glow";
        readonly pulse: "animate-royal-pulse";
    };
    readonly shadows: {
        readonly royal: "shadow-royal";
        readonly luxury: "shadow-luxury";
        readonly gold: "shadow-gold";
        readonly royalInset: "shadow-royal-inset";
    };
    readonly colors: {
        readonly royal: {
            readonly text: "text-royal-700";
            readonly bg: "bg-royal-500";
            readonly border: "border-royal-300";
        };
        readonly luxury: {
            readonly gold: {
                readonly text: "text-luxury-gold-700";
                readonly bg: "bg-luxury-gold-500";
                readonly border: "border-luxury-gold-300";
            };
            readonly burgundy: {
                readonly text: "text-luxury-burgundy-700";
                readonly bg: "bg-luxury-burgundy-500";
                readonly border: "border-luxury-burgundy-300";
            };
            readonly champagne: {
                readonly text: "text-luxury-champagne-700";
                readonly bg: "bg-luxury-champagne-500";
                readonly border: "border-luxury-champagne-300";
            };
        };
    };
};
export declare const cardStyles: {
    readonly luxury: "\n    bg-white/95 backdrop-blur-md \n    border border-royal-200/50 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-500\n    hover:scale-105 hover:border-luxury-gold-300/50\n  ";
    readonly royal: "\n    bg-gradient-to-br from-royal-50 to-royal-100 \n    border border-royal-300 \n    shadow-royal rounded-xl \n    hover:shadow-luxury transition-all duration-300\n  ";
    readonly gold: "\n    bg-gradient-to-br from-luxury-gold-50 to-luxury-champagne-50 \n    border border-luxury-gold-300 \n    shadow-gold rounded-xl \n    hover:animate-gold-glow transition-all duration-300\n  ";
    readonly premium: "\n    bg-white border border-gray-200 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-300\n    hover:border-royal-300\n  ";
};
export declare const buttonStyles: {
    readonly royal: "\n    bg-royal-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-royal\n    hover:shadow-luxury hover:scale-105\n    transition-all duration-300\n  ";
    readonly gold: "\n    bg-gold-gradient text-royal-900 font-semibold\n    px-8 py-4 rounded-xl shadow-gold\n    hover:animate-gold-glow hover:scale-105\n    transition-all duration-300\n  ";
    readonly luxury: "\n    bg-luxury-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-luxury\n    hover:shadow-royal hover:scale-105\n    transition-all duration-300\n  ";
    readonly outline: "\n    border-2 border-royal-500 text-royal-700 font-semibold\n    px-8 py-4 rounded-xl hover:bg-royal-50\n    hover:shadow-royal transition-all duration-300\n  ";
};
export declare const utils: {
    readonly combineStyles: (...styles: string[]) => string;
    readonly responsive: {
        readonly text: {
            readonly hero: "text-4xl md:text-6xl lg:text-7xl xl:text-8xl";
            readonly heading: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl";
            readonly subheading: "text-lg md:text-xl lg:text-2xl xl:text-3xl";
            readonly body: "text-base md:text-lg lg:text-xl";
        };
        readonly spacing: {
            readonly section: "py-16 md:py-24 lg:py-32";
            readonly container: "px-4 sm:px-6 lg:px-8 xl:px-12";
        };
    };
};
//# sourceMappingURL=assets.d.ts.map