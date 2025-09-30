import require$$2, { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { forwardRef, createElement, useState, useEffect } from 'react';
import require$$4 from 'react-dom';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.17 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:\"\"}:host,html{-webkit-text-size-adjust:100%;font-feature-settings:normal;-webkit-tap-highlight-color:transparent;font-family:Inter,system-ui,sans-serif;font-variation-settings:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-feature-settings:normal;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em;font-variation-settings:normal}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{font-feature-settings:inherit;color:inherit;font-family:inherit;font-size:100%;font-variation-settings:inherit;font-weight:inherit;letter-spacing:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]:where(:not([hidden=until-found])){display:none}:root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--card:0 0% 100%;--card-foreground:222.2 84% 4.9%;--popover:0 0% 100%;--popover-foreground:222.2 84% 4.9%;--primary:24 95% 53%;--primary-foreground:210 40% 98%;--secondary:210 40% 96%;--secondary-foreground:222.2 84% 4.9%;--muted:210 40% 96%;--muted-foreground:215.4 16.3% 46.9%;--accent:210 40% 96%;--accent-foreground:222.2 84% 4.9%;--destructive:0 84.2% 60.2%;--destructive-foreground:210 40% 98%;--border:214.3 31.8% 91.4%;--input:214.3 31.8% 91.4%;--ring:24 95% 53%;--radius:0.5rem}*{border-color:hsl(var(--border))}body{background-color:hsl(var(--background));color:hsl(var(--foreground))}.line-clamp-2{-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.sr-only{clip:rect(0,0,0,0);border-width:0;height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px}.pointer-events-none{pointer-events:none}.visible{visibility:visible}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.inset-0{inset:0}.inset-x-0{left:0;right:0}.inset-y-0{bottom:0;top:0}.-bottom-12{bottom:-3rem}.-bottom-8{bottom:-2rem}.-left-12{left:-3rem}.-right-12{right:-3rem}.-top-12{top:-3rem}.bottom-0{bottom:0}.bottom-1\\/3{bottom:33.333333%}.bottom-8{bottom:2rem}.left-0{left:0}.left-1\\/2{left:50%}.left-1\\/3{left:33.333333%}.left-1\\/4{left:25%}.left-2{left:.5rem}.left-4{left:1rem}.right-0{right:0}.right-1\\/4{right:25%}.right-2{right:.5rem}.right-4{right:1rem}.top-0{top:0}.top-1\\/2{top:50%}.top-1\\/3{top:33.333333%}.top-1\\/4{top:25%}.top-16{top:4rem}.top-2{top:.5rem}.top-4{top:1rem}.top-\\[1px\\]{top:1px}.top-\\[60\\%\\]{top:60%}.top-full{top:100%}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-50{z-index:50}.z-\\[1\\]{z-index:1}.m-1{margin:.25rem}.-mx-1{margin-left:-.25rem;margin-right:-.25rem}.mx-4{margin-left:1rem;margin-right:1rem}.mx-auto{margin-left:auto;margin-right:auto}.my-1{margin-bottom:.25rem;margin-top:.25rem}.-ml-1{margin-left:-.25rem}.-ml-4{margin-left:-1rem}.-mt-1{margin-top:-.25rem}.-mt-1\\.5{margin-top:-.375rem}.-mt-4{margin-top:-1rem}.mb-1{margin-bottom:.25rem}.mb-12{margin-bottom:3rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mb-auto{margin-bottom:auto}.ml-1{margin-left:.25rem}.ml-2{margin-left:.5rem}.ml-auto{margin-left:auto}.mr-1{margin-right:.25rem}.mr-2{margin-right:.5rem}.mr-3{margin-right:.75rem}.mr-auto{margin-right:auto}.mt-1{margin-top:.25rem}.mt-1\\.5{margin-top:.375rem}.mt-16{margin-top:4rem}.mt-2{margin-top:.5rem}.mt-24{margin-top:6rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.mt-auto{margin-top:auto}.line-clamp-2{-webkit-box-orient:vertical;-webkit-line-clamp:2;display:-webkit-box;overflow:hidden}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-square{aspect-ratio:1/1}.h-1\\.5{height:.375rem}.h-10{height:2.5rem}.h-11{height:2.75rem}.h-12{height:3rem}.h-2{height:.5rem}.h-3{height:.75rem}.h-3\\.5{height:.875rem}.h-4{height:1rem}.h-48{height:12rem}.h-5{height:1.25rem}.h-6{height:1.5rem}.h-8{height:2rem}.h-9{height:2.25rem}.h-\\[1px\\]{height:1px}.h-\\[var\\(--radix-navigation-menu-viewport-height\\)\\]{height:var(--radix-navigation-menu-viewport-height)}.h-\\[var\\(--radix-select-trigger-height\\)\\]{height:var(--radix-select-trigger-height)}.h-auto{height:auto}.h-full{height:100%}.h-px{height:1px}.max-h-8{max-height:2rem}.max-h-96{max-height:24rem}.max-h-\\[39px\\]{max-height:39px}.max-h-\\[90\\%\\]{max-height:90%}.min-h-screen{min-height:100vh}.w-1{width:.25rem}.w-10{width:2.5rem}.w-2{width:.5rem}.w-3{width:.75rem}.w-3\\.5{width:.875rem}.w-3\\/4{width:75%}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-8{width:2rem}.w-9{width:2.25rem}.w-\\[100px\\]{width:100px}.w-\\[1px\\]{width:1px}.w-full{width:100%}.w-max{width:-moz-max-content;width:max-content}.min-w-0{min-width:0}.min-w-\\[100px\\]{min-width:100px}.min-w-\\[105px\\]{min-width:105px}.min-w-\\[110px\\]{min-width:110px}.min-w-\\[200px\\]{min-width:200px}.min-w-\\[8rem\\]{min-width:8rem}.min-w-\\[var\\(--radix-select-trigger-width\\)\\]{min-width:var(--radix-select-trigger-width)}.max-w-3xl{max-width:48rem}.max-w-7xl{max-width:80rem}.max-w-\\[100px\\]{max-width:100px}.max-w-\\[105px\\]{max-width:105px}.max-w-\\[110px\\]{max-width:110px}.max-w-\\[198px\\]{max-width:198px}.max-w-\\[358px\\]{max-width:358px}.max-w-max{max-width:-moz-max-content;max-width:max-content}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}.grow{flex-grow:1}.grow-0{flex-grow:0}.basis-full{flex-basis:100%}.-translate-x-1\\/2{--tw-translate-x:-50%}.-translate-x-1\\/2,.-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y:-50%}.rotate-45{--tw-rotate:45deg}.rotate-45,.rotate-90{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.rotate-90{--tw-rotate:90deg}.scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05}.scale-105,.scale-125{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.scale-125{--tw-scale-x:1.25;--tw-scale-y:1.25}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes bounce{0%,to{animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}.animate-bounce{animation:bounce 1s infinite}@keyframes fadeIn{0%{opacity:0}to{opacity:1}}.animate-fade-in{animation:fadeIn .5s ease-in-out}.animate-gold-glow{animation:goldGlow 3s ease-in-out infinite alternate}@keyframes luxuryFloat{0%,to{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(1deg)}}.animate-luxury-float{animation:luxuryFloat 6s ease-in-out infinite}@keyframes royalPulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}.animate-royal-pulse{animation:royalPulse 2s ease-in-out infinite}@keyframes shimmer{0%{transform:translateX(-100%)}to{transform:translateX(100%)}}.animate-royal-shimmer{animation:shimmer 2s infinite}@keyframes slideUp{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.animate-slide-up{animation:slideUp .3s ease-out}@keyframes spin{to{transform:rotate(1turn)}}.animate-spin{animation:spin 1s linear infinite}.cursor-default{cursor:default}.cursor-pointer{cursor:pointer}.touch-none{touch-action:none}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.list-none{list-style-type:none}.grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.flex-col-reverse{flex-direction:column-reverse}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-2\\.5{gap:.625rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.space-x-1>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.25rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.25rem*var(--tw-space-x-reverse))}.space-x-4>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1rem*var(--tw-space-x-reverse))}.space-x-\\[5px\\]>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(5px*(1 - var(--tw-space-x-reverse)));margin-right:calc(5px*var(--tw-space-x-reverse))}.space-y-0\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(.125rem*var(--tw-space-y-reverse));margin-top:calc(.125rem*(1 - var(--tw-space-y-reverse)))}.space-y-1\\.5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(.375rem*var(--tw-space-y-reverse));margin-top:calc(.375rem*(1 - var(--tw-space-y-reverse)))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(.5rem*var(--tw-space-y-reverse));margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)))}.space-y-5>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(1.25rem*var(--tw-space-y-reverse));margin-top:calc(1.25rem*(1 - var(--tw-space-y-reverse)))}.self-stretch{align-self:stretch}.overflow-hidden{overflow:hidden}.overflow-visible{overflow:visible}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis}.truncate,.whitespace-nowrap{white-space:nowrap}.break-words{overflow-wrap:break-word}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:1rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:var(--radius)}.rounded-md{border-radius:calc(var(--radius) - 2px)}.rounded-sm{border-radius:calc(var(--radius) - 4px)}.rounded-xl{border-radius:.75rem}.rounded-t-2xl{border-top-left-radius:1rem;border-top-right-radius:1rem}.rounded-t-\\[10px\\]{border-top-left-radius:10px;border-top-right-radius:10px}.rounded-tl-sm{border-top-left-radius:calc(var(--radius) - 4px)}.border{border-width:1px}.border-0{border-width:0}.border-2{border-width:2px}.border-b{border-bottom-width:1px}.border-l{border-left-width:1px}.border-r{border-right-width:1px}.border-t{border-top-width:1px}.border-none{border-style:none}.border-black\\/10{border-color:rgba(0,0,0,.1)}.border-black\\/20{border-color:rgba(0,0,0,.2)}.border-border{border-color:hsl(var(--border))}.border-border\\/50{border-color:hsl(var(--border)/.5)}.border-gray-200{--tw-border-opacity:1;border-color:rgb(229 231 235/var(--tw-border-opacity,1))}.border-input{border-color:hsl(var(--input))}.border-luxury-burgundy-300{--tw-border-opacity:1;border-color:rgb(235 181 181/var(--tw-border-opacity,1))}.border-luxury-champagne-300{--tw-border-opacity:1;border-color:rgb(247 230 184/var(--tw-border-opacity,1))}.border-luxury-gold-300{--tw-border-opacity:1;border-color:rgb(255 230 153/var(--tw-border-opacity,1))}.border-primary\\/50{border-color:hsl(var(--primary)/.5)}.border-red-500{--tw-border-opacity:1;border-color:rgb(239 68 68/var(--tw-border-opacity,1))}.border-royal-200\\/50{border-color:rgba(227,218,255,.5)}.border-royal-300{--tw-border-opacity:1;border-color:rgb(208 191 255/var(--tw-border-opacity,1))}.border-royal-500{--tw-border-opacity:1;border-color:rgb(156 110 255/var(--tw-border-opacity,1))}.border-white\\/30{border-color:hsla(0,0%,100%,.3)}.border-white\\/50{border-color:hsla(0,0%,100%,.5)}.border-t-black\\/10{border-top-color:rgba(0,0,0,.1)}.border-t-white{--tw-border-opacity:1;border-top-color:rgb(255 255 255/var(--tw-border-opacity,1))}.bg-\\[\\#F0EEED\\]{--tw-bg-opacity:1;background-color:rgb(240 238 237/var(--tw-bg-opacity,1))}.bg-\\[\\#F0F0F0\\]{--tw-bg-opacity:1;background-color:rgb(240 240 240/var(--tw-bg-opacity,1))}.bg-\\[\\#FF3333\\]\\/10{background-color:rgba(255,51,51,.1)}.bg-background{background-color:hsl(var(--background))}.bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity,1))}.bg-black\\/5{background-color:rgba(0,0,0,.05)}.bg-black\\/50{background-color:rgba(0,0,0,.5)}.bg-black\\/60{background-color:rgba(0,0,0,.6)}.bg-black\\/80{background-color:rgba(0,0,0,.8)}.bg-blue-600{--tw-bg-opacity:1;background-color:rgb(37 99 235/var(--tw-bg-opacity,1))}.bg-border{background-color:hsl(var(--border))}.bg-card{background-color:hsl(var(--card))}.bg-cyan-400{--tw-bg-opacity:1;background-color:rgb(34 211 238/var(--tw-bg-opacity,1))}.bg-destructive{background-color:hsl(var(--destructive))}.bg-gray-50{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity,1))}.bg-green-600{--tw-bg-opacity:1;background-color:rgb(22 163 74/var(--tw-bg-opacity,1))}.bg-luxury-burgundy-500{--tw-bg-opacity:1;background-color:rgb(200 106 106/var(--tw-bg-opacity,1))}.bg-luxury-burgundy-600{--tw-bg-opacity:1;background-color:rgb(176 72 72/var(--tw-bg-opacity,1))}.bg-luxury-burgundy-800{--tw-bg-opacity:1;background-color:rgb(114 31 31/var(--tw-bg-opacity,1))}.bg-luxury-champagne-100{--tw-bg-opacity:1;background-color:rgb(253 249 240/var(--tw-bg-opacity,1))}.bg-luxury-champagne-500{--tw-bg-opacity:1;background-color:rgb(232 188 94/var(--tw-bg-opacity,1))}.bg-luxury-gold-400{--tw-bg-opacity:1;background-color:rgb(255 214 51/var(--tw-bg-opacity,1))}.bg-luxury-gold-500{--tw-bg-opacity:1;background-color:rgb(255 193 7/var(--tw-bg-opacity,1))}.bg-muted{background-color:hsl(var(--muted))}.bg-orange-600{--tw-bg-opacity:1;background-color:rgb(234 88 12/var(--tw-bg-opacity,1))}.bg-pink-600{--tw-bg-opacity:1;background-color:rgb(219 39 119/var(--tw-bg-opacity,1))}.bg-popover{background-color:hsl(var(--popover))}.bg-primary{background-color:hsl(var(--primary))}.bg-primary\\/20{background-color:hsl(var(--primary)/.2)}.bg-purple-600{--tw-bg-opacity:1;background-color:rgb(147 51 234/var(--tw-bg-opacity,1))}.bg-red-600{--tw-bg-opacity:1;background-color:rgb(220 38 38/var(--tw-bg-opacity,1))}.bg-royal-500{--tw-bg-opacity:1;background-color:rgb(156 110 255/var(--tw-bg-opacity,1))}.bg-secondary{background-color:hsl(var(--secondary))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-white\\/10{background-color:hsla(0,0%,100%,.1)}.bg-white\\/40{background-color:hsla(0,0%,100%,.4)}.bg-white\\/70{background-color:hsla(0,0%,100%,.7)}.bg-white\\/95{background-color:hsla(0,0%,100%,.95)}.bg-yellow-300{--tw-bg-opacity:1;background-color:rgb(253 224 71/var(--tw-bg-opacity,1))}.bg-yellow-600{--tw-bg-opacity:1;background-color:rgb(202 138 4/var(--tw-bg-opacity,1))}.bg-gold-gradient{background-image:linear-gradient(135deg,#ffc107,#e6ac00 50%,#c90)}.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}.bg-luxury-gradient{background-image:linear-gradient(135deg,#581c87,#7c3aed 25%,#ffc107 75%,#e6ac00)}.bg-royal-gradient{background-image:linear-gradient(135deg,#7c3aed,#8b4cf7 50%,#9c6eff)}.bg-royal-shimmer{background-image:linear-gradient(45deg,transparent 30%,hsla(0,0%,100%,.3) 50%,transparent 70%)}.from-luxury-gold-50{--tw-gradient-from:#fffdf7 var(--tw-gradient-from-position);--tw-gradient-to:rgba(255,253,247,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.from-royal-50{--tw-gradient-from:#f8f6ff var(--tw-gradient-from-position);--tw-gradient-to:rgba(248,246,255,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.from-royal-900\\/70{--tw-gradient-from:rgba(88,28,135,.7) var(--tw-gradient-from-position);--tw-gradient-to:rgba(88,28,135,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.from-white{--tw-gradient-from:#fff var(--tw-gradient-from-position);--tw-gradient-to:hsla(0,0%,100%,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.via-luxury-gold-200{--tw-gradient-to:rgba(255,242,204,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),#fff2cc var(--tw-gradient-via-position),var(--tw-gradient-to)}.via-royal-800\\/50{--tw-gradient-to:rgba(107,33,168,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),rgba(107,33,168,.5) var(--tw-gradient-via-position),var(--tw-gradient-to)}.to-luxury-champagne-200{--tw-gradient-to:#fbf2d9 var(--tw-gradient-to-position)}.to-luxury-champagne-50{--tw-gradient-to:#fefdf9 var(--tw-gradient-to-position)}.to-luxury-gold-900\\/60{--tw-gradient-to:rgba(153,102,0,.6) var(--tw-gradient-to-position)}.to-royal-100{--tw-gradient-to:#f0ebff var(--tw-gradient-to-position)}.bg-clip-text{-webkit-background-clip:text;background-clip:text}.fill-current{fill:currentColor}.object-cover{-o-object-fit:cover;object-fit:cover}.p-0{padding:0}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-3\\.5{padding-left:.875rem;padding-right:.875rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.px-\\[54px\\]{padding-left:54px;padding-right:54px}.py-0\\.5{padding-bottom:.125rem;padding-top:.125rem}.py-1{padding-bottom:.25rem;padding-top:.25rem}.py-1\\.5{padding-bottom:.375rem;padding-top:.375rem}.py-16{padding-bottom:4rem;padding-top:4rem}.py-2{padding-bottom:.5rem;padding-top:.5rem}.py-2\\.5{padding-bottom:.625rem;padding-top:.625rem}.py-3{padding-bottom:.75rem;padding-top:.75rem}.py-4{padding-bottom:1rem;padding-top:1rem}.py-5{padding-bottom:1.25rem;padding-top:1.25rem}.pb-0{padding-bottom:0}.pb-4{padding-bottom:1rem}.pl-0{padding-left:0}.pl-2{padding-left:.5rem}.pl-4{padding-left:1rem}.pl-5{padding-left:1.25rem}.pr-4{padding-right:1rem}.pr-8{padding-right:2rem}.pt-0{padding-top:0}.pt-4{padding-top:1rem}.text-center{text-align:center}.font-elegant{font-family:Crimson Text,serif}.font-luxury{font-family:Cormorant Garamond,serif}.font-premium{font-family:Inter,system-ui,sans-serif}.font-royal{font-family:Playfair Display,serif}.text-2xl{font-size:1.5rem;line-height:2rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-\\[10px\\]{font-size:10px}.text-\\[32px\\]{font-size:32px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-normal{font-weight:400}.font-semibold{font-weight:600}.capitalize{text-transform:capitalize}.leading-\\[36px\\]{line-height:36px}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.25}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.\\!text-black{--tw-text-opacity:1!important;color:rgb(0 0 0/var(--tw-text-opacity,1))!important}.text-\\[\\#FF3333\\]{--tw-text-opacity:1;color:rgb(255 51 51/var(--tw-text-opacity,1))}.text-black{--tw-text-opacity:1;color:rgb(0 0 0/var(--tw-text-opacity,1))}.text-black\\/40{color:rgba(0,0,0,.4)}.text-black\\/60{color:rgba(0,0,0,.6)}.text-card-foreground{color:hsl(var(--card-foreground))}.text-destructive-foreground{color:hsl(var(--destructive-foreground))}.text-foreground{color:hsl(var(--foreground))}.text-gray-200{--tw-text-opacity:1;color:rgb(229 231 235/var(--tw-text-opacity,1))}.text-gray-300{--tw-text-opacity:1;color:rgb(209 213 219/var(--tw-text-opacity,1))}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity,1))}.text-gray-600{--tw-text-opacity:1;color:rgb(75 85 99/var(--tw-text-opacity,1))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity,1))}.text-gray-900{--tw-text-opacity:1;color:rgb(17 24 39/var(--tw-text-opacity,1))}.text-luxury-burgundy-600{--tw-text-opacity:1;color:rgb(176 72 72/var(--tw-text-opacity,1))}.text-luxury-burgundy-700{--tw-text-opacity:1;color:rgb(139 47 47/var(--tw-text-opacity,1))}.text-luxury-champagne-400{--tw-text-opacity:1;color:rgb(241 211 145/var(--tw-text-opacity,1))}.text-luxury-champagne-700{--tw-text-opacity:1;color:rgb(184 129 42/var(--tw-text-opacity,1))}.text-luxury-champagne-800{--tw-text-opacity:1;color:rgb(150 101 33/var(--tw-text-opacity,1))}.text-luxury-gold-300{--tw-text-opacity:1;color:rgb(255 230 153/var(--tw-text-opacity,1))}.text-luxury-gold-400{--tw-text-opacity:1;color:rgb(255 214 51/var(--tw-text-opacity,1))}.text-luxury-gold-500{--tw-text-opacity:1;color:rgb(255 193 7/var(--tw-text-opacity,1))}.text-luxury-gold-600{--tw-text-opacity:1;color:rgb(230 172 0/var(--tw-text-opacity,1))}.text-luxury-gold-700{--tw-text-opacity:1;color:rgb(204 153 0/var(--tw-text-opacity,1))}.text-muted-foreground{color:hsl(var(--muted-foreground))}.text-popover-foreground{color:hsl(var(--popover-foreground))}.text-primary{color:hsl(var(--primary))}.text-primary-foreground{color:hsl(var(--primary-foreground))}.text-red-600{--tw-text-opacity:1;color:rgb(220 38 38/var(--tw-text-opacity,1))}.text-royal-600{--tw-text-opacity:1;color:rgb(139 76 247/var(--tw-text-opacity,1))}.text-royal-700{--tw-text-opacity:1;color:rgb(124 58 237/var(--tw-text-opacity,1))}.text-royal-900{--tw-text-opacity:1;color:rgb(88 28 135/var(--tw-text-opacity,1))}.text-secondary-foreground{color:hsl(var(--secondary-foreground))}.text-transparent{color:transparent}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.line-through{text-decoration-line:line-through}.underline-offset-4{text-underline-offset:4px}.opacity-0{opacity:0}.opacity-100{opacity:1}.opacity-20{opacity:.2}.opacity-25{opacity:.25}.opacity-50{opacity:.5}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.shadow{--tw-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color)}.shadow,.shadow-gold{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-gold{--tw-shadow:0 10px 30px rgba(255,193,7,.3);--tw-shadow-colored:0 10px 30px var(--tw-shadow-color)}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.shadow-lg,.shadow-luxury{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-luxury{--tw-shadow:0 25px 50px rgba(0,0,0,.15);--tw-shadow-colored:0 25px 50px var(--tw-shadow-color)}.shadow-md{--tw-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color)}.shadow-md,.shadow-none{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-none{--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}.shadow-royal{--tw-shadow:0 20px 60px rgba(124,58,237,.15);--tw-shadow-colored:0 20px 60px var(--tw-shadow-color)}.shadow-royal,.shadow-royal-inset{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-royal-inset{--tw-shadow:inset 0 2px 4px rgba(124,58,237,.1);--tw-shadow-colored:inset 0 2px 4px var(--tw-shadow-color)}.shadow-sm{--tw-shadow:0 1px 2px 0 rgba(0,0,0,.05);--tw-shadow-colored:0 1px 2px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring-offset-background{--tw-ring-offset-color:hsl(var(--background))}.drop-shadow-2xl{--tw-drop-shadow:drop-shadow(0 25px 25px rgba(0,0,0,.15))}.drop-shadow-2xl,.drop-shadow-lg{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.drop-shadow-lg{--tw-drop-shadow:drop-shadow(0 10px 8px rgba(0,0,0,.04)) drop-shadow(0 4px 3px rgba(0,0,0,.1))}.backdrop-blur-\\[2px\\]{--tw-backdrop-blur:blur(2px)}.backdrop-blur-\\[2px\\],.backdrop-blur-md{backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.backdrop-blur-md{--tw-backdrop-blur:blur(12px)}.transition{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-all{transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-colors{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-opacity{transition-duration:.15s;transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-transform{transition-duration:.15s;transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-1000{transition-duration:1s}.duration-200{transition-duration:.2s}.duration-300{transition-duration:.3s}.duration-500{transition-duration:.5s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}@keyframes enter{0%{opacity:var(--tw-enter-opacity,1);transform:translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0) scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1)) rotate(var(--tw-enter-rotate,0))}}@keyframes exit{to{opacity:var(--tw-exit-opacity,1);transform:translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0) scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1)) rotate(var(--tw-exit-rotate,0))}}.duration-1000{animation-duration:1s}.duration-200{animation-duration:.2s}.duration-300{animation-duration:.3s}.duration-500{animation-duration:.5s}.ease-in-out{animation-timing-function:cubic-bezier(.4,0,.2,1)}.file\\:border-0::file-selector-button{border-width:0}.file\\:bg-transparent::file-selector-button{background-color:transparent}.file\\:text-sm::file-selector-button{font-size:.875rem;line-height:1.25rem}.file\\:font-medium::file-selector-button{font-weight:500}.placeholder\\:text-sm::-moz-placeholder{font-size:.875rem;line-height:1.25rem}.placeholder\\:text-sm::placeholder{font-size:.875rem;line-height:1.25rem}.placeholder\\:font-normal::-moz-placeholder{font-weight:400}.placeholder\\:font-normal::placeholder{font-weight:400}.placeholder\\:text-muted-foreground::-moz-placeholder{color:hsl(var(--muted-foreground))}.placeholder\\:text-muted-foreground::placeholder{color:hsl(var(--muted-foreground))}.focus-within\\:shadow-lg:focus-within{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.focus-within\\:ring-2:focus-within{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus-within\\:ring-red-500:focus-within{--tw-ring-opacity:1;--tw-ring-color:rgb(239 68 68/var(--tw-ring-opacity,1))}.focus-within\\:ring-ring:focus-within{--tw-ring-color:hsl(var(--ring))}.hover\\:scale-105:hover{--tw-scale-x:1.05;--tw-scale-y:1.05}.hover\\:scale-105:hover,.hover\\:scale-110:hover{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:scale-110:hover{--tw-scale-x:1.1;--tw-scale-y:1.1}.hover\\:scale-\\[1\\.02\\]:hover{--tw-scale-x:1.02;--tw-scale-y:1.02;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes goldGlow{0%{box-shadow:0 0 20px rgba(255,193,7,.3)}to{box-shadow:0 0 40px rgba(255,193,7,.6)}}.hover\\:animate-gold-glow:hover{animation:goldGlow 3s ease-in-out infinite alternate}.hover\\:border-luxury-gold-300\\/50:hover{border-color:rgba(255,230,153,.5)}.hover\\:border-royal-300:hover{--tw-border-opacity:1;border-color:rgb(208 191 255/var(--tw-border-opacity,1))}.hover\\:border-white\\/50:hover{border-color:hsla(0,0%,100%,.5)}.hover\\:bg-accent:hover{background-color:hsl(var(--accent))}.hover\\:bg-black:hover{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity,1))}.hover\\:bg-destructive\\/90:hover{background-color:hsl(var(--destructive)/.9)}.hover\\:bg-green-700:hover{--tw-bg-opacity:1;background-color:rgb(21 128 61/var(--tw-bg-opacity,1))}.hover\\:bg-luxury-burgundy-50:hover{--tw-bg-opacity:1;background-color:rgb(253 242 242/var(--tw-bg-opacity,1))}.hover\\:bg-orange-700:hover{--tw-bg-opacity:1;background-color:rgb(194 65 12/var(--tw-bg-opacity,1))}.hover\\:bg-primary\\/90:hover{background-color:hsl(var(--primary)/.9)}.hover\\:bg-royal-50:hover{--tw-bg-opacity:1;background-color:rgb(248 246 255/var(--tw-bg-opacity,1))}.hover\\:bg-secondary\\/80:hover{background-color:hsl(var(--secondary)/.8)}.hover\\:bg-transparent:hover{background-color:transparent}.hover\\:bg-white\\/20:hover{background-color:hsla(0,0%,100%,.2)}.hover\\:bg-white\\/60:hover{background-color:hsla(0,0%,100%,.6)}.hover\\:bg-yellow-700:hover{--tw-bg-opacity:1;background-color:rgb(161 98 7/var(--tw-bg-opacity,1))}.hover\\:text-accent-foreground:hover{color:hsl(var(--accent-foreground))}.hover\\:text-foreground:hover{color:hsl(var(--foreground))}.hover\\:text-white:hover{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.hover\\:underline:hover{text-decoration-line:underline}.hover\\:no-underline:hover{text-decoration-line:none}.hover\\:opacity-100:hover{opacity:1}.hover\\:shadow-luxury:hover{--tw-shadow:0 25px 50px rgba(0,0,0,.15);--tw-shadow-colored:0 25px 50px var(--tw-shadow-color)}.hover\\:shadow-luxury:hover,.hover\\:shadow-md:hover{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.hover\\:shadow-md:hover{--tw-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color)}.hover\\:shadow-royal:hover{--tw-shadow:0 20px 60px rgba(124,58,237,.15);--tw-shadow-colored:0 20px 60px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.focus\\:bg-accent:focus{background-color:hsl(var(--accent))}.focus\\:text-accent-foreground:focus{color:hsl(var(--accent-foreground))}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:ring-1:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.focus\\:ring-1:focus,.focus\\:ring-2:focus{box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.focus\\:ring-green-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(34 197 94/var(--tw-ring-opacity,1))}.focus\\:ring-orange-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(249 115 22/var(--tw-ring-opacity,1))}.focus\\:ring-ring:focus{--tw-ring-color:hsl(var(--ring))}.focus\\:ring-yellow-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(234 179 8/var(--tw-ring-opacity,1))}.focus\\:ring-offset-2:focus{--tw-ring-offset-width:2px}.focus-visible\\:outline-none:focus-visible{outline:2px solid transparent;outline-offset:2px}.focus-visible\\:ring-1:focus-visible{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus-visible\\:ring-2:focus-visible{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus-visible\\:ring-red-500:focus-visible{--tw-ring-opacity:1;--tw-ring-color:rgb(239 68 68/var(--tw-ring-opacity,1))}.focus-visible\\:ring-ring:focus-visible{--tw-ring-color:hsl(var(--ring))}.focus-visible\\:ring-offset-2:focus-visible{--tw-ring-offset-width:2px}.disabled\\:pointer-events-none:disabled{pointer-events:none}.disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}.disabled\\:opacity-50:disabled{opacity:.5}.disabled\\:hover\\:scale-100:hover:disabled{--tw-scale-x:1;--tw-scale-y:1}.disabled\\:hover\\:scale-100:hover:disabled,.group:hover .group-hover\\:translate-x-1{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:translate-x-1{--tw-translate-x:0.25rem}.group:hover .group-hover\\:scale-110{--tw-scale-x:1.1;--tw-scale-y:1.1;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:text-royal-700{--tw-text-opacity:1;color:rgb(124 58 237/var(--tw-text-opacity,1))}.group:hover .group-hover\\:opacity-100{opacity:1}.data-\\[disabled\\]\\:pointer-events-none[data-disabled]{pointer-events:none}.data-\\[side\\=bottom\\]\\:translate-y-1[data-side=bottom]{--tw-translate-y:0.25rem}.data-\\[side\\=bottom\\]\\:translate-y-1[data-side=bottom],.data-\\[side\\=left\\]\\:-translate-x-1[data-side=left]{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.data-\\[side\\=left\\]\\:-translate-x-1[data-side=left]{--tw-translate-x:-0.25rem}.data-\\[side\\=right\\]\\:translate-x-1[data-side=right]{--tw-translate-x:0.25rem}.data-\\[side\\=right\\]\\:translate-x-1[data-side=right],.data-\\[side\\=top\\]\\:-translate-y-1[data-side=top]{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.data-\\[side\\=top\\]\\:-translate-y-1[data-side=top]{--tw-translate-y:-0.25rem}.data-\\[active\\]\\:bg-accent\\/50[data-active],.data-\\[state\\=open\\]\\:bg-accent\\/50[data-state=open]{background-color:hsl(var(--accent)/.5)}.data-\\[state\\=open\\]\\:bg-secondary[data-state=open]{background-color:hsl(var(--secondary))}.data-\\[disabled\\]\\:opacity-50[data-disabled]{opacity:.5}.data-\\[state\\=closed\\]\\:duration-300[data-state=closed]{transition-duration:.3s}.data-\\[state\\=open\\]\\:duration-500[data-state=open]{transition-duration:.5s}.data-\\[motion\\^\\=from-\\]\\:animate-in[data-motion^=from-],.data-\\[state\\=open\\]\\:animate-in[data-state=open],.data-\\[state\\=visible\\]\\:animate-in[data-state=visible]{--tw-enter-opacity:initial;--tw-enter-scale:initial;--tw-enter-rotate:initial;--tw-enter-translate-x:initial;--tw-enter-translate-y:initial;animation-duration:.15s;animation-name:enter}.data-\\[motion\\^\\=to-\\]\\:animate-out[data-motion^=to-],.data-\\[state\\=closed\\]\\:animate-out[data-state=closed],.data-\\[state\\=hidden\\]\\:animate-out[data-state=hidden]{--tw-exit-opacity:initial;--tw-exit-scale:initial;--tw-exit-rotate:initial;--tw-exit-translate-x:initial;--tw-exit-translate-y:initial;animation-duration:.15s;animation-name:exit}.data-\\[motion\\^\\=from-\\]\\:fade-in[data-motion^=from-]{--tw-enter-opacity:0}.data-\\[motion\\^\\=to-\\]\\:fade-out[data-motion^=to-],.data-\\[state\\=closed\\]\\:fade-out-0[data-state=closed],.data-\\[state\\=hidden\\]\\:fade-out[data-state=hidden]{--tw-exit-opacity:0}.data-\\[state\\=open\\]\\:fade-in-0[data-state=open],.data-\\[state\\=visible\\]\\:fade-in[data-state=visible]{--tw-enter-opacity:0}.data-\\[state\\=closed\\]\\:zoom-out-95[data-state=closed]{--tw-exit-scale:.95}.data-\\[state\\=open\\]\\:zoom-in-90[data-state=open]{--tw-enter-scale:.9}.data-\\[state\\=open\\]\\:zoom-in-95[data-state=open]{--tw-enter-scale:.95}.data-\\[motion\\=from-end\\]\\:slide-in-from-right-52[data-motion=from-end]{--tw-enter-translate-x:13rem}.data-\\[motion\\=from-start\\]\\:slide-in-from-left-52[data-motion=from-start]{--tw-enter-translate-x:-13rem}.data-\\[motion\\=to-end\\]\\:slide-out-to-right-52[data-motion=to-end]{--tw-exit-translate-x:13rem}.data-\\[motion\\=to-start\\]\\:slide-out-to-left-52[data-motion=to-start]{--tw-exit-translate-x:-13rem}.data-\\[side\\=bottom\\]\\:slide-in-from-top-2[data-side=bottom]{--tw-enter-translate-y:-0.5rem}.data-\\[side\\=left\\]\\:slide-in-from-right-2[data-side=left]{--tw-enter-translate-x:0.5rem}.data-\\[side\\=right\\]\\:slide-in-from-left-2[data-side=right]{--tw-enter-translate-x:-0.5rem}.data-\\[side\\=top\\]\\:slide-in-from-bottom-2[data-side=top]{--tw-enter-translate-y:0.5rem}.data-\\[state\\=closed\\]\\:slide-out-to-bottom[data-state=closed]{--tw-exit-translate-y:100%}.data-\\[state\\=closed\\]\\:slide-out-to-left[data-state=closed]{--tw-exit-translate-x:-100%}.data-\\[state\\=closed\\]\\:slide-out-to-right[data-state=closed]{--tw-exit-translate-x:100%}.data-\\[state\\=closed\\]\\:slide-out-to-top[data-state=closed]{--tw-exit-translate-y:-100%}.data-\\[state\\=open\\]\\:slide-in-from-bottom[data-state=open]{--tw-enter-translate-y:100%}.data-\\[state\\=open\\]\\:slide-in-from-left[data-state=open]{--tw-enter-translate-x:-100%}.data-\\[state\\=open\\]\\:slide-in-from-right[data-state=open]{--tw-enter-translate-x:100%}.data-\\[state\\=open\\]\\:slide-in-from-top[data-state=open]{--tw-enter-translate-y:-100%}.data-\\[state\\=closed\\]\\:duration-300[data-state=closed]{animation-duration:.3s}.data-\\[state\\=open\\]\\:duration-500[data-state=open]{animation-duration:.5s}.group[data-state=open] .group-data-\\[state\\=open\\]\\:rotate-180{--tw-rotate:180deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@media (min-width:640px){.sm\\:h-10{height:2.5rem}.sm\\:h-6{height:1.5rem}.sm\\:w-10{width:2.5rem}.sm\\:w-6{width:1.5rem}.sm\\:w-\\[218px\\]{width:218px}.sm\\:max-w-32{max-width:8rem}.sm\\:max-w-\\[124px\\]{max-width:124px}.sm\\:max-w-\\[170px\\]{max-width:170px}.sm\\:max-w-\\[295px\\]{max-width:295px}.sm\\:max-w-\\[400px\\]{max-width:400px}.sm\\:max-w-sm{max-width:24rem}.sm\\:flex-row{flex-direction:row}.sm\\:items-center{align-items:center}.sm\\:justify-end{justify-content:flex-end}.sm\\:gap-2\\.5{gap:.625rem}.sm\\:space-x-2>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.5rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.5rem*var(--tw-space-x-reverse))}.sm\\:space-x-5>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(1.25rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(1.25rem*var(--tw-space-x-reverse))}.sm\\:px-0{padding-left:0;padding-right:0}.sm\\:px-5{padding-left:1.25rem;padding-right:1.25rem}.sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.sm\\:text-left{text-align:left}.sm\\:text-base{font-size:1rem;line-height:1.5rem}}@media (min-width:768px){.md\\:absolute{position:absolute}.md\\:mb-10{margin-bottom:2.5rem}.md\\:mb-14{margin-bottom:3.5rem}.md\\:mb-9{margin-bottom:2.25rem}.md\\:grid{display:grid}.md\\:hidden{display:none}.md\\:h-9{height:2.25rem}.md\\:max-h-10{max-height:2.5rem}.md\\:w-9{width:2.25rem}.md\\:w-\\[var\\(--radix-navigation-menu-viewport-width\\)\\]{width:var(--radix-navigation-menu-viewport-width)}.md\\:w-auto{width:auto}.md\\:space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:calc(1.5rem*var(--tw-space-y-reverse));margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)))}.md\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.md\\:py-24{padding-bottom:6rem;padding-top:6rem}.md\\:py-3\\.5{padding-bottom:.875rem;padding-top:.875rem}.md\\:text-2xl{font-size:1.5rem;line-height:2rem}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:text-5xl{font-size:3rem;line-height:1}.md\\:text-6xl{font-size:3.75rem;line-height:1}.md\\:text-lg{font-size:1.125rem;line-height:1.75rem}.md\\:text-sm{font-size:.875rem;line-height:1.25rem}.md\\:text-xl{font-size:1.25rem;line-height:1.75rem}}@media (min-width:1024px){.lg\\:px-8{padding-left:2rem;padding-right:2rem}.lg\\:py-32{padding-bottom:8rem;padding-top:8rem}.lg\\:text-2xl{font-size:1.5rem;line-height:2rem}.lg\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.lg\\:text-4xl{font-size:2.25rem;line-height:2.5rem}.lg\\:text-7xl{font-size:4.5rem;line-height:1}.lg\\:text-xl{font-size:1.25rem;line-height:1.75rem}}@media (min-width:1280px){.xl\\:mx-0{margin-left:0;margin-right:0}.xl\\:space-x-2\\.5>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-left:calc(.625rem*(1 - var(--tw-space-x-reverse)));margin-right:calc(.625rem*var(--tw-space-x-reverse))}.xl\\:px-0{padding-left:0;padding-right:0}.xl\\:px-12{padding-left:3rem;padding-right:3rem}.xl\\:text-2xl{font-size:1.5rem;line-height:2rem}.xl\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.xl\\:text-5xl{font-size:3rem;line-height:1}.xl\\:text-8xl{font-size:6rem;line-height:1}.xl\\:text-xl{font-size:1.25rem;line-height:1.75rem}.xl\\:text-xs{font-size:.75rem;line-height:1rem}}.\\[\\&\\>span\\]\\:line-clamp-1>span{-webkit-box-orient:vertical;-webkit-line-clamp:1;display:-webkit-box;overflow:hidden}.\\[\\&\\>svg\\]\\:size-3\\.5>svg{height:.875rem;width:.875rem}.\\[\\&\\[data-state\\=open\\]\\>svg\\]\\:rotate-180[data-state=open]>svg{--tw-rotate:180deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}";
styleInject(css_248z,{"insertAt":"top"});

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// packages/react/compose-refs/src/compose-refs.tsx
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

// src/slot.tsx
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config)=>(props)=>{
        var _config_compoundVariants;
        if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
        const { variants, defaultVariants } = config;
        const getVariantClassNames = Object.keys(variants).map((variant)=>{
            const variantProp = props === null || props === void 0 ? void 0 : props[variant];
            const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
            if (variantProp === null) return null;
            const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
            return variants[variant][variantKey];
        });
        const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
            let [key, value] = param;
            if (value === undefined) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
        const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
            let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
            return Object.entries(compoundVariantOptions).every((param)=>{
                let [key, value] = param;
                return Array.isArray(value) ? value.includes({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                }[key]) : ({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                })[key] === value;
            }) ? [
                ...acc,
                cvClass,
                cvClassName
            ] : acc;
        }, []);
        return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    };

const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    prefix
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;
const getPrefixedClassGroupEntries = (classGroupEntries, prefix) => {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(([classGroupId, classGroup]) => {
    const prefixedClassGroup = classGroup.map(classDefinition => {
      if (typeof classDefinition === 'string') {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === 'object') {
        return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
};

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const createParseClassName = config => {
  const {
    separator,
    experimentalParseClassName
  } = config;
  const isSeparatorSingleCharacter = separator.length === 1;
  const firstSeparatorCharacter = separator[0];
  const separatorLength = separator.length;
  // parseClassName inspired by https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
  const parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (experimentalParseClassName) {
    return className => experimentalParseClassName({
      className,
      parseClassName
    });
  }
  return parseClassName;
};
/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const sortModifiers = modifiers => {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  const sortedModifiers = [];
  let unsortedModifiers = [];
  modifiers.forEach(modifier => {
    const isArbitraryVariant = modifier[0] === '[';
    if (isArbitraryVariant) {
      sortedModifiers.push(...unsortedModifiers.sort(), modifier);
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push(...unsortedModifiers.sort());
  return sortedModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
const fractionRegex = /^\d+\/\d+$/;
const stringLengths = /*#__PURE__*/new Set(['px', 'full', 'screen']);
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isLength = value => isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, 'length', isLengthOnly);
const isNumber = value => Boolean(value) && !Number.isNaN(Number(value));
const isArbitraryNumber = value => getIsArbitraryValue(value, 'number', isNumber);
const isInteger = value => Boolean(value) && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isTshirtSize = value => tshirtUnitRegex.test(value);
const sizeLabels = /*#__PURE__*/new Set(['length', 'size', 'percentage']);
const isArbitrarySize = value => getIsArbitraryValue(value, sizeLabels, isNever);
const isArbitraryPosition = value => getIsArbitraryValue(value, 'position', isNever);
const imageLabels = /*#__PURE__*/new Set(['image', 'url']);
const isArbitraryImage = value => getIsArbitraryValue(value, imageLabels, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, '', isShadow);
const isAny = () => true;
const getIsArbitraryValue = (value, label, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return typeof label === 'string' ? result[1] === label : label.has(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const getDefaultConfig = () => {
  const colors = fromTheme('colors');
  const spacing = fromTheme('spacing');
  const blur = fromTheme('blur');
  const brightness = fromTheme('brightness');
  const borderColor = fromTheme('borderColor');
  const borderRadius = fromTheme('borderRadius');
  const borderSpacing = fromTheme('borderSpacing');
  const borderWidth = fromTheme('borderWidth');
  const contrast = fromTheme('contrast');
  const grayscale = fromTheme('grayscale');
  const hueRotate = fromTheme('hueRotate');
  const invert = fromTheme('invert');
  const gap = fromTheme('gap');
  const gradientColorStops = fromTheme('gradientColorStops');
  const gradientColorStopPositions = fromTheme('gradientColorStopPositions');
  const inset = fromTheme('inset');
  const margin = fromTheme('margin');
  const opacity = fromTheme('opacity');
  const padding = fromTheme('padding');
  const saturate = fromTheme('saturate');
  const scale = fromTheme('scale');
  const sepia = fromTheme('sepia');
  const skew = fromTheme('skew');
  const space = fromTheme('space');
  const translate = fromTheme('translate');
  const getOverscroll = () => ['auto', 'contain', 'none'];
  const getOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const getSpacingWithAutoAndArbitrary = () => ['auto', isArbitraryValue, spacing];
  const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
  const getLengthWithEmptyAndArbitrary = () => ['', isLength, isArbitraryLength];
  const getNumberWithAutoAndArbitrary = () => ['auto', isNumber, isArbitraryValue];
  const getPositions = () => ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'];
  const getLineStyles = () => ['solid', 'dashed', 'dotted', 'double', 'none'];
  const getBlendModes = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const getAlign = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'];
  const getZeroAndEmpty = () => ['', '0', isArbitraryValue];
  const getBreaks = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
  return {
    cacheSize: 500,
    separator: ':',
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: ['none', '', isTshirtSize, isArbitraryValue],
      brightness: getNumberAndArbitrary(),
      borderColor: [colors],
      borderRadius: ['none', '', 'full', isTshirtSize, isArbitraryValue],
      borderSpacing: getSpacingWithArbitrary(),
      borderWidth: getLengthWithEmptyAndArbitrary(),
      contrast: getNumberAndArbitrary(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: getSpacingWithArbitrary(),
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAutoAndArbitrary(),
      margin: getSpacingWithAutoAndArbitrary(),
      opacity: getNumberAndArbitrary(),
      padding: getSpacingWithArbitrary(),
      saturate: getNumberAndArbitrary(),
      scale: getNumberAndArbitrary(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: getSpacingWithArbitrary(),
      translate: getSpacingWithArbitrary()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', 'video', isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: [...getPositions(), isArbitraryValue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ['auto', isInteger, isArbitraryValue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: getSpacingWithAutoAndArbitrary()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['wrap', 'wrap-reverse', 'nowrap']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ['1', 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ['first', 'last', 'none', isInteger, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: ['auto', {
          span: ['full', isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: ['auto', {
          span: [isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: ['normal', ...getAlign()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': ['start', 'end', 'center', 'stretch']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...getAlign(), 'baseline']
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', 'start', 'end', 'center', 'stretch', 'baseline']
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': [...getAlign(), 'baseline']
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      'space-x': [{
        'space-x': [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      'space-y': [{
        'space-y': [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-y-reverse': ['space-y-reverse'],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ['auto', 'min', 'max', 'fit', 'svw', 'lvw', 'dvw', isArbitraryValue, spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [isArbitraryValue, spacing, 'min', 'max', 'fit']
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [isArbitraryValue, spacing, 'none', 'full', 'min', 'max', 'fit', 'prose', {
          screen: [isTshirtSize]
        }, isTshirtSize]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit']
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black', isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest', isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': ['none', isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', isLength, isArbitraryValue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['none', 'disc', 'decimal', isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      'placeholder-opacity': [{
        'placeholder-opacity': [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      'text-opacity': [{
        'text-opacity': [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...getLineStyles(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: ['auto', 'from-font', isLength, isArbitraryLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': ['auto', isLength, isArbitraryValue]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: getSpacingWithArbitrary()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      'bg-opacity': [{
        'bg-opacity': [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: [...getPositions(), isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: ['no-repeat', {
          repeat: ['', 'x', 'y', 'round', 'space']
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: ['auto', 'cover', 'contain', isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          'gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
        }, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      'border-opacity': [{
        'border-opacity': [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...getLineStyles(), 'hidden']
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x': [{
        'divide-x': [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y': [{
        'divide-y': [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      'divide-opacity': [{
        'divide-opacity': [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      'divide-style': [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': [borderColor]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': [borderColor]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: ['', ...getLineStyles()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isLength, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: [isLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w': [{
        ring: getLengthWithEmptyAndArbitrary()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      'ring-color': [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      'ring-opacity': [{
        'ring-opacity': [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      'ring-offset-w': [{
        'ring-offset': [isLength, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      'ring-offset-color': [{
        'ring-offset': [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ['', 'inner', 'none', isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      'shadow-color': [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...getBlendModes(), 'plus-lighter', 'plus-darker']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ['', 'none']
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': ['', 'none', isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': ['', 'none']
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['none', 'all', '', 'colors', 'opacity', 'shadow', 'transform', isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'in', 'out', 'in-out', isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', 'spin', 'ping', 'pulse', 'bounce', isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ['', 'gpu', 'none']
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ['auto', colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['none', 'auto']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', 'y', 'x', '']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, 'none']
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, 'none']
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    }
  };
};
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

/**
 * Utility function to merge CSS classes with Tailwind CSS conflict resolution
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return twMerge(clsx(inputs));
}
/**
 * Compare two arrays for equality by converting to strings
 * Useful for shallow comparison of arrays
 */
var compareArrays = function (a, b) {
    return a.toString() === b.toString();
};
/**
 * Format price for display in Indian Rupees
 * @param price - Price in paise (smallest currency unit)
 * @param currency - Currency code (default: INR)
 */
var formatPrice = function (price, currency) {
    if (currency === void 0) { currency = "INR"; }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price / 100); // Convert paise to rupees
};
/**
 * Format weight for confectionery products
 * @param weight - Weight in grams
 */
var formatWeight = function (weight) {
    if (weight >= 1000) {
        return "".concat((weight / 1000).toFixed(1), "kg");
    }
    return "".concat(weight, "g");
};
/**
 * Generate slug from string for URLs
 * @param text - Text to convert to slug
 */
var generateSlug = function (text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};
/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 */
var truncateText = function (text, length) {
    if (text.length <= length)
        return text;
    return text.substring(0, length).trim() + "...";
};
/**
 * Debounce function for search and input handling
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
var debounce = function (func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
};

var buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            // Business-specific variants for Harsha Delights
            primary: "bg-orange-600 text-white shadow hover:bg-orange-700 focus:ring-orange-500",
            success: "bg-green-600 text-white shadow hover:bg-green-700 focus:ring-green-500",
            warning: "bg-yellow-600 text-white shadow hover:bg-yellow-700 focus:ring-yellow-500",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3 text-xs",
            lg: "h-11 rounded-md px-8",
            xl: "h-12 rounded-md px-10 text-base",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
var Button = React.forwardRef(function (_a, ref) {
    var className = _a.className, variant = _a.variant, size = _a.size, _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.loading, loading = _c === void 0 ? false : _c, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, children = _a.children, disabled = _a.disabled, props = __rest(_a, ["className", "variant", "size", "asChild", "loading", "leftIcon", "rightIcon", "children", "disabled"]);
    var Comp = asChild ? Slot : "button";
    return (jsxs(Comp, __assign({ className: cn(buttonVariants({ variant: variant, size: size, className: className })), ref: ref, disabled: disabled || loading }, props, { children: [loading && (jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), !loading && leftIcon && (jsx("span", { className: "mr-2", children: leftIcon })), children, !loading && rightIcon && (jsx("span", { className: "ml-2", children: rightIcon }))] })));
});
Button.displayName = "Button";

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var imageExternal = {};

var _interop_require_default$1 = {};

_interop_require_default$1._ = _interop_require_default$1._interop_require_default = _interop_require_default;
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var getImgProps = {};

var warnOnce = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	Object.defineProperty(exports, "warnOnce", {
	    enumerable: true,
	    get: function() {
	        return warnOnce;
	    }
	});
	let warnOnce = (_)=>{};
	if (process.env.NODE_ENV !== "production") {
	    const warnings = new Set();
	    warnOnce = (msg)=>{
	        if (!warnings.has(msg)) {
	            console.warn(msg);
	        }
	        warnings.add(msg);
	    };
	}

	
} (warnOnce));

var imageBlurSvg = {};

/**
 * A shared function, used on both client and server, to generate a SVG blur placeholder.
 */

(function (exports) {
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	Object.defineProperty(exports, "getImageBlurSvg", {
	    enumerable: true,
	    get: function() {
	        return getImageBlurSvg;
	    }
	});
	function getImageBlurSvg(param) {
	    let { widthInt, heightInt, blurWidth, blurHeight, blurDataURL, objectFit } = param;
	    const std = 20;
	    const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
	    const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
	    const viewBox = svgWidth && svgHeight ? "viewBox='0 0 " + svgWidth + " " + svgHeight + "'" : "";
	    const preserveAspectRatio = viewBox ? "none" : objectFit === "contain" ? "xMidYMid" : objectFit === "cover" ? "xMidYMid slice" : "none";
	    return "%3Csvg xmlns='http://www.w3.org/2000/svg' " + viewBox + "%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='" + preserveAspectRatio + "' style='filter: url(%23b);' href='" + blurDataURL + "'/%3E%3C/svg%3E";
	}

	
} (imageBlurSvg));

var imageConfig = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function _export(target, all) {
	    for(var name in all)Object.defineProperty(target, name, {
	        enumerable: true,
	        get: all[name]
	    });
	}
	_export(exports, {
	    VALID_LOADERS: function() {
	        return VALID_LOADERS;
	    },
	    imageConfigDefault: function() {
	        return imageConfigDefault;
	    }
	});
	const VALID_LOADERS = [
	    "default",
	    "imgix",
	    "cloudinary",
	    "akamai",
	    "custom"
	];
	const imageConfigDefault = {
	    deviceSizes: [
	        640,
	        750,
	        828,
	        1080,
	        1200,
	        1920,
	        2048,
	        3840
	    ],
	    imageSizes: [
	        16,
	        32,
	        48,
	        64,
	        96,
	        128,
	        256,
	        384
	    ],
	    path: "/_next/image",
	    loader: "default",
	    loaderFile: "",
	    domains: [],
	    disableStaticImages: false,
	    minimumCacheTTL: 60,
	    formats: [
	        "image/webp"
	    ],
	    dangerouslyAllowSVG: false,
	    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
	    contentDispositionType: "inline",
	    localPatterns: undefined,
	    remotePatterns: [],
	    qualities: undefined,
	    unoptimized: false
	};

	
} (imageConfig));

(function (exports) {
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	Object.defineProperty(exports, "getImgProps", {
	    enumerable: true,
	    get: function() {
	        return getImgProps;
	    }
	});
	const _warnonce = warnOnce;
	const _imageblursvg = imageBlurSvg;
	const _imageconfig = imageConfig;
	const VALID_LOADING_VALUES = [
	    "lazy",
	    "eager",
	    undefined
	];
	function isStaticRequire(src) {
	    return src.default !== undefined;
	}
	function isStaticImageData(src) {
	    return src.src !== undefined;
	}
	function isStaticImport(src) {
	    return typeof src === "object" && (isStaticRequire(src) || isStaticImageData(src));
	}
	const allImgs = new Map();
	let perfObserver;
	function getInt(x) {
	    if (typeof x === "undefined") {
	        return x;
	    }
	    if (typeof x === "number") {
	        return Number.isFinite(x) ? x : NaN;
	    }
	    if (typeof x === "string" && /^[0-9]+$/.test(x)) {
	        return parseInt(x, 10);
	    }
	    return NaN;
	}
	function getWidths(param, width, sizes) {
	    let { deviceSizes, allSizes } = param;
	    if (sizes) {
	        // Find all the "vw" percent sizes used in the sizes prop
	        const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
	        const percentSizes = [];
	        for(let match; match = viewportWidthRe.exec(sizes); match){
	            percentSizes.push(parseInt(match[2]));
	        }
	        if (percentSizes.length) {
	            const smallestRatio = Math.min(...percentSizes) * 0.01;
	            return {
	                widths: allSizes.filter((s)=>s >= deviceSizes[0] * smallestRatio),
	                kind: "w"
	            };
	        }
	        return {
	            widths: allSizes,
	            kind: "w"
	        };
	    }
	    if (typeof width !== "number") {
	        return {
	            widths: deviceSizes,
	            kind: "w"
	        };
	    }
	    const widths = [
	        ...new Set(// > This means that most OLED screens that say they are 3x resolution,
	        // > are actually 3x in the green color, but only 1.5x in the red and
	        // > blue colors. Showing a 3x resolution image in the app vs a 2x
	        // > resolution image will be visually the same, though the 3x image
	        // > takes significantly more data. Even true 3x resolution screens are
	        // > wasteful as the human eye cannot see that level of detail without
	        // > something like a magnifying glass.
	        // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
	        [
	            width,
	            width * 2 /*, width * 3*/ 
	        ].map((w)=>allSizes.find((p)=>p >= w) || allSizes[allSizes.length - 1]))
	    ];
	    return {
	        widths,
	        kind: "x"
	    };
	}
	function generateImgAttrs(param) {
	    let { config, src, unoptimized, width, quality, sizes, loader } = param;
	    if (unoptimized) {
	        return {
	            src,
	            srcSet: undefined,
	            sizes: undefined
	        };
	    }
	    const { widths, kind } = getWidths(config, width, sizes);
	    const last = widths.length - 1;
	    return {
	        sizes: !sizes && kind === "w" ? "100vw" : sizes,
	        srcSet: widths.map((w, i)=>loader({
	                config,
	                src,
	                quality,
	                width: w
	            }) + " " + (kind === "w" ? w : i + 1) + kind).join(", "),
	        // It's intended to keep `src` the last attribute because React updates
	        // attributes in order. If we keep `src` the first one, Safari will
	        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
	        // updated by React. That causes multiple unnecessary requests if `srcSet`
	        // and `sizes` are defined.
	        // This bug cannot be reproduced in Chrome or Firefox.
	        src: loader({
	            config,
	            src,
	            quality,
	            width: widths[last]
	        })
	    };
	}
	function getImgProps(param, _state) {
	    let { src, sizes, unoptimized = false, priority = false, loading, className, quality, width, height, fill = false, style, overrideSrc, onLoad, onLoadingComplete, placeholder = "empty", blurDataURL, fetchPriority, decoding = "async", layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest } = param;
	    const { imgConf, showAltText, blurComplete, defaultLoader } = _state;
	    let config;
	    let c = imgConf || _imageconfig.imageConfigDefault;
	    if ("allSizes" in c) {
	        config = c;
	    } else {
	        var _c_qualities;
	        const allSizes = [
	            ...c.deviceSizes,
	            ...c.imageSizes
	        ].sort((a, b)=>a - b);
	        const deviceSizes = c.deviceSizes.sort((a, b)=>a - b);
	        const qualities = (_c_qualities = c.qualities) == null ? void 0 : _c_qualities.sort((a, b)=>a - b);
	        config = {
	            ...c,
	            allSizes,
	            deviceSizes,
	            qualities
	        };
	    }
	    if (typeof defaultLoader === "undefined") {
	        throw new Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");
	    }
	    let loader = rest.loader || defaultLoader;
	    // Remove property so it's not spread on <img> element
	    delete rest.loader;
	    delete rest.srcSet;
	    // This special value indicates that the user
	    // didn't define a "loader" prop or "loader" config.
	    const isDefaultLoader = "__next_img_default" in loader;
	    if (isDefaultLoader) {
	        if (config.loader === "custom") {
	            throw new Error('Image with src "' + src + '" is missing "loader" prop.' + "\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader");
	        }
	    } else {
	        // The user defined a "loader" prop or config.
	        // Since the config object is internal only, we
	        // must not pass it to the user-defined "loader".
	        const customImageLoader = loader;
	        loader = (obj)=>{
	            const { config: _, ...opts } = obj;
	            return customImageLoader(opts);
	        };
	    }
	    if (layout) {
	        if (layout === "fill") {
	            fill = true;
	        }
	        const layoutToStyle = {
	            intrinsic: {
	                maxWidth: "100%",
	                height: "auto"
	            },
	            responsive: {
	                width: "100%",
	                height: "auto"
	            }
	        };
	        const layoutToSizes = {
	            responsive: "100vw",
	            fill: "100vw"
	        };
	        const layoutStyle = layoutToStyle[layout];
	        if (layoutStyle) {
	            style = {
	                ...style,
	                ...layoutStyle
	            };
	        }
	        const layoutSizes = layoutToSizes[layout];
	        if (layoutSizes && !sizes) {
	            sizes = layoutSizes;
	        }
	    }
	    let staticSrc = "";
	    let widthInt = getInt(width);
	    let heightInt = getInt(height);
	    let blurWidth;
	    let blurHeight;
	    if (isStaticImport(src)) {
	        const staticImageData = isStaticRequire(src) ? src.default : src;
	        if (!staticImageData.src) {
	            throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received " + JSON.stringify(staticImageData));
	        }
	        if (!staticImageData.height || !staticImageData.width) {
	            throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received " + JSON.stringify(staticImageData));
	        }
	        blurWidth = staticImageData.blurWidth;
	        blurHeight = staticImageData.blurHeight;
	        blurDataURL = blurDataURL || staticImageData.blurDataURL;
	        staticSrc = staticImageData.src;
	        if (!fill) {
	            if (!widthInt && !heightInt) {
	                widthInt = staticImageData.width;
	                heightInt = staticImageData.height;
	            } else if (widthInt && !heightInt) {
	                const ratio = widthInt / staticImageData.width;
	                heightInt = Math.round(staticImageData.height * ratio);
	            } else if (!widthInt && heightInt) {
	                const ratio = heightInt / staticImageData.height;
	                widthInt = Math.round(staticImageData.width * ratio);
	            }
	        }
	    }
	    src = typeof src === "string" ? src : staticSrc;
	    let isLazy = !priority && (loading === "lazy" || typeof loading === "undefined");
	    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
	        // https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
	        unoptimized = true;
	        isLazy = false;
	    }
	    if (config.unoptimized) {
	        unoptimized = true;
	    }
	    if (isDefaultLoader && src.endsWith(".svg") && !config.dangerouslyAllowSVG) {
	        // Special case to make svg serve as-is to avoid proxying
	        // through the built-in Image Optimization API.
	        unoptimized = true;
	    }
	    if (priority) {
	        fetchPriority = "high";
	    }
	    const qualityInt = getInt(quality);
	    if (process.env.NODE_ENV !== "production") {
	        if (config.output === "export" && isDefaultLoader && !unoptimized) {
	            throw new Error("Image Optimization using the default loader is not compatible with `{ output: 'export' }`.\n  Possible solutions:\n    - Remove `{ output: 'export' }` and run \"next start\" to run server mode including the Image Optimization API.\n    - Configure `{ images: { unoptimized: true } }` in `next.config.js` to disable the Image Optimization API.\n  Read more: https://nextjs.org/docs/messages/export-image-api");
	        }
	        if (!src) {
	            // React doesn't show the stack trace and there's
	            // no `src` to help identify which image, so we
	            // instead console.error(ref) during mount.
	            unoptimized = true;
	        } else {
	            if (fill) {
	                if (width) {
	                    throw new Error('Image with src "' + src + '" has both "width" and "fill" properties. Only one should be used.');
	                }
	                if (height) {
	                    throw new Error('Image with src "' + src + '" has both "height" and "fill" properties. Only one should be used.');
	                }
	                if ((style == null ? void 0 : style.position) && style.position !== "absolute") {
	                    throw new Error('Image with src "' + src + '" has both "fill" and "style.position" properties. Images with "fill" always use position absolute - it cannot be modified.');
	                }
	                if ((style == null ? void 0 : style.width) && style.width !== "100%") {
	                    throw new Error('Image with src "' + src + '" has both "fill" and "style.width" properties. Images with "fill" always use width 100% - it cannot be modified.');
	                }
	                if ((style == null ? void 0 : style.height) && style.height !== "100%") {
	                    throw new Error('Image with src "' + src + '" has both "fill" and "style.height" properties. Images with "fill" always use height 100% - it cannot be modified.');
	                }
	            } else {
	                if (typeof widthInt === "undefined") {
	                    throw new Error('Image with src "' + src + '" is missing required "width" property.');
	                } else if (isNaN(widthInt)) {
	                    throw new Error('Image with src "' + src + '" has invalid "width" property. Expected a numeric value in pixels but received "' + width + '".');
	                }
	                if (typeof heightInt === "undefined") {
	                    throw new Error('Image with src "' + src + '" is missing required "height" property.');
	                } else if (isNaN(heightInt)) {
	                    throw new Error('Image with src "' + src + '" has invalid "height" property. Expected a numeric value in pixels but received "' + height + '".');
	                }
	            }
	        }
	        if (!VALID_LOADING_VALUES.includes(loading)) {
	            throw new Error('Image with src "' + src + '" has invalid "loading" property. Provided "' + loading + '" should be one of ' + VALID_LOADING_VALUES.map(String).join(",") + ".");
	        }
	        if (priority && loading === "lazy") {
	            throw new Error('Image with src "' + src + '" has both "priority" and "loading=\'lazy\'" properties. Only one should be used.');
	        }
	        if (placeholder !== "empty" && placeholder !== "blur" && !placeholder.startsWith("data:image/")) {
	            throw new Error('Image with src "' + src + '" has invalid "placeholder" property "' + placeholder + '".');
	        }
	        if (placeholder !== "empty") {
	            if (widthInt && heightInt && widthInt * heightInt < 1600) {
	                (0, _warnonce.warnOnce)('Image with src "' + src + '" is smaller than 40x40. Consider removing the "placeholder" property to improve performance.');
	            }
	        }
	        if (placeholder === "blur" && !blurDataURL) {
	            const VALID_BLUR_EXT = [
	                "jpeg",
	                "png",
	                "webp",
	                "avif"
	            ] // should match next-image-loader
	            ;
	            throw new Error('Image with src "' + src + '" has "placeholder=\'blur\'" property but is missing the "blurDataURL" property.\n        Possible solutions:\n          - Add a "blurDataURL" property, the contents should be a small Data URL to represent the image\n          - Change the "src" property to a static import with one of the supported file types: ' + VALID_BLUR_EXT.join(",") + ' (animated images not supported)\n          - Remove the "placeholder" property, effectively no blur effect\n        Read more: https://nextjs.org/docs/messages/placeholder-blur-data-url');
	        }
	        if ("ref" in rest) {
	            (0, _warnonce.warnOnce)('Image with src "' + src + '" is using unsupported "ref" property. Consider using the "onLoad" property instead.');
	        }
	        if (!unoptimized && !isDefaultLoader) {
	            const urlStr = loader({
	                config,
	                src,
	                width: widthInt || 400,
	                quality: qualityInt || 75
	            });
	            let url;
	            try {
	                url = new URL(urlStr);
	            } catch (err) {}
	            if (urlStr === src || url && url.pathname === src && !url.search) {
	                (0, _warnonce.warnOnce)('Image with src "' + src + '" has a "loader" property that does not implement width. Please implement it or use the "unoptimized" property instead.' + "\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader-width");
	            }
	        }
	        if (onLoadingComplete) {
	            (0, _warnonce.warnOnce)('Image with src "' + src + '" is using deprecated "onLoadingComplete" property. Please use the "onLoad" property instead.');
	        }
	        for (const [legacyKey, legacyValue] of Object.entries({
	            layout,
	            objectFit,
	            objectPosition,
	            lazyBoundary,
	            lazyRoot
	        })){
	            if (legacyValue) {
	                (0, _warnonce.warnOnce)('Image with src "' + src + '" has legacy prop "' + legacyKey + '". Did you forget to run the codemod?' + "\nRead more: https://nextjs.org/docs/messages/next-image-upgrade-to-13");
	            }
	        }
	        if (typeof window !== "undefined" && !perfObserver && window.PerformanceObserver) {
	            perfObserver = new PerformanceObserver((entryList)=>{
	                for (const entry of entryList.getEntries()){
	                    var _entry_element;
	                    // @ts-ignore - missing "LargestContentfulPaint" class with "element" prop
	                    const imgSrc = (entry == null ? void 0 : (_entry_element = entry.element) == null ? void 0 : _entry_element.src) || "";
	                    const lcpImage = allImgs.get(imgSrc);
	                    if (lcpImage && !lcpImage.priority && lcpImage.placeholder === "empty" && !lcpImage.src.startsWith("data:") && !lcpImage.src.startsWith("blob:")) {
	                        // https://web.dev/lcp/#measure-lcp-in-javascript
	                        (0, _warnonce.warnOnce)('Image with src "' + lcpImage.src + '" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.' + "\nRead more: https://nextjs.org/docs/api-reference/next/image#priority");
	                    }
	                }
	            });
	            try {
	                perfObserver.observe({
	                    type: "largest-contentful-paint",
	                    buffered: true
	                });
	            } catch (err) {
	                // Log error but don't crash the app
	                console.error(err);
	            }
	        }
	    }
	    const imgStyle = Object.assign(fill ? {
	        position: "absolute",
	        height: "100%",
	        width: "100%",
	        left: 0,
	        top: 0,
	        right: 0,
	        bottom: 0,
	        objectFit,
	        objectPosition
	    } : {}, showAltText ? {} : {
	        color: "transparent"
	    }, style);
	    const backgroundImage = !blurComplete && placeholder !== "empty" ? placeholder === "blur" ? 'url("data:image/svg+xml;charset=utf-8,' + (0, _imageblursvg.getImageBlurSvg)({
	        widthInt,
	        heightInt,
	        blurWidth,
	        blurHeight,
	        blurDataURL: blurDataURL || "",
	        objectFit: imgStyle.objectFit
	    }) + '")' : 'url("' + placeholder + '")' // assume `data:image/`
	     : null;
	    let placeholderStyle = backgroundImage ? {
	        backgroundSize: imgStyle.objectFit || "cover",
	        backgroundPosition: imgStyle.objectPosition || "50% 50%",
	        backgroundRepeat: "no-repeat",
	        backgroundImage
	    } : {};
	    if (process.env.NODE_ENV === "development") {
	        if (placeholderStyle.backgroundImage && placeholder === "blur" && (blurDataURL == null ? void 0 : blurDataURL.startsWith("/"))) {
	            // During `next dev`, we don't want to generate blur placeholders with webpack
	            // because it can delay starting the dev server. Instead, `next-image-loader.js`
	            // will inline a special url to lazily generate the blur placeholder at request time.
	            placeholderStyle.backgroundImage = 'url("' + blurDataURL + '")';
	        }
	    }
	    const imgAttributes = generateImgAttrs({
	        config,
	        src,
	        unoptimized,
	        width: widthInt,
	        quality: qualityInt,
	        sizes,
	        loader
	    });
	    if (process.env.NODE_ENV !== "production") {
	        if (typeof window !== "undefined") {
	            let fullUrl;
	            try {
	                fullUrl = new URL(imgAttributes.src);
	            } catch (e) {
	                fullUrl = new URL(imgAttributes.src, window.location.href);
	            }
	            allImgs.set(fullUrl.href, {
	                src,
	                priority,
	                placeholder
	            });
	        }
	    }
	    const props = {
	        ...rest,
	        loading: isLazy ? "lazy" : loading,
	        fetchPriority,
	        width: widthInt,
	        height: heightInt,
	        decoding,
	        className,
	        style: {
	            ...imgStyle,
	            ...placeholderStyle
	        },
	        sizes: imgAttributes.sizes,
	        srcSet: imgAttributes.srcSet,
	        src: overrideSrc || imgAttributes.src
	    };
	    const meta = {
	        unoptimized,
	        priority,
	        placeholder,
	        fill
	    };
	    return {
	        props,
	        meta
	    };
	}

	
} (getImgProps));

var imageComponent = {exports: {}};

var _interop_require_wildcard$1 = {};

function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;

    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();

    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
_interop_require_wildcard$1._ = _interop_require_wildcard$1._interop_require_wildcard = _interop_require_wildcard;
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };

    var cache = _getRequireWildcardCache(nodeInterop);

    if (cache && cache.has(obj)) return cache.get(obj);

    var newObj = { __proto__: null };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

    for (var key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }

    newObj.default = obj;

    if (cache) cache.set(obj, newObj);

    return newObj;
}

var head = {exports: {}};

var sideEffect = {};

var hasRequiredSideEffect;

function requireSideEffect () {
	if (hasRequiredSideEffect) return sideEffect;
	hasRequiredSideEffect = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "default", {
		    enumerable: true,
		    get: function() {
		        return SideEffect;
		    }
		});
		const _react = React__default;
		const isServer = typeof window === "undefined";
		const useClientOnlyLayoutEffect = isServer ? ()=>{} : _react.useLayoutEffect;
		const useClientOnlyEffect = isServer ? ()=>{} : _react.useEffect;
		function SideEffect(props) {
		    const { headManager, reduceComponentsToState } = props;
		    function emitChange() {
		        if (headManager && headManager.mountedInstances) {
		            const headElements = _react.Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
		            headManager.updateHead(reduceComponentsToState(headElements, props));
		        }
		    }
		    if (isServer) {
		        var _headManager_mountedInstances;
		        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
		        emitChange();
		    }
		    useClientOnlyLayoutEffect(()=>{
		        var _headManager_mountedInstances;
		        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
		        return ()=>{
		            var _headManager_mountedInstances;
		            headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.delete(props.children);
		        };
		    });
		    // We need to call `updateHead` method whenever the `SideEffect` is trigger in all
		    // life-cycles: mount, update, unmount. However, if there are multiple `SideEffect`s
		    // being rendered, we only trigger the method from the last one.
		    // This is ensured by keeping the last unflushed `updateHead` in the `_pendingUpdate`
		    // singleton in the layout effect pass, and actually trigger it in the effect pass.
		    useClientOnlyLayoutEffect(()=>{
		        if (headManager) {
		            headManager._pendingUpdate = emitChange;
		        }
		        return ()=>{
		            if (headManager) {
		                headManager._pendingUpdate = emitChange;
		            }
		        };
		    });
		    useClientOnlyEffect(()=>{
		        if (headManager && headManager._pendingUpdate) {
		            headManager._pendingUpdate();
		            headManager._pendingUpdate = null;
		        }
		        return ()=>{
		            if (headManager && headManager._pendingUpdate) {
		                headManager._pendingUpdate();
		                headManager._pendingUpdate = null;
		            }
		        };
		    });
		    return null;
		}

		
	} (sideEffect));
	return sideEffect;
}

var ampContext_sharedRuntime = {};

var hasRequiredAmpContext_sharedRuntime;

function requireAmpContext_sharedRuntime () {
	if (hasRequiredAmpContext_sharedRuntime) return ampContext_sharedRuntime;
	hasRequiredAmpContext_sharedRuntime = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "AmpStateContext", {
		    enumerable: true,
		    get: function() {
		        return AmpStateContext;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _react = /*#__PURE__*/ _interop_require_default._(React__default);
		const AmpStateContext = _react.default.createContext({});
		if (process.env.NODE_ENV !== "production") {
		    AmpStateContext.displayName = "AmpStateContext";
		}

		
	} (ampContext_sharedRuntime));
	return ampContext_sharedRuntime;
}

var headManagerContext_sharedRuntime = {};

var hasRequiredHeadManagerContext_sharedRuntime;

function requireHeadManagerContext_sharedRuntime () {
	if (hasRequiredHeadManagerContext_sharedRuntime) return headManagerContext_sharedRuntime;
	hasRequiredHeadManagerContext_sharedRuntime = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "HeadManagerContext", {
		    enumerable: true,
		    get: function() {
		        return HeadManagerContext;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _react = /*#__PURE__*/ _interop_require_default._(React__default);
		const HeadManagerContext = _react.default.createContext({});
		if (process.env.NODE_ENV !== "production") {
		    HeadManagerContext.displayName = "HeadManagerContext";
		}

		
	} (headManagerContext_sharedRuntime));
	return headManagerContext_sharedRuntime;
}

var ampMode = {};

var hasRequiredAmpMode;

function requireAmpMode () {
	if (hasRequiredAmpMode) return ampMode;
	hasRequiredAmpMode = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "isInAmpMode", {
		    enumerable: true,
		    get: function() {
		        return isInAmpMode;
		    }
		});
		function isInAmpMode(param) {
		    let { ampFirst = false, hybrid = false, hasQuery = false } = param === void 0 ? {} : param;
		    return ampFirst || hybrid && hasQuery;
		}

		
	} (ampMode));
	return ampMode;
}

var hasRequiredHead;

function requireHead () {
	if (hasRequiredHead) return head.exports;
	hasRequiredHead = 1;
	(function (module, exports) {
		"use client";
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    default: function() {
		        return _default;
		    },
		    defaultHead: function() {
		        return defaultHead;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _interop_require_wildcard = _interop_require_wildcard$1;
		const _jsxruntime = require$$2;
		const _react = /*#__PURE__*/ _interop_require_wildcard._(React__default);
		const _sideeffect = /*#__PURE__*/ _interop_require_default._(requireSideEffect());
		const _ampcontextsharedruntime = requireAmpContext_sharedRuntime();
		const _headmanagercontextsharedruntime = requireHeadManagerContext_sharedRuntime();
		const _ampmode = requireAmpMode();
		const _warnonce = warnOnce;
		function defaultHead(inAmpMode) {
		    if (inAmpMode === void 0) inAmpMode = false;
		    const head = [
		        /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
		            charSet: "utf-8"
		        })
		    ];
		    if (!inAmpMode) {
		        head.push(/*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
		            name: "viewport",
		            content: "width=device-width"
		        }));
		    }
		    return head;
		}
		function onlyReactElement(list, child) {
		    // React children can be "string" or "number" in this case we ignore them for backwards compat
		    if (typeof child === "string" || typeof child === "number") {
		        return list;
		    }
		    // Adds support for React.Fragment
		    if (child.type === _react.default.Fragment) {
		        return list.concat(// @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
		        _react.default.Children.toArray(child.props.children).reduce(// @ts-expect-error @types/react does not remove fragments but this could also return ReactPortal[]
		        (fragmentList, fragmentChild)=>{
		            if (typeof fragmentChild === "string" || typeof fragmentChild === "number") {
		                return fragmentList;
		            }
		            return fragmentList.concat(fragmentChild);
		        }, []));
		    }
		    return list.concat(child);
		}
		const METATYPES = [
		    "name",
		    "httpEquiv",
		    "charSet",
		    "itemProp"
		];
		/*
		 returns a function for filtering head child elements
		 which shouldn't be duplicated, like <title/>
		 Also adds support for deduplicated `key` properties
		*/ function unique() {
		    const keys = new Set();
		    const tags = new Set();
		    const metaTypes = new Set();
		    const metaCategories = {};
		    return (h)=>{
		        let isUnique = true;
		        let hasKey = false;
		        if (h.key && typeof h.key !== "number" && h.key.indexOf("$") > 0) {
		            hasKey = true;
		            const key = h.key.slice(h.key.indexOf("$") + 1);
		            if (keys.has(key)) {
		                isUnique = false;
		            } else {
		                keys.add(key);
		            }
		        }
		        // eslint-disable-next-line default-case
		        switch(h.type){
		            case "title":
		            case "base":
		                if (tags.has(h.type)) {
		                    isUnique = false;
		                } else {
		                    tags.add(h.type);
		                }
		                break;
		            case "meta":
		                for(let i = 0, len = METATYPES.length; i < len; i++){
		                    const metatype = METATYPES[i];
		                    if (!h.props.hasOwnProperty(metatype)) continue;
		                    if (metatype === "charSet") {
		                        if (metaTypes.has(metatype)) {
		                            isUnique = false;
		                        } else {
		                            metaTypes.add(metatype);
		                        }
		                    } else {
		                        const category = h.props[metatype];
		                        const categories = metaCategories[metatype] || new Set();
		                        if ((metatype !== "name" || !hasKey) && categories.has(category)) {
		                            isUnique = false;
		                        } else {
		                            categories.add(category);
		                            metaCategories[metatype] = categories;
		                        }
		                    }
		                }
		                break;
		        }
		        return isUnique;
		    };
		}
		/**
		 *
		 * @param headChildrenElements List of children of <Head>
		 */ function reduceComponents(headChildrenElements, props) {
		    const { inAmpMode } = props;
		    return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(defaultHead(inAmpMode).reverse()).filter(unique()).reverse().map((c, i)=>{
		        const key = c.key || i;
		        if (process.env.NODE_ENV !== "development" && process.env.__NEXT_OPTIMIZE_FONTS && !inAmpMode) {
		            if (c.type === "link" && c.props["href"] && // TODO(prateekbh@): Replace this with const from `constants` when the tree shaking works.
		            [
		                "https://fonts.googleapis.com/css",
		                "https://use.typekit.net/"
		            ].some((url)=>c.props["href"].startsWith(url))) {
		                const newProps = {
		                    ...c.props || {}
		                };
		                newProps["data-href"] = newProps["href"];
		                newProps["href"] = undefined;
		                // Add this attribute to make it easy to identify optimized tags
		                newProps["data-optimized-fonts"] = true;
		                return /*#__PURE__*/ _react.default.cloneElement(c, newProps);
		            }
		        }
		        if (process.env.NODE_ENV === "development") {
		            // omit JSON-LD structured data snippets from the warning
		            if (c.type === "script" && c.props["type"] !== "application/ld+json") {
		                const srcMessage = c.props["src"] ? '<script> tag with src="' + c.props["src"] + '"' : "inline <script>";
		                (0, _warnonce.warnOnce)("Do not add <script> tags using next/head (see " + srcMessage + "). Use next/script instead. \nSee more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component");
		            } else if (c.type === "link" && c.props["rel"] === "stylesheet") {
		                (0, _warnonce.warnOnce)('Do not add stylesheets using next/head (see <link rel="stylesheet"> tag with href="' + c.props["href"] + '"). Use Document instead. \nSee more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component');
		            }
		        }
		        return /*#__PURE__*/ _react.default.cloneElement(c, {
		            key
		        });
		    });
		}
		/**
		 * This component injects elements to `<head>` of your page.
		 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
		 */ function Head(param) {
		    let { children } = param;
		    const ampState = (0, _react.useContext)(_ampcontextsharedruntime.AmpStateContext);
		    const headManager = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
		    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_sideeffect.default, {
		        reduceComponentsToState: reduceComponents,
		        headManager: headManager,
		        inAmpMode: (0, _ampmode.isInAmpMode)(ampState),
		        children: children
		    });
		}
		const _default = Head;

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (head, head.exports));
	return head.exports;
}

var imageConfigContext_sharedRuntime = {};

var hasRequiredImageConfigContext_sharedRuntime;

function requireImageConfigContext_sharedRuntime () {
	if (hasRequiredImageConfigContext_sharedRuntime) return imageConfigContext_sharedRuntime;
	hasRequiredImageConfigContext_sharedRuntime = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "ImageConfigContext", {
		    enumerable: true,
		    get: function() {
		        return ImageConfigContext;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _react = /*#__PURE__*/ _interop_require_default._(React__default);
		const _imageconfig = imageConfig;
		const ImageConfigContext = _react.default.createContext(_imageconfig.imageConfigDefault);
		if (process.env.NODE_ENV !== "production") {
		    ImageConfigContext.displayName = "ImageConfigContext";
		}

		
	} (imageConfigContext_sharedRuntime));
	return imageConfigContext_sharedRuntime;
}

var routerContext_sharedRuntime = {};

var hasRequiredRouterContext_sharedRuntime;

function requireRouterContext_sharedRuntime () {
	if (hasRequiredRouterContext_sharedRuntime) return routerContext_sharedRuntime;
	hasRequiredRouterContext_sharedRuntime = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "RouterContext", {
		    enumerable: true,
		    get: function() {
		        return RouterContext;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _react = /*#__PURE__*/ _interop_require_default._(React__default);
		const RouterContext = _react.default.createContext(null);
		if (process.env.NODE_ENV !== "production") {
		    RouterContext.displayName = "RouterContext";
		}

		
	} (routerContext_sharedRuntime));
	return routerContext_sharedRuntime;
}

var imageLoader = {};

var matchLocalPattern = {};

var picomatch = {exports: {}};

var hasRequiredPicomatch;

function requirePicomatch () {
	if (hasRequiredPicomatch) return picomatch.exports;
	hasRequiredPicomatch = 1;
	(()=>{var t={170:(t,e,u)=>{const n=u(510);const isWindows=()=>{if(typeof navigator!=="undefined"&&navigator.platform){const t=navigator.platform.toLowerCase();return t==="win32"||t==="windows"}if(typeof process!=="undefined"&&process.platform){return process.platform==="win32"}return false};function picomatch(t,e,u=false){if(e&&(e.windows===null||e.windows===undefined)){e={...e,windows:isWindows()};}return n(t,e,u)}Object.assign(picomatch,n);t.exports=picomatch;},154:t=>{const e="\\\\/";const u=`[^${e}]`;const n="\\.";const o="\\+";const s="\\?";const r="\\/";const a="(?=.)";const i="[^/]";const c=`(?:${r}|$)`;const p=`(?:^|${r})`;const l=`${n}{1,2}${c}`;const f=`(?!${n})`;const A=`(?!${p}${l})`;const _=`(?!${n}{0,1}${c})`;const R=`(?!${l})`;const E=`[^.${r}]`;const h=`${i}*?`;const g="/";const b={DOT_LITERAL:n,PLUS_LITERAL:o,QMARK_LITERAL:s,SLASH_LITERAL:r,ONE_CHAR:a,QMARK:i,END_ANCHOR:c,DOTS_SLASH:l,NO_DOT:f,NO_DOTS:A,NO_DOT_SLASH:_,NO_DOTS_SLASH:R,QMARK_NO_DOT:E,STAR:h,START_ANCHOR:p,SEP:g};const C={...b,SLASH_LITERAL:`[${e}]`,QMARK:u,STAR:`${u}*?`,DOTS_SLASH:`${n}{1,2}(?:[${e}]|$)`,NO_DOT:`(?!${n})`,NO_DOTS:`(?!(?:^|[${e}])${n}{1,2}(?:[${e}]|$))`,NO_DOT_SLASH:`(?!${n}{0,1}(?:[${e}]|$))`,NO_DOTS_SLASH:`(?!${n}{1,2}(?:[${e}]|$))`,QMARK_NO_DOT:`[^.${e}]`,START_ANCHOR:`(?:^|[${e}])`,END_ANCHOR:`(?:[${e}]|$)`,SEP:"\\"};const y={alnum:"a-zA-Z0-9",alpha:"a-zA-Z",ascii:"\\x00-\\x7F",blank:" \\t",cntrl:"\\x00-\\x1F\\x7F",digit:"0-9",graph:"\\x21-\\x7E",lower:"a-z",print:"\\x20-\\x7E ",punct:"\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",space:" \\t\\r\\n\\v\\f",upper:"A-Z",word:"A-Za-z0-9_",xdigit:"A-Fa-f0-9"};t.exports={MAX_LENGTH:1024*64,POSIX_REGEX_SOURCE:y,REGEX_BACKSLASH:/\\(?![*+?^${}(|)[\]])/g,REGEX_NON_SPECIAL_CHARS:/^[^@![\].,$*+?^{}()|\\/]+/,REGEX_SPECIAL_CHARS:/[-*+?.^${}(|)[\]]/,REGEX_SPECIAL_CHARS_BACKREF:/(\\?)((\W)(\3*))/g,REGEX_SPECIAL_CHARS_GLOBAL:/([-*+?.^${}(|)[\]])/g,REGEX_REMOVE_BACKSLASH:/(?:\[.*?[^\\]\]|\\(?=.))/g,REPLACEMENTS:{"***":"*","**/**":"**","**/**/**":"**"},CHAR_0:48,CHAR_9:57,CHAR_UPPERCASE_A:65,CHAR_LOWERCASE_A:97,CHAR_UPPERCASE_Z:90,CHAR_LOWERCASE_Z:122,CHAR_LEFT_PARENTHESES:40,CHAR_RIGHT_PARENTHESES:41,CHAR_ASTERISK:42,CHAR_AMPERSAND:38,CHAR_AT:64,CHAR_BACKWARD_SLASH:92,CHAR_CARRIAGE_RETURN:13,CHAR_CIRCUMFLEX_ACCENT:94,CHAR_COLON:58,CHAR_COMMA:44,CHAR_DOT:46,CHAR_DOUBLE_QUOTE:34,CHAR_EQUAL:61,CHAR_EXCLAMATION_MARK:33,CHAR_FORM_FEED:12,CHAR_FORWARD_SLASH:47,CHAR_GRAVE_ACCENT:96,CHAR_HASH:35,CHAR_HYPHEN_MINUS:45,CHAR_LEFT_ANGLE_BRACKET:60,CHAR_LEFT_CURLY_BRACE:123,CHAR_LEFT_SQUARE_BRACKET:91,CHAR_LINE_FEED:10,CHAR_NO_BREAK_SPACE:160,CHAR_PERCENT:37,CHAR_PLUS:43,CHAR_QUESTION_MARK:63,CHAR_RIGHT_ANGLE_BRACKET:62,CHAR_RIGHT_CURLY_BRACE:125,CHAR_RIGHT_SQUARE_BRACKET:93,CHAR_SEMICOLON:59,CHAR_SINGLE_QUOTE:39,CHAR_SPACE:32,CHAR_TAB:9,CHAR_UNDERSCORE:95,CHAR_VERTICAL_LINE:124,CHAR_ZERO_WIDTH_NOBREAK_SPACE:65279,extglobChars(t){return {"!":{type:"negate",open:"(?:(?!(?:",close:`))${t.STAR})`},"?":{type:"qmark",open:"(?:",close:")?"},"+":{type:"plus",open:"(?:",close:")+"},"*":{type:"star",open:"(?:",close:")*"},"@":{type:"at",open:"(?:",close:")"}}},globChars(t){return t===true?C:b}};},697:(t,e,u)=>{const n=u(154);const o=u(96);const{MAX_LENGTH:s,POSIX_REGEX_SOURCE:r,REGEX_NON_SPECIAL_CHARS:a,REGEX_SPECIAL_CHARS_BACKREF:i,REPLACEMENTS:c}=n;const expandRange=(t,e)=>{if(typeof e.expandRange==="function"){return e.expandRange(...t,e)}t.sort();const u=`[${t.join("-")}]`;try{new RegExp(u);}catch(e){return t.map((t=>o.escapeRegex(t))).join("..")}return u};const syntaxError=(t,e)=>`Missing ${t}: "${e}" - use "\\\\${e}" to match literal characters`;const parse=(t,e)=>{if(typeof t!=="string"){throw new TypeError("Expected a string")}t=c[t]||t;const u={...e};const p=typeof u.maxLength==="number"?Math.min(s,u.maxLength):s;let l=t.length;if(l>p){throw new SyntaxError(`Input length: ${l}, exceeds maximum allowed length: ${p}`)}const f={type:"bos",value:"",output:u.prepend||""};const A=[f];const _=u.capture?"":"?:";const R=n.globChars(u.windows);const E=n.extglobChars(R);const{DOT_LITERAL:h,PLUS_LITERAL:g,SLASH_LITERAL:b,ONE_CHAR:C,DOTS_SLASH:y,NO_DOT:$,NO_DOT_SLASH:x,NO_DOTS_SLASH:S,QMARK:H,QMARK_NO_DOT:v,STAR:d,START_ANCHOR:L}=R;const globstar=t=>`(${_}(?:(?!${L}${t.dot?y:h}).)*?)`;const T=u.dot?"":$;const O=u.dot?H:v;let k=u.bash===true?globstar(u):d;if(u.capture){k=`(${k})`;}if(typeof u.noext==="boolean"){u.noextglob=u.noext;}const m={input:t,index:-1,start:0,dot:u.dot===true,consumed:"",output:"",prefix:"",backtrack:false,negated:false,brackets:0,braces:0,parens:0,quotes:0,globstar:false,tokens:A};t=o.removePrefix(t,m);l=t.length;const w=[];const N=[];const I=[];let B=f;let G;const eos=()=>m.index===l-1;const D=m.peek=(e=1)=>t[m.index+e];const M=m.advance=()=>t[++m.index]||"";const remaining=()=>t.slice(m.index+1);const consume=(t="",e=0)=>{m.consumed+=t;m.index+=e;};const append=t=>{m.output+=t.output!=null?t.output:t.value;consume(t.value);};const negate=()=>{let t=1;while(D()==="!"&&(D(2)!=="("||D(3)==="?")){M();m.start++;t++;}if(t%2===0){return false}m.negated=true;m.start++;return true};const increment=t=>{m[t]++;I.push(t);};const decrement=t=>{m[t]--;I.pop();};const push=t=>{if(B.type==="globstar"){const e=m.braces>0&&(t.type==="comma"||t.type==="brace");const u=t.extglob===true||w.length&&(t.type==="pipe"||t.type==="paren");if(t.type!=="slash"&&t.type!=="paren"&&!e&&!u){m.output=m.output.slice(0,-B.output.length);B.type="star";B.value="*";B.output=k;m.output+=B.output;}}if(w.length&&t.type!=="paren"){w[w.length-1].inner+=t.value;}if(t.value||t.output)append(t);if(B&&B.type==="text"&&t.type==="text"){B.output=(B.output||B.value)+t.value;B.value+=t.value;return}t.prev=B;A.push(t);B=t;};const extglobOpen=(t,e)=>{const n={...E[e],conditions:1,inner:""};n.prev=B;n.parens=m.parens;n.output=m.output;const o=(u.capture?"(":"")+n.open;increment("parens");push({type:t,value:e,output:m.output?"":C});push({type:"paren",extglob:true,value:M(),output:o});w.push(n);};const extglobClose=t=>{let n=t.close+(u.capture?")":"");let o;if(t.type==="negate"){let s=k;if(t.inner&&t.inner.length>1&&t.inner.includes("/")){s=globstar(u);}if(s!==k||eos()||/^\)+$/.test(remaining())){n=t.close=`)$))${s}`;}if(t.inner.includes("*")&&(o=remaining())&&/^\.[^\\/.]+$/.test(o)){const u=parse(o,{...e,fastpaths:false}).output;n=t.close=`)${u})${s})`;}if(t.prev.type==="bos"){m.negatedExtglob=true;}}push({type:"paren",extglob:true,value:G,output:n});decrement("parens");};if(u.fastpaths!==false&&!/(^[*!]|[/()[\]{}"])/.test(t)){let n=false;let s=t.replace(i,((t,e,u,o,s,r)=>{if(o==="\\"){n=true;return t}if(o==="?"){if(e){return e+o+(s?H.repeat(s.length):"")}if(r===0){return O+(s?H.repeat(s.length):"")}return H.repeat(u.length)}if(o==="."){return h.repeat(u.length)}if(o==="*"){if(e){return e+o+(s?k:"")}return k}return e?t:`\\${t}`}));if(n===true){if(u.unescape===true){s=s.replace(/\\/g,"");}else {s=s.replace(/\\+/g,(t=>t.length%2===0?"\\\\":t?"\\":""));}}if(s===t&&u.contains===true){m.output=t;return m}m.output=o.wrapOutput(s,m,e);return m}while(!eos()){G=M();if(G==="\0"){continue}if(G==="\\"){const t=D();if(t==="/"&&u.bash!==true){continue}if(t==="."||t===";"){continue}if(!t){G+="\\";push({type:"text",value:G});continue}const e=/^\\+/.exec(remaining());let n=0;if(e&&e[0].length>2){n=e[0].length;m.index+=n;if(n%2!==0){G+="\\";}}if(u.unescape===true){G=M();}else {G+=M();}if(m.brackets===0){push({type:"text",value:G});continue}}if(m.brackets>0&&(G!=="]"||B.value==="["||B.value==="[^")){if(u.posix!==false&&G===":"){const t=B.value.slice(1);if(t.includes("[")){B.posix=true;if(t.includes(":")){const t=B.value.lastIndexOf("[");const e=B.value.slice(0,t);const u=B.value.slice(t+2);const n=r[u];if(n){B.value=e+n;m.backtrack=true;M();if(!f.output&&A.indexOf(B)===1){f.output=C;}continue}}}}if(G==="["&&D()!==":"||G==="-"&&D()==="]"){G=`\\${G}`;}if(G==="]"&&(B.value==="["||B.value==="[^")){G=`\\${G}`;}if(u.posix===true&&G==="!"&&B.value==="["){G="^";}B.value+=G;append({value:G});continue}if(m.quotes===1&&G!=='"'){G=o.escapeRegex(G);B.value+=G;append({value:G});continue}if(G==='"'){m.quotes=m.quotes===1?0:1;if(u.keepQuotes===true){push({type:"text",value:G});}continue}if(G==="("){increment("parens");push({type:"paren",value:G});continue}if(G===")"){if(m.parens===0&&u.strictBrackets===true){throw new SyntaxError(syntaxError("opening","("))}const t=w[w.length-1];if(t&&m.parens===t.parens+1){extglobClose(w.pop());continue}push({type:"paren",value:G,output:m.parens?")":"\\)"});decrement("parens");continue}if(G==="["){if(u.nobracket===true||!remaining().includes("]")){if(u.nobracket!==true&&u.strictBrackets===true){throw new SyntaxError(syntaxError("closing","]"))}G=`\\${G}`;}else {increment("brackets");}push({type:"bracket",value:G});continue}if(G==="]"){if(u.nobracket===true||B&&B.type==="bracket"&&B.value.length===1){push({type:"text",value:G,output:`\\${G}`});continue}if(m.brackets===0){if(u.strictBrackets===true){throw new SyntaxError(syntaxError("opening","["))}push({type:"text",value:G,output:`\\${G}`});continue}decrement("brackets");const t=B.value.slice(1);if(B.posix!==true&&t[0]==="^"&&!t.includes("/")){G=`/${G}`;}B.value+=G;append({value:G});if(u.literalBrackets===false||o.hasRegexChars(t)){continue}const e=o.escapeRegex(B.value);m.output=m.output.slice(0,-B.value.length);if(u.literalBrackets===true){m.output+=e;B.value=e;continue}B.value=`(${_}${e}|${B.value})`;m.output+=B.value;continue}if(G==="{"&&u.nobrace!==true){increment("braces");const t={type:"brace",value:G,output:"(",outputIndex:m.output.length,tokensIndex:m.tokens.length};N.push(t);push(t);continue}if(G==="}"){const t=N[N.length-1];if(u.nobrace===true||!t){push({type:"text",value:G,output:G});continue}let e=")";if(t.dots===true){const t=A.slice();const n=[];for(let e=t.length-1;e>=0;e--){A.pop();if(t[e].type==="brace"){break}if(t[e].type!=="dots"){n.unshift(t[e].value);}}e=expandRange(n,u);m.backtrack=true;}if(t.comma!==true&&t.dots!==true){const u=m.output.slice(0,t.outputIndex);const n=m.tokens.slice(t.tokensIndex);t.value=t.output="\\{";G=e="\\}";m.output=u;for(const t of n){m.output+=t.output||t.value;}}push({type:"brace",value:G,output:e});decrement("braces");N.pop();continue}if(G==="|"){if(w.length>0){w[w.length-1].conditions++;}push({type:"text",value:G});continue}if(G===","){let t=G;const e=N[N.length-1];if(e&&I[I.length-1]==="braces"){e.comma=true;t="|";}push({type:"comma",value:G,output:t});continue}if(G==="/"){if(B.type==="dot"&&m.index===m.start+1){m.start=m.index+1;m.consumed="";m.output="";A.pop();B=f;continue}push({type:"slash",value:G,output:b});continue}if(G==="."){if(m.braces>0&&B.type==="dot"){if(B.value===".")B.output=h;const t=N[N.length-1];B.type="dots";B.output+=G;B.value+=G;t.dots=true;continue}if(m.braces+m.parens===0&&B.type!=="bos"&&B.type!=="slash"){push({type:"text",value:G,output:h});continue}push({type:"dot",value:G,output:h});continue}if(G==="?"){const t=B&&B.value==="(";if(!t&&u.noextglob!==true&&D()==="("&&D(2)!=="?"){extglobOpen("qmark",G);continue}if(B&&B.type==="paren"){const t=D();let e=G;if(B.value==="("&&!/[!=<:]/.test(t)||t==="<"&&!/<([!=]|\w+>)/.test(remaining())){e=`\\${G}`;}push({type:"text",value:G,output:e});continue}if(u.dot!==true&&(B.type==="slash"||B.type==="bos")){push({type:"qmark",value:G,output:v});continue}push({type:"qmark",value:G,output:H});continue}if(G==="!"){if(u.noextglob!==true&&D()==="("){if(D(2)!=="?"||!/[!=<:]/.test(D(3))){extglobOpen("negate",G);continue}}if(u.nonegate!==true&&m.index===0){negate();continue}}if(G==="+"){if(u.noextglob!==true&&D()==="("&&D(2)!=="?"){extglobOpen("plus",G);continue}if(B&&B.value==="("||u.regex===false){push({type:"plus",value:G,output:g});continue}if(B&&(B.type==="bracket"||B.type==="paren"||B.type==="brace")||m.parens>0){push({type:"plus",value:G});continue}push({type:"plus",value:g});continue}if(G==="@"){if(u.noextglob!==true&&D()==="("&&D(2)!=="?"){push({type:"at",extglob:true,value:G,output:""});continue}push({type:"text",value:G});continue}if(G!=="*"){if(G==="$"||G==="^"){G=`\\${G}`;}const t=a.exec(remaining());if(t){G+=t[0];m.index+=t[0].length;}push({type:"text",value:G});continue}if(B&&(B.type==="globstar"||B.star===true)){B.type="star";B.star=true;B.value+=G;B.output=k;m.backtrack=true;m.globstar=true;consume(G);continue}let e=remaining();if(u.noextglob!==true&&/^\([^?]/.test(e)){extglobOpen("star",G);continue}if(B.type==="star"){if(u.noglobstar===true){consume(G);continue}const n=B.prev;const o=n.prev;const s=n.type==="slash"||n.type==="bos";const r=o&&(o.type==="star"||o.type==="globstar");if(u.bash===true&&(!s||e[0]&&e[0]!=="/")){push({type:"star",value:G,output:""});continue}const a=m.braces>0&&(n.type==="comma"||n.type==="brace");const i=w.length&&(n.type==="pipe"||n.type==="paren");if(!s&&n.type!=="paren"&&!a&&!i){push({type:"star",value:G,output:""});continue}while(e.slice(0,3)==="/**"){const u=t[m.index+4];if(u&&u!=="/"){break}e=e.slice(3);consume("/**",3);}if(n.type==="bos"&&eos()){B.type="globstar";B.value+=G;B.output=globstar(u);m.output=B.output;m.globstar=true;consume(G);continue}if(n.type==="slash"&&n.prev.type!=="bos"&&!r&&eos()){m.output=m.output.slice(0,-(n.output+B.output).length);n.output=`(?:${n.output}`;B.type="globstar";B.output=globstar(u)+(u.strictSlashes?")":"|$)");B.value+=G;m.globstar=true;m.output+=n.output+B.output;consume(G);continue}if(n.type==="slash"&&n.prev.type!=="bos"&&e[0]==="/"){const t=e[1]!==void 0?"|$":"";m.output=m.output.slice(0,-(n.output+B.output).length);n.output=`(?:${n.output}`;B.type="globstar";B.output=`${globstar(u)}${b}|${b}${t})`;B.value+=G;m.output+=n.output+B.output;m.globstar=true;consume(G+M());push({type:"slash",value:"/",output:""});continue}if(n.type==="bos"&&e[0]==="/"){B.type="globstar";B.value+=G;B.output=`(?:^|${b}|${globstar(u)}${b})`;m.output=B.output;m.globstar=true;consume(G+M());push({type:"slash",value:"/",output:""});continue}m.output=m.output.slice(0,-B.output.length);B.type="globstar";B.output=globstar(u);B.value+=G;m.output+=B.output;m.globstar=true;consume(G);continue}const n={type:"star",value:G,output:k};if(u.bash===true){n.output=".*?";if(B.type==="bos"||B.type==="slash"){n.output=T+n.output;}push(n);continue}if(B&&(B.type==="bracket"||B.type==="paren")&&u.regex===true){n.output=G;push(n);continue}if(m.index===m.start||B.type==="slash"||B.type==="dot"){if(B.type==="dot"){m.output+=x;B.output+=x;}else if(u.dot===true){m.output+=S;B.output+=S;}else {m.output+=T;B.output+=T;}if(D()!=="*"){m.output+=C;B.output+=C;}}push(n);}while(m.brackets>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing","]"));m.output=o.escapeLast(m.output,"[");decrement("brackets");}while(m.parens>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing",")"));m.output=o.escapeLast(m.output,"(");decrement("parens");}while(m.braces>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing","}"));m.output=o.escapeLast(m.output,"{");decrement("braces");}if(u.strictSlashes!==true&&(B.type==="star"||B.type==="bracket")){push({type:"maybe_slash",value:"",output:`${b}?`});}if(m.backtrack===true){m.output="";for(const t of m.tokens){m.output+=t.output!=null?t.output:t.value;if(t.suffix){m.output+=t.suffix;}}}return m};parse.fastpaths=(t,e)=>{const u={...e};const r=typeof u.maxLength==="number"?Math.min(s,u.maxLength):s;const a=t.length;if(a>r){throw new SyntaxError(`Input length: ${a}, exceeds maximum allowed length: ${r}`)}t=c[t]||t;const{DOT_LITERAL:i,SLASH_LITERAL:p,ONE_CHAR:l,DOTS_SLASH:f,NO_DOT:A,NO_DOTS:_,NO_DOTS_SLASH:R,STAR:E,START_ANCHOR:h}=n.globChars(u.windows);const g=u.dot?_:A;const b=u.dot?R:A;const C=u.capture?"":"?:";const y={negated:false,prefix:""};let $=u.bash===true?".*?":E;if(u.capture){$=`(${$})`;}const globstar=t=>{if(t.noglobstar===true)return $;return `(${C}(?:(?!${h}${t.dot?f:i}).)*?)`};const create=t=>{switch(t){case "*":return `${g}${l}${$}`;case ".*":return `${i}${l}${$}`;case "*.*":return `${g}${$}${i}${l}${$}`;case "*/*":return `${g}${$}${p}${l}${b}${$}`;case "**":return g+globstar(u);case "**/*":return `(?:${g}${globstar(u)}${p})?${b}${l}${$}`;case "**/*.*":return `(?:${g}${globstar(u)}${p})?${b}${$}${i}${l}${$}`;case "**/.*":return `(?:${g}${globstar(u)}${p})?${i}${l}${$}`;default:{const e=/^(.*?)\.(\w+)$/.exec(t);if(!e)return;const u=create(e[1]);if(!u)return;return u+i+e[2]}}};const x=o.removePrefix(t,y);let S=create(x);if(S&&u.strictSlashes!==true){S+=`${p}?`;}return S};t.exports=parse;},510:(t,e,u)=>{const n=u(716);const o=u(697);const s=u(96);const r=u(154);const isObject=t=>t&&typeof t==="object"&&!Array.isArray(t);const picomatch=(t,e,u=false)=>{if(Array.isArray(t)){const n=t.map((t=>picomatch(t,e,u)));const arrayMatcher=t=>{for(const e of n){const u=e(t);if(u)return u}return false};return arrayMatcher}const n=isObject(t)&&t.tokens&&t.input;if(t===""||typeof t!=="string"&&!n){throw new TypeError("Expected pattern to be a non-empty string")}const o=e||{};const s=o.windows;const r=n?picomatch.compileRe(t,e):picomatch.makeRe(t,e,false,true);const a=r.state;delete r.state;let isIgnored=()=>false;if(o.ignore){const t={...e,ignore:null,onMatch:null,onResult:null};isIgnored=picomatch(o.ignore,t,u);}const matcher=(u,n=false)=>{const{isMatch:i,match:c,output:p}=picomatch.test(u,r,e,{glob:t,posix:s});const l={glob:t,state:a,regex:r,posix:s,input:u,output:p,match:c,isMatch:i};if(typeof o.onResult==="function"){o.onResult(l);}if(i===false){l.isMatch=false;return n?l:false}if(isIgnored(u)){if(typeof o.onIgnore==="function"){o.onIgnore(l);}l.isMatch=false;return n?l:false}if(typeof o.onMatch==="function"){o.onMatch(l);}return n?l:true};if(u){matcher.state=a;}return matcher};picomatch.test=(t,e,u,{glob:n,posix:o}={})=>{if(typeof t!=="string"){throw new TypeError("Expected input to be a string")}if(t===""){return {isMatch:false,output:""}}const r=u||{};const a=r.format||(o?s.toPosixSlashes:null);let i=t===n;let c=i&&a?a(t):t;if(i===false){c=a?a(t):t;i=c===n;}if(i===false||r.capture===true){if(r.matchBase===true||r.basename===true){i=picomatch.matchBase(t,e,u,o);}else {i=e.exec(c);}}return {isMatch:Boolean(i),match:i,output:c}};picomatch.matchBase=(t,e,u)=>{const n=e instanceof RegExp?e:picomatch.makeRe(e,u);return n.test(s.basename(t))};picomatch.isMatch=(t,e,u)=>picomatch(e,u)(t);picomatch.parse=(t,e)=>{if(Array.isArray(t))return t.map((t=>picomatch.parse(t,e)));return o(t,{...e,fastpaths:false})};picomatch.scan=(t,e)=>n(t,e);picomatch.compileRe=(t,e,u=false,n=false)=>{if(u===true){return t.output}const o=e||{};const s=o.contains?"":"^";const r=o.contains?"":"$";let a=`${s}(?:${t.output})${r}`;if(t&&t.negated===true){a=`^(?!${a}).*$`;}const i=picomatch.toRegex(a,e);if(n===true){i.state=t;}return i};picomatch.makeRe=(t,e={},u=false,n=false)=>{if(!t||typeof t!=="string"){throw new TypeError("Expected a non-empty string")}let s={negated:false,fastpaths:true};if(e.fastpaths!==false&&(t[0]==="."||t[0]==="*")){s.output=o.fastpaths(t,e);}if(!s.output){s=o(t,e);}return picomatch.compileRe(s,e,u,n)};picomatch.toRegex=(t,e)=>{try{const u=e||{};return new RegExp(t,u.flags||(u.nocase?"i":""))}catch(t){if(e&&e.debug===true)throw t;return /$^/}};picomatch.constants=r;t.exports=picomatch;},716:(t,e,u)=>{const n=u(96);const{CHAR_ASTERISK:o,CHAR_AT:s,CHAR_BACKWARD_SLASH:r,CHAR_COMMA:a,CHAR_DOT:i,CHAR_EXCLAMATION_MARK:c,CHAR_FORWARD_SLASH:p,CHAR_LEFT_CURLY_BRACE:l,CHAR_LEFT_PARENTHESES:f,CHAR_LEFT_SQUARE_BRACKET:A,CHAR_PLUS:_,CHAR_QUESTION_MARK:R,CHAR_RIGHT_CURLY_BRACE:E,CHAR_RIGHT_PARENTHESES:h,CHAR_RIGHT_SQUARE_BRACKET:g}=u(154);const isPathSeparator=t=>t===p||t===r;const depth=t=>{if(t.isPrefix!==true){t.depth=t.isGlobstar?Infinity:1;}};const scan=(t,e)=>{const u=e||{};const b=t.length-1;const C=u.parts===true||u.scanToEnd===true;const y=[];const $=[];const x=[];let S=t;let H=-1;let v=0;let d=0;let L=false;let T=false;let O=false;let k=false;let m=false;let w=false;let N=false;let I=false;let B=false;let G=false;let D=0;let M;let P;let K={value:"",depth:0,isGlob:false};const eos=()=>H>=b;const peek=()=>S.charCodeAt(H+1);const advance=()=>{M=P;return S.charCodeAt(++H)};while(H<b){P=advance();let t;if(P===r){N=K.backslashes=true;P=advance();if(P===l){w=true;}continue}if(w===true||P===l){D++;while(eos()!==true&&(P=advance())){if(P===r){N=K.backslashes=true;advance();continue}if(P===l){D++;continue}if(w!==true&&P===i&&(P=advance())===i){L=K.isBrace=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(w!==true&&P===a){L=K.isBrace=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===E){D--;if(D===0){w=false;L=K.isBrace=true;G=true;break}}}if(C===true){continue}break}if(P===p){y.push(H);$.push(K);K={value:"",depth:0,isGlob:false};if(G===true)continue;if(M===i&&H===v+1){v+=2;continue}d=H+1;continue}if(u.noext!==true){const t=P===_||P===s||P===o||P===R||P===c;if(t===true&&peek()===f){O=K.isGlob=true;k=K.isExtglob=true;G=true;if(P===c&&H===v){B=true;}if(C===true){while(eos()!==true&&(P=advance())){if(P===r){N=K.backslashes=true;P=advance();continue}if(P===h){O=K.isGlob=true;G=true;break}}continue}break}}if(P===o){if(M===o)m=K.isGlobstar=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===R){O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===A){while(eos()!==true&&(t=advance())){if(t===r){N=K.backslashes=true;advance();continue}if(t===g){T=K.isBracket=true;O=K.isGlob=true;G=true;break}}if(C===true){continue}break}if(u.nonegate!==true&&P===c&&H===v){I=K.negated=true;v++;continue}if(u.noparen!==true&&P===f){O=K.isGlob=true;if(C===true){while(eos()!==true&&(P=advance())){if(P===f){N=K.backslashes=true;P=advance();continue}if(P===h){G=true;break}}continue}break}if(O===true){G=true;if(C===true){continue}break}}if(u.noext===true){k=false;O=false;}let U=S;let X="";let F="";if(v>0){X=S.slice(0,v);S=S.slice(v);d-=v;}if(U&&O===true&&d>0){U=S.slice(0,d);F=S.slice(d);}else if(O===true){U="";F=S;}else {U=S;}if(U&&U!==""&&U!=="/"&&U!==S){if(isPathSeparator(U.charCodeAt(U.length-1))){U=U.slice(0,-1);}}if(u.unescape===true){if(F)F=n.removeBackslashes(F);if(U&&N===true){U=n.removeBackslashes(U);}}const Q={prefix:X,input:t,start:v,base:U,glob:F,isBrace:L,isBracket:T,isGlob:O,isExtglob:k,isGlobstar:m,negated:I,negatedExtglob:B};if(u.tokens===true){Q.maxDepth=0;if(!isPathSeparator(P)){$.push(K);}Q.tokens=$;}if(u.parts===true||u.tokens===true){let e;for(let n=0;n<y.length;n++){const o=e?e+1:v;const s=y[n];const r=t.slice(o,s);if(u.tokens){if(n===0&&v!==0){$[n].isPrefix=true;$[n].value=X;}else {$[n].value=r;}depth($[n]);Q.maxDepth+=$[n].depth;}if(n!==0||r!==""){x.push(r);}e=s;}if(e&&e+1<t.length){const n=t.slice(e+1);x.push(n);if(u.tokens){$[$.length-1].value=n;depth($[$.length-1]);Q.maxDepth+=$[$.length-1].depth;}}Q.slashes=y;Q.parts=x;}return Q};t.exports=scan;},96:(t,e,u)=>{const{REGEX_BACKSLASH:n,REGEX_REMOVE_BACKSLASH:o,REGEX_SPECIAL_CHARS:s,REGEX_SPECIAL_CHARS_GLOBAL:r}=u(154);e.isObject=t=>t!==null&&typeof t==="object"&&!Array.isArray(t);e.hasRegexChars=t=>s.test(t);e.isRegexChar=t=>t.length===1&&e.hasRegexChars(t);e.escapeRegex=t=>t.replace(r,"\\$1");e.toPosixSlashes=t=>t.replace(n,"/");e.removeBackslashes=t=>t.replace(o,(t=>t==="\\"?"":t));e.escapeLast=(t,u,n)=>{const o=t.lastIndexOf(u,n);if(o===-1)return t;if(t[o-1]==="\\")return e.escapeLast(t,u,o-1);return `${t.slice(0,o)}\\${t.slice(o)}`};e.removePrefix=(t,e={})=>{let u=t;if(u.startsWith("./")){u=u.slice(2);e.prefix="./";}return u};e.wrapOutput=(t,e={},u={})=>{const n=u.contains?"":"^";const o=u.contains?"":"$";let s=`${n}(?:${t})${o}`;if(e.negated===true){s=`(?:^(?!${s}).*$)`;}return s};e.basename=(t,{windows:e}={})=>{const u=t.split(e?/[\\/]/:"/");const n=u[u.length-1];if(n===""){return u[u.length-2]}return n};}};var e={};function __nccwpck_require__(u){var n=e[u];if(n!==undefined){return n.exports}var o=e[u]={exports:{}};var s=true;try{t[u](o,o.exports,__nccwpck_require__);s=false;}finally{if(s)delete e[u];}return o.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var u=__nccwpck_require__(170);picomatch.exports=u;})();
	return picomatch.exports;
}

var hasRequiredMatchLocalPattern;

function requireMatchLocalPattern () {
	if (hasRequiredMatchLocalPattern) return matchLocalPattern;
	hasRequiredMatchLocalPattern = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    hasLocalMatch: function() {
		        return hasLocalMatch;
		    },
		    matchLocalPattern: function() {
		        return matchLocalPattern;
		    }
		});
		const _picomatch = requirePicomatch();
		function matchLocalPattern(pattern, url) {
		    if (pattern.search !== undefined) {
		        if (pattern.search !== url.search) {
		            return false;
		        }
		    }
		    var _pattern_pathname;
		    if (!(0, _picomatch.makeRe)((_pattern_pathname = pattern.pathname) != null ? _pattern_pathname : "**", {
		        dot: true
		    }).test(url.pathname)) {
		        return false;
		    }
		    return true;
		}
		function hasLocalMatch(localPatterns, urlPathAndQuery) {
		    if (!localPatterns) {
		        // if the user didn't define "localPatterns", we allow all local images
		        return true;
		    }
		    const url = new URL(urlPathAndQuery, "http://n");
		    return localPatterns.some((p)=>matchLocalPattern(p, url));
		}

		
	} (matchLocalPattern));
	return matchLocalPattern;
}

var matchRemotePattern = {};

var hasRequiredMatchRemotePattern;

function requireMatchRemotePattern () {
	if (hasRequiredMatchRemotePattern) return matchRemotePattern;
	hasRequiredMatchRemotePattern = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    hasRemoteMatch: function() {
		        return hasRemoteMatch;
		    },
		    matchRemotePattern: function() {
		        return matchRemotePattern;
		    }
		});
		const _picomatch = requirePicomatch();
		function matchRemotePattern(pattern, url) {
		    if (pattern.protocol !== undefined) {
		        const actualProto = url.protocol.slice(0, -1);
		        if (pattern.protocol !== actualProto) {
		            return false;
		        }
		    }
		    if (pattern.port !== undefined) {
		        if (pattern.port !== url.port) {
		            return false;
		        }
		    }
		    if (pattern.hostname === undefined) {
		        throw new Error("Pattern should define hostname but found\n" + JSON.stringify(pattern));
		    } else {
		        if (!(0, _picomatch.makeRe)(pattern.hostname).test(url.hostname)) {
		            return false;
		        }
		    }
		    if (pattern.search !== undefined) {
		        if (pattern.search !== url.search) {
		            return false;
		        }
		    }
		    var _pattern_pathname;
		    // Should be the same as writeImagesManifest()
		    if (!(0, _picomatch.makeRe)((_pattern_pathname = pattern.pathname) != null ? _pattern_pathname : "**", {
		        dot: true
		    }).test(url.pathname)) {
		        return false;
		    }
		    return true;
		}
		function hasRemoteMatch(domains, remotePatterns, url) {
		    return domains.some((domain)=>url.hostname === domain) || remotePatterns.some((p)=>matchRemotePattern(p, url));
		}

		
	} (matchRemotePattern));
	return matchRemotePattern;
}

var hasRequiredImageLoader;

function requireImageLoader () {
	if (hasRequiredImageLoader) return imageLoader;
	hasRequiredImageLoader = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "default", {
		    enumerable: true,
		    get: function() {
		        return _default;
		    }
		});
		const DEFAULT_Q = 75;
		function defaultLoader(param) {
		    let { config, src, width, quality } = param;
		    var _config_qualities;
		    if (process.env.NODE_ENV !== "production") {
		        const missingValues = [];
		        // these should always be provided but make sure they are
		        if (!src) missingValues.push("src");
		        if (!width) missingValues.push("width");
		        if (missingValues.length > 0) {
		            throw new Error("Next Image Optimization requires " + missingValues.join(", ") + " to be provided. Make sure you pass them as props to the `next/image` component. Received: " + JSON.stringify({
		                src,
		                width,
		                quality
		            }));
		        }
		        if (src.startsWith("//")) {
		            throw new Error('Failed to parse src "' + src + '" on `next/image`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)');
		        }
		        if (src.startsWith("/") && config.localPatterns) {
		            if (process.env.NODE_ENV !== "test" && // micromatch isn't compatible with edge runtime
		            process.env.NEXT_RUNTIME !== "edge") {
		                // We use dynamic require because this should only error in development
		                const { hasLocalMatch } = requireMatchLocalPattern();
		                if (!hasLocalMatch(config.localPatterns, src)) {
		                    throw new Error("Invalid src prop (" + src + ") on `next/image` does not match `images.localPatterns` configured in your `next.config.js`\n" + "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns");
		                }
		            }
		        }
		        if (!src.startsWith("/") && (config.domains || config.remotePatterns)) {
		            let parsedSrc;
		            try {
		                parsedSrc = new URL(src);
		            } catch (err) {
		                console.error(err);
		                throw new Error('Failed to parse src "' + src + '" on `next/image`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)');
		            }
		            if (process.env.NODE_ENV !== "test" && // micromatch isn't compatible with edge runtime
		            process.env.NEXT_RUNTIME !== "edge") {
		                // We use dynamic require because this should only error in development
		                const { hasRemoteMatch } = requireMatchRemotePattern();
		                if (!hasRemoteMatch(config.domains, config.remotePatterns, parsedSrc)) {
		                    throw new Error("Invalid src prop (" + src + ') on `next/image`, hostname "' + parsedSrc.hostname + '" is not configured under images in your `next.config.js`\n' + "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host");
		                }
		            }
		        }
		        if (quality && config.qualities && !config.qualities.includes(quality)) {
		            throw new Error("Invalid quality prop (" + quality + ") on `next/image` does not match `images.qualities` configured in your `next.config.js`\n" + "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-qualities");
		        }
		    }
		    const q = quality || ((_config_qualities = config.qualities) == null ? void 0 : _config_qualities.reduce((prev, cur)=>Math.abs(cur - DEFAULT_Q) < Math.abs(prev - DEFAULT_Q) ? cur : prev)) || DEFAULT_Q;
		    return config.path + "?url=" + encodeURIComponent(src) + "&w=" + width + "&q=" + q + (process.env.NEXT_DEPLOYMENT_ID ? "&dpl=" + process.env.NEXT_DEPLOYMENT_ID : "");
		}
		// We use this to determine if the import is the default loader
		// or a custom loader defined by the user in next.config.js
		defaultLoader.__next_img_default = true;
		const _default = defaultLoader;

		
	} (imageLoader));
	return imageLoader;
}

(function (module, exports) {
	"use client";
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	Object.defineProperty(exports, "Image", {
	    enumerable: true,
	    get: function() {
	        return Image;
	    }
	});
	const _interop_require_default = _interop_require_default$1;
	const _interop_require_wildcard = _interop_require_wildcard$1;
	const _jsxruntime = require$$2;
	const _react = /*#__PURE__*/ _interop_require_wildcard._(React__default);
	const _reactdom = /*#__PURE__*/ _interop_require_default._(require$$4);
	const _head = /*#__PURE__*/ _interop_require_default._(requireHead());
	const _getimgprops = getImgProps;
	const _imageconfig = imageConfig;
	const _imageconfigcontextsharedruntime = requireImageConfigContext_sharedRuntime();
	const _warnonce = warnOnce;
	const _routercontextsharedruntime = requireRouterContext_sharedRuntime();
	const _imageloader = /*#__PURE__*/ _interop_require_default._(requireImageLoader());
	// This is replaced by webpack define plugin
	const configEnv = process.env.__NEXT_IMAGE_OPTS;
	if (typeof window === "undefined") {
	    globalThis.__NEXT_IMAGE_IMPORTED = true;
	}
	// See https://stackoverflow.com/q/39777833/266535 for why we use this ref
	// handler instead of the img's onLoad attribute.
	function handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput) {
	    const src = img == null ? void 0 : img.src;
	    if (!img || img["data-loaded-src"] === src) {
	        return;
	    }
	    img["data-loaded-src"] = src;
	    const p = "decode" in img ? img.decode() : Promise.resolve();
	    p.catch(()=>{}).then(()=>{
	        if (!img.parentElement || !img.isConnected) {
	            // Exit early in case of race condition:
	            // - onload() is called
	            // - decode() is called but incomplete
	            // - unmount is called
	            // - decode() completes
	            return;
	        }
	        if (placeholder !== "empty") {
	            setBlurComplete(true);
	        }
	        if (onLoadRef == null ? void 0 : onLoadRef.current) {
	            // Since we don't have the SyntheticEvent here,
	            // we must create one with the same shape.
	            // See https://reactjs.org/docs/events.html
	            const event = new Event("load");
	            Object.defineProperty(event, "target", {
	                writable: false,
	                value: img
	            });
	            let prevented = false;
	            let stopped = false;
	            onLoadRef.current({
	                ...event,
	                nativeEvent: event,
	                currentTarget: img,
	                target: img,
	                isDefaultPrevented: ()=>prevented,
	                isPropagationStopped: ()=>stopped,
	                persist: ()=>{},
	                preventDefault: ()=>{
	                    prevented = true;
	                    event.preventDefault();
	                },
	                stopPropagation: ()=>{
	                    stopped = true;
	                    event.stopPropagation();
	                }
	            });
	        }
	        if (onLoadingCompleteRef == null ? void 0 : onLoadingCompleteRef.current) {
	            onLoadingCompleteRef.current(img);
	        }
	        if (process.env.NODE_ENV !== "production") {
	            const origSrc = new URL(src, "http://n").searchParams.get("url") || src;
	            if (img.getAttribute("data-nimg") === "fill") {
	                if (!unoptimized && (!sizesInput || sizesInput === "100vw")) {
	                    let widthViewportRatio = img.getBoundingClientRect().width / window.innerWidth;
	                    if (widthViewportRatio < 0.6) {
	                        if (sizesInput === "100vw") {
	                            (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" prop and "sizes" prop of "100vw", but image is not rendered at full viewport width. Please adjust "sizes" to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes');
	                        } else {
	                            (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes');
	                        }
	                    }
	                }
	                if (img.parentElement) {
	                    const { position } = window.getComputedStyle(img.parentElement);
	                    const valid = [
	                        "absolute",
	                        "fixed",
	                        "relative"
	                    ];
	                    if (!valid.includes(position)) {
	                        (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" and parent element with invalid "position". Provided "' + position + '" should be one of ' + valid.map(String).join(",") + ".");
	                    }
	                }
	                if (img.height === 0) {
	                    (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" and a height value of 0. This is likely because the parent element of the image has not been styled to have a set height.');
	                }
	            }
	            const heightModified = img.height.toString() !== img.getAttribute("height");
	            const widthModified = img.width.toString() !== img.getAttribute("width");
	            if (heightModified && !widthModified || !heightModified && widthModified) {
	                (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles \'width: "auto"\' or \'height: "auto"\' to maintain the aspect ratio.');
	            }
	        }
	    });
	}
	function getDynamicProps(fetchPriority) {
	    if (Boolean(_react.use)) {
	        // In React 19.0.0 or newer, we must use camelCase
	        // prop to avoid "Warning: Invalid DOM property".
	        // See https://github.com/facebook/react/pull/25927
	        return {
	            fetchPriority
	        };
	    }
	    // In React 18.2.0 or older, we must use lowercase prop
	    // to avoid "Warning: Invalid DOM property".
	    return {
	        fetchpriority: fetchPriority
	    };
	}
	const ImageElement = /*#__PURE__*/ (0, _react.forwardRef)((param, forwardedRef)=>{
	    let { src, srcSet, sizes, height, width, decoding, className, style, fetchPriority, placeholder, loading, unoptimized, fill, onLoadRef, onLoadingCompleteRef, setBlurComplete, setShowAltText, sizesInput, onLoad, onError, ...rest } = param;
	    return /*#__PURE__*/ (0, _jsxruntime.jsx)("img", {
	        ...rest,
	        ...getDynamicProps(fetchPriority),
	        // It's intended to keep `loading` before `src` because React updates
	        // props in order which causes Safari/Firefox to not lazy load properly.
	        // See https://github.com/facebook/react/issues/25883
	        loading: loading,
	        width: width,
	        height: height,
	        decoding: decoding,
	        "data-nimg": fill ? "fill" : "1",
	        className: className,
	        style: style,
	        // It's intended to keep `src` the last attribute because React updates
	        // attributes in order. If we keep `src` the first one, Safari will
	        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
	        // updated by React. That causes multiple unnecessary requests if `srcSet`
	        // and `sizes` are defined.
	        // This bug cannot be reproduced in Chrome or Firefox.
	        sizes: sizes,
	        srcSet: srcSet,
	        src: src,
	        ref: (0, _react.useCallback)((img)=>{
	            if (forwardedRef) {
	                if (typeof forwardedRef === "function") forwardedRef(img);
	                else if (typeof forwardedRef === "object") {
	                    // @ts-ignore - .current is read only it's usually assigned by react internally
	                    forwardedRef.current = img;
	                }
	            }
	            if (!img) {
	                return;
	            }
	            if (onError) {
	                // If the image has an error before react hydrates, then the error is lost.
	                // The workaround is to wait until the image is mounted which is after hydration,
	                // then we set the src again to trigger the error handler (if there was an error).
	                // eslint-disable-next-line no-self-assign
	                img.src = img.src;
	            }
	            if (process.env.NODE_ENV !== "production") {
	                if (!src) {
	                    console.error('Image is missing required "src" property:', img);
	                }
	                if (img.getAttribute("alt") === null) {
	                    console.error('Image is missing required "alt" property. Please add Alternative Text to describe the image for screen readers and search engines.');
	                }
	            }
	            if (img.complete) {
	                handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
	            }
	        }, [
	            src,
	            placeholder,
	            onLoadRef,
	            onLoadingCompleteRef,
	            setBlurComplete,
	            onError,
	            unoptimized,
	            sizesInput,
	            forwardedRef
	        ]),
	        onLoad: (event)=>{
	            const img = event.currentTarget;
	            handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
	        },
	        onError: (event)=>{
	            // if the real image fails to load, this will ensure "alt" is visible
	            setShowAltText(true);
	            if (placeholder !== "empty") {
	                // If the real image fails to load, this will still remove the placeholder.
	                setBlurComplete(true);
	            }
	            if (onError) {
	                onError(event);
	            }
	        }
	    });
	});
	function ImagePreload(param) {
	    let { isAppRouter, imgAttributes } = param;
	    const opts = {
	        as: "image",
	        imageSrcSet: imgAttributes.srcSet,
	        imageSizes: imgAttributes.sizes,
	        crossOrigin: imgAttributes.crossOrigin,
	        referrerPolicy: imgAttributes.referrerPolicy,
	        ...getDynamicProps(imgAttributes.fetchPriority)
	    };
	    if (isAppRouter && _reactdom.default.preload) {
	        // See https://github.com/facebook/react/pull/26940
	        _reactdom.default.preload(imgAttributes.src, // @ts-expect-error TODO: upgrade to `@types/react-dom@18.3.x`
	        opts);
	        return null;
	    }
	    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_head.default, {
	        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
	            rel: "preload",
	            // Note how we omit the `href` attribute, as it would only be relevant
	            // for browsers that do not support `imagesrcset`, and in those cases
	            // it would cause the incorrect image to be preloaded.
	            //
	            // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-imagesrcset
	            href: imgAttributes.srcSet ? undefined : imgAttributes.src,
	            ...opts
	        }, "__nimg-" + imgAttributes.src + imgAttributes.srcSet + imgAttributes.sizes)
	    });
	}
	const Image = /*#__PURE__*/ (0, _react.forwardRef)((props, forwardedRef)=>{
	    const pagesRouter = (0, _react.useContext)(_routercontextsharedruntime.RouterContext);
	    // We're in the app directory if there is no pages router.
	    const isAppRouter = !pagesRouter;
	    const configContext = (0, _react.useContext)(_imageconfigcontextsharedruntime.ImageConfigContext);
	    const config = (0, _react.useMemo)(()=>{
	        var _c_qualities;
	        const c = configEnv || configContext || _imageconfig.imageConfigDefault;
	        const allSizes = [
	            ...c.deviceSizes,
	            ...c.imageSizes
	        ].sort((a, b)=>a - b);
	        const deviceSizes = c.deviceSizes.sort((a, b)=>a - b);
	        const qualities = (_c_qualities = c.qualities) == null ? void 0 : _c_qualities.sort((a, b)=>a - b);
	        return {
	            ...c,
	            allSizes,
	            deviceSizes,
	            qualities
	        };
	    }, [
	        configContext
	    ]);
	    const { onLoad, onLoadingComplete } = props;
	    const onLoadRef = (0, _react.useRef)(onLoad);
	    (0, _react.useEffect)(()=>{
	        onLoadRef.current = onLoad;
	    }, [
	        onLoad
	    ]);
	    const onLoadingCompleteRef = (0, _react.useRef)(onLoadingComplete);
	    (0, _react.useEffect)(()=>{
	        onLoadingCompleteRef.current = onLoadingComplete;
	    }, [
	        onLoadingComplete
	    ]);
	    const [blurComplete, setBlurComplete] = (0, _react.useState)(false);
	    const [showAltText, setShowAltText] = (0, _react.useState)(false);
	    const { props: imgAttributes, meta: imgMeta } = (0, _getimgprops.getImgProps)(props, {
	        defaultLoader: _imageloader.default,
	        imgConf: config,
	        blurComplete,
	        showAltText
	    });
	    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
	        children: [
	            /*#__PURE__*/ (0, _jsxruntime.jsx)(ImageElement, {
	                ...imgAttributes,
	                unoptimized: imgMeta.unoptimized,
	                placeholder: imgMeta.placeholder,
	                fill: imgMeta.fill,
	                onLoadRef: onLoadRef,
	                onLoadingCompleteRef: onLoadingCompleteRef,
	                setBlurComplete: setBlurComplete,
	                setShowAltText: setShowAltText,
	                sizesInput: props.sizes,
	                ref: forwardedRef
	            }),
	            imgMeta.priority ? /*#__PURE__*/ (0, _jsxruntime.jsx)(ImagePreload, {
	                isAppRouter: isAppRouter,
	                imgAttributes: imgAttributes
	            }) : null
	        ]
	    });
	});

	if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
	  Object.defineProperty(exports.default, '__esModule', { value: true });
	  Object.assign(exports.default, exports);
	  module.exports = exports.default;
	}

	
} (imageComponent, imageComponent.exports));

var imageComponentExports = imageComponent.exports;

(function (exports) {
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function _export(target, all) {
	    for(var name in all)Object.defineProperty(target, name, {
	        enumerable: true,
	        get: all[name]
	    });
	}
	_export(exports, {
	    default: function() {
	        return _default;
	    },
	    getImageProps: function() {
	        return getImageProps;
	    }
	});
	const _interop_require_default = _interop_require_default$1;
	const _getimgprops = getImgProps;
	const _imagecomponent = imageComponentExports;
	const _imageloader = /*#__PURE__*/ _interop_require_default._(requireImageLoader());
	function getImageProps(imgProps) {
	    const { props } = (0, _getimgprops.getImgProps)(imgProps, {
	        defaultLoader: _imageloader.default,
	        // This is replaced by webpack define plugin
	        imgConf: process.env.__NEXT_IMAGE_OPTS
	    });
	    // Normally we don't care about undefined props because we pass to JSX,
	    // but this exported function could be used by the end user for anything
	    // so we delete undefined props to clean it up a little.
	    for (const [key, value] of Object.entries(props)){
	        if (value === undefined) {
	            delete props[key];
	        }
	    }
	    return {
	        props
	    };
	}
	const _default = _imagecomponent.Image;

	
} (imageExternal));

var image = imageExternal;

var Image = /*@__PURE__*/getDefaultExportFromCjs(image);

var link$1 = {exports: {}};

var resolveHref = {exports: {}};

var querystring = {};

var hasRequiredQuerystring;

function requireQuerystring () {
	if (hasRequiredQuerystring) return querystring;
	hasRequiredQuerystring = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    assign: function() {
		        return assign;
		    },
		    searchParamsToUrlQuery: function() {
		        return searchParamsToUrlQuery;
		    },
		    urlQueryToSearchParams: function() {
		        return urlQueryToSearchParams;
		    }
		});
		function searchParamsToUrlQuery(searchParams) {
		    const query = {};
		    searchParams.forEach((value, key)=>{
		        if (typeof query[key] === "undefined") {
		            query[key] = value;
		        } else if (Array.isArray(query[key])) {
		            query[key].push(value);
		        } else {
		            query[key] = [
		                query[key],
		                value
		            ];
		        }
		    });
		    return query;
		}
		function stringifyUrlQueryParam(param) {
		    if (typeof param === "string" || typeof param === "number" && !isNaN(param) || typeof param === "boolean") {
		        return String(param);
		    } else {
		        return "";
		    }
		}
		function urlQueryToSearchParams(urlQuery) {
		    const result = new URLSearchParams();
		    Object.entries(urlQuery).forEach((param)=>{
		        let [key, value] = param;
		        if (Array.isArray(value)) {
		            value.forEach((item)=>result.append(key, stringifyUrlQueryParam(item)));
		        } else {
		            result.set(key, stringifyUrlQueryParam(value));
		        }
		    });
		    return result;
		}
		function assign(target) {
		    for(var _len = arguments.length, searchParamsList = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
		        searchParamsList[_key - 1] = arguments[_key];
		    }
		    searchParamsList.forEach((searchParams)=>{
		        Array.from(searchParams.keys()).forEach((key)=>target.delete(key));
		        searchParams.forEach((value, key)=>target.append(key, value));
		    });
		    return target;
		}

		
	} (querystring));
	return querystring;
}

var formatUrl = {};

var hasRequiredFormatUrl;

function requireFormatUrl () {
	if (hasRequiredFormatUrl) return formatUrl;
	hasRequiredFormatUrl = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    formatUrl: function() {
		        return formatUrl;
		    },
		    formatWithValidation: function() {
		        return formatWithValidation;
		    },
		    urlObjectKeys: function() {
		        return urlObjectKeys;
		    }
		});
		const _interop_require_wildcard = _interop_require_wildcard$1;
		const _querystring = /*#__PURE__*/ _interop_require_wildcard._(requireQuerystring());
		const slashedProtocols = /https?|ftp|gopher|file/;
		function formatUrl(urlObj) {
		    let { auth, hostname } = urlObj;
		    let protocol = urlObj.protocol || "";
		    let pathname = urlObj.pathname || "";
		    let hash = urlObj.hash || "";
		    let query = urlObj.query || "";
		    let host = false;
		    auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ":") + "@" : "";
		    if (urlObj.host) {
		        host = auth + urlObj.host;
		    } else if (hostname) {
		        host = auth + (~hostname.indexOf(":") ? "[" + hostname + "]" : hostname);
		        if (urlObj.port) {
		            host += ":" + urlObj.port;
		        }
		    }
		    if (query && typeof query === "object") {
		        query = String(_querystring.urlQueryToSearchParams(query));
		    }
		    let search = urlObj.search || query && "?" + query || "";
		    if (protocol && !protocol.endsWith(":")) protocol += ":";
		    if (urlObj.slashes || (!protocol || slashedProtocols.test(protocol)) && host !== false) {
		        host = "//" + (host || "");
		        if (pathname && pathname[0] !== "/") pathname = "/" + pathname;
		    } else if (!host) {
		        host = "";
		    }
		    if (hash && hash[0] !== "#") hash = "#" + hash;
		    if (search && search[0] !== "?") search = "?" + search;
		    pathname = pathname.replace(/[?#]/g, encodeURIComponent);
		    search = search.replace("#", "%23");
		    return "" + protocol + host + pathname + search + hash;
		}
		const urlObjectKeys = [
		    "auth",
		    "hash",
		    "host",
		    "hostname",
		    "href",
		    "path",
		    "pathname",
		    "port",
		    "protocol",
		    "query",
		    "search",
		    "slashes"
		];
		function formatWithValidation(url) {
		    if (process.env.NODE_ENV === "development") {
		        if (url !== null && typeof url === "object") {
		            Object.keys(url).forEach((key)=>{
		                if (!urlObjectKeys.includes(key)) {
		                    console.warn("Unknown key passed via urlObject into url.format: " + key);
		                }
		            });
		        }
		    }
		    return formatUrl(url);
		}

		
	} (formatUrl));
	return formatUrl;
}

var omit = {};

var hasRequiredOmit;

function requireOmit () {
	if (hasRequiredOmit) return omit;
	hasRequiredOmit = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "omit", {
		    enumerable: true,
		    get: function() {
		        return omit;
		    }
		});
		function omit(object, keys) {
		    const omitted = {};
		    Object.keys(object).forEach((key)=>{
		        if (!keys.includes(key)) {
		            omitted[key] = object[key];
		        }
		    });
		    return omitted;
		}

		
	} (omit));
	return omit;
}

var utils$2 = {};

var hasRequiredUtils$1;

function requireUtils$1 () {
	if (hasRequiredUtils$1) return utils$2;
	hasRequiredUtils$1 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    DecodeError: function() {
		        return DecodeError;
		    },
		    MiddlewareNotFoundError: function() {
		        return MiddlewareNotFoundError;
		    },
		    MissingStaticPage: function() {
		        return MissingStaticPage;
		    },
		    NormalizeError: function() {
		        return NormalizeError;
		    },
		    PageNotFoundError: function() {
		        return PageNotFoundError;
		    },
		    SP: function() {
		        return SP;
		    },
		    ST: function() {
		        return ST;
		    },
		    WEB_VITALS: function() {
		        return WEB_VITALS;
		    },
		    execOnce: function() {
		        return execOnce;
		    },
		    getDisplayName: function() {
		        return getDisplayName;
		    },
		    getLocationOrigin: function() {
		        return getLocationOrigin;
		    },
		    getURL: function() {
		        return getURL;
		    },
		    isAbsoluteUrl: function() {
		        return isAbsoluteUrl;
		    },
		    isResSent: function() {
		        return isResSent;
		    },
		    loadGetInitialProps: function() {
		        return loadGetInitialProps;
		    },
		    normalizeRepeatedSlashes: function() {
		        return normalizeRepeatedSlashes;
		    },
		    stringifyError: function() {
		        return stringifyError;
		    }
		});
		const WEB_VITALS = [
		    "CLS",
		    "FCP",
		    "FID",
		    "INP",
		    "LCP",
		    "TTFB"
		];
		function execOnce(fn) {
		    let used = false;
		    let result;
		    return function() {
		        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
		            args[_key] = arguments[_key];
		        }
		        if (!used) {
		            used = true;
		            result = fn(...args);
		        }
		        return result;
		    };
		}
		// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
		// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
		const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
		const isAbsoluteUrl = (url)=>ABSOLUTE_URL_REGEX.test(url);
		function getLocationOrigin() {
		    const { protocol, hostname, port } = window.location;
		    return protocol + "//" + hostname + (port ? ":" + port : "");
		}
		function getURL() {
		    const { href } = window.location;
		    const origin = getLocationOrigin();
		    return href.substring(origin.length);
		}
		function getDisplayName(Component) {
		    return typeof Component === "string" ? Component : Component.displayName || Component.name || "Unknown";
		}
		function isResSent(res) {
		    return res.finished || res.headersSent;
		}
		function normalizeRepeatedSlashes(url) {
		    const urlParts = url.split("?");
		    const urlNoQuery = urlParts[0];
		    return urlNoQuery// first we replace any non-encoded backslashes with forward
		    // then normalize repeated forward slashes
		    .replace(/\\/g, "/").replace(/\/\/+/g, "/") + (urlParts[1] ? "?" + urlParts.slice(1).join("?") : "");
		}
		async function loadGetInitialProps(App, ctx) {
		    if (process.env.NODE_ENV !== "production") {
		        var _App_prototype;
		        if ((_App_prototype = App.prototype) == null ? void 0 : _App_prototype.getInitialProps) {
		            const message = '"' + getDisplayName(App) + '.getInitialProps()" is defined as an instance method - visit https://nextjs.org/docs/messages/get-initial-props-as-an-instance-method for more information.';
		            throw new Error(message);
		        }
		    }
		    // when called from _app `ctx` is nested in `ctx`
		    const res = ctx.res || ctx.ctx && ctx.ctx.res;
		    if (!App.getInitialProps) {
		        if (ctx.ctx && ctx.Component) {
		            // @ts-ignore pageProps default
		            return {
		                pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
		            };
		        }
		        return {};
		    }
		    const props = await App.getInitialProps(ctx);
		    if (res && isResSent(res)) {
		        return props;
		    }
		    if (!props) {
		        const message = '"' + getDisplayName(App) + '.getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
		        throw new Error(message);
		    }
		    if (process.env.NODE_ENV !== "production") {
		        if (Object.keys(props).length === 0 && !ctx.ctx) {
		            console.warn("" + getDisplayName(App) + " returned an empty object from `getInitialProps`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProps");
		        }
		    }
		    return props;
		}
		const SP = typeof performance !== "undefined";
		const ST = SP && [
		    "mark",
		    "measure",
		    "getEntriesByName"
		].every((method)=>typeof performance[method] === "function");
		class DecodeError extends Error {
		}
		class NormalizeError extends Error {
		}
		class PageNotFoundError extends Error {
		    constructor(page){
		        super();
		        this.code = "ENOENT";
		        this.name = "PageNotFoundError";
		        this.message = "Cannot find module for page: " + page;
		    }
		}
		class MissingStaticPage extends Error {
		    constructor(page, message){
		        super();
		        this.message = "Failed to load static file for page: " + page + " " + message;
		    }
		}
		class MiddlewareNotFoundError extends Error {
		    constructor(){
		        super();
		        this.code = "ENOENT";
		        this.message = "Cannot find the middleware module";
		    }
		}
		function stringifyError(error) {
		    return JSON.stringify({
		        message: error.message,
		        stack: error.stack
		    });
		}

		
	} (utils$2));
	return utils$2;
}

var normalizeTrailingSlash = {exports: {}};

var removeTrailingSlash = {};

/**
 * Removes the trailing slash for a given route or page path. Preserves the
 * root page. Examples:
 *   - `/foo/bar/` -> `/foo/bar`
 *   - `/foo/bar` -> `/foo/bar`
 *   - `/` -> `/`
 */

var hasRequiredRemoveTrailingSlash;

function requireRemoveTrailingSlash () {
	if (hasRequiredRemoveTrailingSlash) return removeTrailingSlash;
	hasRequiredRemoveTrailingSlash = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "removeTrailingSlash", {
		    enumerable: true,
		    get: function() {
		        return removeTrailingSlash;
		    }
		});
		function removeTrailingSlash(route) {
		    return route.replace(/\/$/, "") || "/";
		}

		
	} (removeTrailingSlash));
	return removeTrailingSlash;
}

var parsePath = {};

/**
 * Given a path this function will find the pathname, query and hash and return
 * them. This is useful to parse full paths on the client side.
 * @param path A path to parse e.g. /foo/bar?id=1#hash
 */

var hasRequiredParsePath;

function requireParsePath () {
	if (hasRequiredParsePath) return parsePath;
	hasRequiredParsePath = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "parsePath", {
		    enumerable: true,
		    get: function() {
		        return parsePath;
		    }
		});
		function parsePath(path) {
		    const hashIndex = path.indexOf("#");
		    const queryIndex = path.indexOf("?");
		    const hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
		    if (hasQuery || hashIndex > -1) {
		        return {
		            pathname: path.substring(0, hasQuery ? queryIndex : hashIndex),
		            query: hasQuery ? path.substring(queryIndex, hashIndex > -1 ? hashIndex : undefined) : "",
		            hash: hashIndex > -1 ? path.slice(hashIndex) : ""
		        };
		    }
		    return {
		        pathname: path,
		        query: "",
		        hash: ""
		    };
		}

		
	} (parsePath));
	return parsePath;
}

var hasRequiredNormalizeTrailingSlash;

function requireNormalizeTrailingSlash () {
	if (hasRequiredNormalizeTrailingSlash) return normalizeTrailingSlash.exports;
	hasRequiredNormalizeTrailingSlash = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "normalizePathTrailingSlash", {
		    enumerable: true,
		    get: function() {
		        return normalizePathTrailingSlash;
		    }
		});
		const _removetrailingslash = requireRemoveTrailingSlash();
		const _parsepath = requireParsePath();
		const normalizePathTrailingSlash = (path)=>{
		    if (!path.startsWith("/") || process.env.__NEXT_MANUAL_TRAILING_SLASH) {
		        return path;
		    }
		    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
		    if (process.env.__NEXT_TRAILING_SLASH) {
		        if (/\.[^/]+\/?$/.test(pathname)) {
		            return "" + (0, _removetrailingslash.removeTrailingSlash)(pathname) + query + hash;
		        } else if (pathname.endsWith("/")) {
		            return "" + pathname + query + hash;
		        } else {
		            return pathname + "/" + query + hash;
		        }
		    }
		    return "" + (0, _removetrailingslash.removeTrailingSlash)(pathname) + query + hash;
		};

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (normalizeTrailingSlash, normalizeTrailingSlash.exports));
	return normalizeTrailingSlash.exports;
}

var isLocalUrl = {};

var hasBasePath = {exports: {}};

var pathHasPrefix = {};

var hasRequiredPathHasPrefix;

function requirePathHasPrefix () {
	if (hasRequiredPathHasPrefix) return pathHasPrefix;
	hasRequiredPathHasPrefix = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "pathHasPrefix", {
		    enumerable: true,
		    get: function() {
		        return pathHasPrefix;
		    }
		});
		const _parsepath = requireParsePath();
		function pathHasPrefix(path, prefix) {
		    if (typeof path !== "string") {
		        return false;
		    }
		    const { pathname } = (0, _parsepath.parsePath)(path);
		    return pathname === prefix || pathname.startsWith(prefix + "/");
		}

		
	} (pathHasPrefix));
	return pathHasPrefix;
}

var hasRequiredHasBasePath;

function requireHasBasePath () {
	if (hasRequiredHasBasePath) return hasBasePath.exports;
	hasRequiredHasBasePath = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "hasBasePath", {
		    enumerable: true,
		    get: function() {
		        return hasBasePath;
		    }
		});
		const _pathhasprefix = requirePathHasPrefix();
		const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";
		function hasBasePath(path) {
		    return (0, _pathhasprefix.pathHasPrefix)(path, basePath);
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (hasBasePath, hasBasePath.exports));
	return hasBasePath.exports;
}

var hasRequiredIsLocalUrl;

function requireIsLocalUrl () {
	if (hasRequiredIsLocalUrl) return isLocalUrl;
	hasRequiredIsLocalUrl = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "isLocalURL", {
		    enumerable: true,
		    get: function() {
		        return isLocalURL;
		    }
		});
		const _utils = requireUtils$1();
		const _hasbasepath = requireHasBasePath();
		function isLocalURL(url) {
		    // prevent a hydration mismatch on href for url with anchor refs
		    if (!(0, _utils.isAbsoluteUrl)(url)) return true;
		    try {
		        // absolute urls can be local if they are on the same origin
		        const locationOrigin = (0, _utils.getLocationOrigin)();
		        const resolved = new URL(url, locationOrigin);
		        return resolved.origin === locationOrigin && (0, _hasbasepath.hasBasePath)(resolved.pathname);
		    } catch (_) {
		        return false;
		    }
		}

		
	} (isLocalUrl));
	return isLocalUrl;
}

var utils$1 = {};

var sortedRoutes = {};

var hasRequiredSortedRoutes;

function requireSortedRoutes () {
	if (hasRequiredSortedRoutes) return sortedRoutes;
	hasRequiredSortedRoutes = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "getSortedRoutes", {
		    enumerable: true,
		    get: function() {
		        return getSortedRoutes;
		    }
		});
		class UrlNode {
		    insert(urlPath) {
		        this._insert(urlPath.split("/").filter(Boolean), [], false);
		    }
		    smoosh() {
		        return this._smoosh();
		    }
		    _smoosh(prefix) {
		        if (prefix === void 0) prefix = "/";
		        const childrenPaths = [
		            ...this.children.keys()
		        ].sort();
		        if (this.slugName !== null) {
		            childrenPaths.splice(childrenPaths.indexOf("[]"), 1);
		        }
		        if (this.restSlugName !== null) {
		            childrenPaths.splice(childrenPaths.indexOf("[...]"), 1);
		        }
		        if (this.optionalRestSlugName !== null) {
		            childrenPaths.splice(childrenPaths.indexOf("[[...]]"), 1);
		        }
		        const routes = childrenPaths.map((c)=>this.children.get(c)._smoosh("" + prefix + c + "/")).reduce((prev, curr)=>[
		                ...prev,
		                ...curr
		            ], []);
		        if (this.slugName !== null) {
		            routes.push(...this.children.get("[]")._smoosh(prefix + "[" + this.slugName + "]/"));
		        }
		        if (!this.placeholder) {
		            const r = prefix === "/" ? "/" : prefix.slice(0, -1);
		            if (this.optionalRestSlugName != null) {
		                throw new Error('You cannot define a route with the same specificity as a optional catch-all route ("' + r + '" and "' + r + "[[..." + this.optionalRestSlugName + ']]").');
		            }
		            routes.unshift(r);
		        }
		        if (this.restSlugName !== null) {
		            routes.push(...this.children.get("[...]")._smoosh(prefix + "[..." + this.restSlugName + "]/"));
		        }
		        if (this.optionalRestSlugName !== null) {
		            routes.push(...this.children.get("[[...]]")._smoosh(prefix + "[[..." + this.optionalRestSlugName + "]]/"));
		        }
		        return routes;
		    }
		    _insert(urlPaths, slugNames, isCatchAll) {
		        if (urlPaths.length === 0) {
		            this.placeholder = false;
		            return;
		        }
		        if (isCatchAll) {
		            throw new Error("Catch-all must be the last part of the URL.");
		        }
		        // The next segment in the urlPaths list
		        let nextSegment = urlPaths[0];
		        // Check if the segment matches `[something]`
		        if (nextSegment.startsWith("[") && nextSegment.endsWith("]")) {
		            // Strip `[` and `]`, leaving only `something`
		            let segmentName = nextSegment.slice(1, -1);
		            let isOptional = false;
		            if (segmentName.startsWith("[") && segmentName.endsWith("]")) {
		                // Strip optional `[` and `]`, leaving only `something`
		                segmentName = segmentName.slice(1, -1);
		                isOptional = true;
		            }
		            if (segmentName.startsWith("...")) {
		                // Strip `...`, leaving only `something`
		                segmentName = segmentName.substring(3);
		                isCatchAll = true;
		            }
		            if (segmentName.startsWith("[") || segmentName.endsWith("]")) {
		                throw new Error("Segment names may not start or end with extra brackets ('" + segmentName + "').");
		            }
		            if (segmentName.startsWith(".")) {
		                throw new Error("Segment names may not start with erroneous periods ('" + segmentName + "').");
		            }
		            function handleSlug(previousSlug, nextSlug) {
		                if (previousSlug !== null) {
		                    // If the specific segment already has a slug but the slug is not `something`
		                    // This prevents collisions like:
		                    // pages/[post]/index.js
		                    // pages/[id]/index.js
		                    // Because currently multiple dynamic params on the same segment level are not supported
		                    if (previousSlug !== nextSlug) {
		                        // TODO: This error seems to be confusing for users, needs an error link, the description can be based on above comment.
		                        throw new Error("You cannot use different slug names for the same dynamic path ('" + previousSlug + "' !== '" + nextSlug + "').");
		                    }
		                }
		                slugNames.forEach((slug)=>{
		                    if (slug === nextSlug) {
		                        throw new Error('You cannot have the same slug name "' + nextSlug + '" repeat within a single dynamic path');
		                    }
		                    if (slug.replace(/\W/g, "") === nextSegment.replace(/\W/g, "")) {
		                        throw new Error('You cannot have the slug names "' + slug + '" and "' + nextSlug + '" differ only by non-word symbols within a single dynamic path');
		                    }
		                });
		                slugNames.push(nextSlug);
		            }
		            if (isCatchAll) {
		                if (isOptional) {
		                    if (this.restSlugName != null) {
		                        throw new Error('You cannot use both an required and optional catch-all route at the same level ("[...' + this.restSlugName + ']" and "' + urlPaths[0] + '" ).');
		                    }
		                    handleSlug(this.optionalRestSlugName, segmentName);
		                    // slugName is kept as it can only be one particular slugName
		                    this.optionalRestSlugName = segmentName;
		                    // nextSegment is overwritten to [[...]] so that it can later be sorted specifically
		                    nextSegment = "[[...]]";
		                } else {
		                    if (this.optionalRestSlugName != null) {
		                        throw new Error('You cannot use both an optional and required catch-all route at the same level ("[[...' + this.optionalRestSlugName + ']]" and "' + urlPaths[0] + '").');
		                    }
		                    handleSlug(this.restSlugName, segmentName);
		                    // slugName is kept as it can only be one particular slugName
		                    this.restSlugName = segmentName;
		                    // nextSegment is overwritten to [...] so that it can later be sorted specifically
		                    nextSegment = "[...]";
		                }
		            } else {
		                if (isOptional) {
		                    throw new Error('Optional route parameters are not yet supported ("' + urlPaths[0] + '").');
		                }
		                handleSlug(this.slugName, segmentName);
		                // slugName is kept as it can only be one particular slugName
		                this.slugName = segmentName;
		                // nextSegment is overwritten to [] so that it can later be sorted specifically
		                nextSegment = "[]";
		            }
		        }
		        // If this UrlNode doesn't have the nextSegment yet we create a new child UrlNode
		        if (!this.children.has(nextSegment)) {
		            this.children.set(nextSegment, new UrlNode());
		        }
		        this.children.get(nextSegment)._insert(urlPaths.slice(1), slugNames, isCatchAll);
		    }
		    constructor(){
		        this.placeholder = true;
		        this.children = new Map();
		        this.slugName = null;
		        this.restSlugName = null;
		        this.optionalRestSlugName = null;
		    }
		}
		function getSortedRoutes(normalizedPages) {
		    // First the UrlNode is created, and every UrlNode can have only 1 dynamic segment
		    // Eg you can't have pages/[post]/abc.js and pages/[hello]/something-else.js
		    // Only 1 dynamic segment per nesting level
		    // So in the case that is test/integration/dynamic-routing it'll be this:
		    // pages/[post]/comments.js
		    // pages/blog/[post]/comment/[id].js
		    // Both are fine because `pages/[post]` and `pages/blog` are on the same level
		    // So in this case `UrlNode` created here has `this.slugName === 'post'`
		    // And since your PR passed through `slugName` as an array basically it'd including it in too many possibilities
		    // Instead what has to be passed through is the upwards path's dynamic names
		    const root = new UrlNode();
		    // Here the `root` gets injected multiple paths, and insert will break them up into sublevels
		    normalizedPages.forEach((pagePath)=>root.insert(pagePath));
		    // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
		    return root.smoosh();
		}

		
	} (sortedRoutes));
	return sortedRoutes;
}

var isDynamic = {};

var interceptionRoutes = {};

var appPaths = {};

var ensureLeadingSlash = {};

/**
 * For a given page path, this function ensures that there is a leading slash.
 * If there is not a leading slash, one is added, otherwise it is noop.
 */

var hasRequiredEnsureLeadingSlash;

function requireEnsureLeadingSlash () {
	if (hasRequiredEnsureLeadingSlash) return ensureLeadingSlash;
	hasRequiredEnsureLeadingSlash = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "ensureLeadingSlash", {
		    enumerable: true,
		    get: function() {
		        return ensureLeadingSlash;
		    }
		});
		function ensureLeadingSlash(path) {
		    return path.startsWith("/") ? path : "/" + path;
		}

		
	} (ensureLeadingSlash));
	return ensureLeadingSlash;
}

var segment = {};

var hasRequiredSegment;

function requireSegment () {
	if (hasRequiredSegment) return segment;
	hasRequiredSegment = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    DEFAULT_SEGMENT_KEY: function() {
		        return DEFAULT_SEGMENT_KEY;
		    },
		    PAGE_SEGMENT_KEY: function() {
		        return PAGE_SEGMENT_KEY;
		    },
		    isGroupSegment: function() {
		        return isGroupSegment;
		    }
		});
		function isGroupSegment(segment) {
		    // Use array[0] for performant purpose
		    return segment[0] === "(" && segment.endsWith(")");
		}
		const PAGE_SEGMENT_KEY = "__PAGE__";
		const DEFAULT_SEGMENT_KEY = "__DEFAULT__";

		
	} (segment));
	return segment;
}

var hasRequiredAppPaths;

function requireAppPaths () {
	if (hasRequiredAppPaths) return appPaths;
	hasRequiredAppPaths = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    normalizeAppPath: function() {
		        return normalizeAppPath;
		    },
		    normalizeRscURL: function() {
		        return normalizeRscURL;
		    }
		});
		const _ensureleadingslash = requireEnsureLeadingSlash();
		const _segment = requireSegment();
		function normalizeAppPath(route) {
		    return (0, _ensureleadingslash.ensureLeadingSlash)(route.split("/").reduce((pathname, segment, index, segments)=>{
		        // Empty segments are ignored.
		        if (!segment) {
		            return pathname;
		        }
		        // Groups are ignored.
		        if ((0, _segment.isGroupSegment)(segment)) {
		            return pathname;
		        }
		        // Parallel segments are ignored.
		        if (segment[0] === "@") {
		            return pathname;
		        }
		        // The last segment (if it's a leaf) should be ignored.
		        if ((segment === "page" || segment === "route") && index === segments.length - 1) {
		            return pathname;
		        }
		        return pathname + "/" + segment;
		    }, ""));
		}
		function normalizeRscURL(url) {
		    return url.replace(/\.rsc($|\?)/, // $1 ensures `?` is preserved
		    "$1");
		}

		
	} (appPaths));
	return appPaths;
}

var hasRequiredInterceptionRoutes;

function requireInterceptionRoutes () {
	if (hasRequiredInterceptionRoutes) return interceptionRoutes;
	hasRequiredInterceptionRoutes = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    INTERCEPTION_ROUTE_MARKERS: function() {
		        return INTERCEPTION_ROUTE_MARKERS;
		    },
		    extractInterceptionRouteInformation: function() {
		        return extractInterceptionRouteInformation;
		    },
		    isInterceptionRouteAppPath: function() {
		        return isInterceptionRouteAppPath;
		    }
		});
		const _apppaths = requireAppPaths();
		const INTERCEPTION_ROUTE_MARKERS = [
		    "(..)(..)",
		    "(.)",
		    "(..)",
		    "(...)"
		];
		function isInterceptionRouteAppPath(path) {
		    // TODO-APP: add more serious validation
		    return path.split("/").find((segment)=>INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m))) !== undefined;
		}
		function extractInterceptionRouteInformation(path) {
		    let interceptingRoute, marker, interceptedRoute;
		    for (const segment of path.split("/")){
		        marker = INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m));
		        if (marker) {
		            [interceptingRoute, interceptedRoute] = path.split(marker, 2);
		            break;
		        }
		    }
		    if (!interceptingRoute || !marker || !interceptedRoute) {
		        throw new Error(`Invalid interception route: ${path}. Must be in the format /<intercepting route>/(..|...|..)(..)/<intercepted route>`);
		    }
		    interceptingRoute = (0, _apppaths.normalizeAppPath)(interceptingRoute) // normalize the path, e.g. /(blog)/feed -> /feed
		    ;
		    switch(marker){
		        case "(.)":
		            // (.) indicates that we should match with sibling routes, so we just need to append the intercepted route to the intercepting route
		            if (interceptingRoute === "/") {
		                interceptedRoute = `/${interceptedRoute}`;
		            } else {
		                interceptedRoute = interceptingRoute + "/" + interceptedRoute;
		            }
		            break;
		        case "(..)":
		            // (..) indicates that we should match at one level up, so we need to remove the last segment of the intercepting route
		            if (interceptingRoute === "/") {
		                throw new Error(`Invalid interception route: ${path}. Cannot use (..) marker at the root level, use (.) instead.`);
		            }
		            interceptedRoute = interceptingRoute.split("/").slice(0, -1).concat(interceptedRoute).join("/");
		            break;
		        case "(...)":
		            // (...) will match the route segment in the root directory, so we need to use the root directory to prepend the intercepted route
		            interceptedRoute = "/" + interceptedRoute;
		            break;
		        case "(..)(..)":
		            // (..)(..) indicates that we should match at two levels up, so we need to remove the last two segments of the intercepting route
		            const splitInterceptingRoute = interceptingRoute.split("/");
		            if (splitInterceptingRoute.length <= 2) {
		                throw new Error(`Invalid interception route: ${path}. Cannot use (..)(..) marker at the root level or one level up.`);
		            }
		            interceptedRoute = splitInterceptingRoute.slice(0, -2).concat(interceptedRoute).join("/");
		            break;
		        default:
		            throw new Error("Invariant: unexpected marker");
		    }
		    return {
		        interceptingRoute,
		        interceptedRoute
		    };
		}

		
	} (interceptionRoutes));
	return interceptionRoutes;
}

var hasRequiredIsDynamic;

function requireIsDynamic () {
	if (hasRequiredIsDynamic) return isDynamic;
	hasRequiredIsDynamic = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "isDynamicRoute", {
		    enumerable: true,
		    get: function() {
		        return isDynamicRoute;
		    }
		});
		const _interceptionroutes = requireInterceptionRoutes();
		// Identify /[param]/ in route string
		const TEST_ROUTE = /\/\[[^/]+?\](?=\/|$)/;
		function isDynamicRoute(route) {
		    if ((0, _interceptionroutes.isInterceptionRouteAppPath)(route)) {
		        route = (0, _interceptionroutes.extractInterceptionRouteInformation)(route).interceptedRoute;
		    }
		    return TEST_ROUTE.test(route);
		}

		
	} (isDynamic));
	return isDynamic;
}

var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils$1;
	hasRequiredUtils = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    getSortedRoutes: function() {
		        return _sortedroutes.getSortedRoutes;
		    },
		    isDynamicRoute: function() {
		        return _isdynamic.isDynamicRoute;
		    }
		});
		const _sortedroutes = requireSortedRoutes();
		const _isdynamic = requireIsDynamic();

		
	} (utils$1));
	return utils$1;
}

var interpolateAs = {};

var routeMatcher = {};

var hasRequiredRouteMatcher;

function requireRouteMatcher () {
	if (hasRequiredRouteMatcher) return routeMatcher;
	hasRequiredRouteMatcher = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "getRouteMatcher", {
		    enumerable: true,
		    get: function() {
		        return getRouteMatcher;
		    }
		});
		const _utils = requireUtils$1();
		function getRouteMatcher(param) {
		    let { re, groups } = param;
		    return (pathname)=>{
		        const routeMatch = re.exec(pathname);
		        if (!routeMatch) {
		            return false;
		        }
		        const decode = (param)=>{
		            try {
		                return decodeURIComponent(param);
		            } catch (_) {
		                throw new _utils.DecodeError("failed to decode param");
		            }
		        };
		        const params = {};
		        Object.keys(groups).forEach((slugName)=>{
		            const g = groups[slugName];
		            const m = routeMatch[g.pos];
		            if (m !== undefined) {
		                params[slugName] = ~m.indexOf("/") ? m.split("/").map((entry)=>decode(entry)) : g.repeat ? [
		                    decode(m)
		                ] : decode(m);
		            }
		        });
		        return params;
		    };
		}

		
	} (routeMatcher));
	return routeMatcher;
}

var routeRegex = {};

var constants = {};

var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants;
	hasRequiredConstants = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    ACTION_SUFFIX: function() {
		        return ACTION_SUFFIX;
		    },
		    APP_DIR_ALIAS: function() {
		        return APP_DIR_ALIAS;
		    },
		    CACHE_ONE_YEAR: function() {
		        return CACHE_ONE_YEAR;
		    },
		    DOT_NEXT_ALIAS: function() {
		        return DOT_NEXT_ALIAS;
		    },
		    ESLINT_DEFAULT_DIRS: function() {
		        return ESLINT_DEFAULT_DIRS;
		    },
		    GSP_NO_RETURNED_VALUE: function() {
		        return GSP_NO_RETURNED_VALUE;
		    },
		    GSSP_COMPONENT_MEMBER_ERROR: function() {
		        return GSSP_COMPONENT_MEMBER_ERROR;
		    },
		    GSSP_NO_RETURNED_VALUE: function() {
		        return GSSP_NO_RETURNED_VALUE;
		    },
		    INSTRUMENTATION_HOOK_FILENAME: function() {
		        return INSTRUMENTATION_HOOK_FILENAME;
		    },
		    MIDDLEWARE_FILENAME: function() {
		        return MIDDLEWARE_FILENAME;
		    },
		    MIDDLEWARE_LOCATION_REGEXP: function() {
		        return MIDDLEWARE_LOCATION_REGEXP;
		    },
		    NEXT_BODY_SUFFIX: function() {
		        return NEXT_BODY_SUFFIX;
		    },
		    NEXT_CACHE_IMPLICIT_TAG_ID: function() {
		        return NEXT_CACHE_IMPLICIT_TAG_ID;
		    },
		    NEXT_CACHE_REVALIDATED_TAGS_HEADER: function() {
		        return NEXT_CACHE_REVALIDATED_TAGS_HEADER;
		    },
		    NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER: function() {
		        return NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER;
		    },
		    NEXT_CACHE_SOFT_TAGS_HEADER: function() {
		        return NEXT_CACHE_SOFT_TAGS_HEADER;
		    },
		    NEXT_CACHE_SOFT_TAG_MAX_LENGTH: function() {
		        return NEXT_CACHE_SOFT_TAG_MAX_LENGTH;
		    },
		    NEXT_CACHE_TAGS_HEADER: function() {
		        return NEXT_CACHE_TAGS_HEADER;
		    },
		    NEXT_CACHE_TAG_MAX_ITEMS: function() {
		        return NEXT_CACHE_TAG_MAX_ITEMS;
		    },
		    NEXT_CACHE_TAG_MAX_LENGTH: function() {
		        return NEXT_CACHE_TAG_MAX_LENGTH;
		    },
		    NEXT_DATA_SUFFIX: function() {
		        return NEXT_DATA_SUFFIX;
		    },
		    NEXT_INTERCEPTION_MARKER_PREFIX: function() {
		        return NEXT_INTERCEPTION_MARKER_PREFIX;
		    },
		    NEXT_META_SUFFIX: function() {
		        return NEXT_META_SUFFIX;
		    },
		    NEXT_QUERY_PARAM_PREFIX: function() {
		        return NEXT_QUERY_PARAM_PREFIX;
		    },
		    NON_STANDARD_NODE_ENV: function() {
		        return NON_STANDARD_NODE_ENV;
		    },
		    PAGES_DIR_ALIAS: function() {
		        return PAGES_DIR_ALIAS;
		    },
		    PRERENDER_REVALIDATE_HEADER: function() {
		        return PRERENDER_REVALIDATE_HEADER;
		    },
		    PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER: function() {
		        return PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER;
		    },
		    PUBLIC_DIR_MIDDLEWARE_CONFLICT: function() {
		        return PUBLIC_DIR_MIDDLEWARE_CONFLICT;
		    },
		    ROOT_DIR_ALIAS: function() {
		        return ROOT_DIR_ALIAS;
		    },
		    RSC_ACTION_CLIENT_WRAPPER_ALIAS: function() {
		        return RSC_ACTION_CLIENT_WRAPPER_ALIAS;
		    },
		    RSC_ACTION_ENCRYPTION_ALIAS: function() {
		        return RSC_ACTION_ENCRYPTION_ALIAS;
		    },
		    RSC_ACTION_PROXY_ALIAS: function() {
		        return RSC_ACTION_PROXY_ALIAS;
		    },
		    RSC_ACTION_VALIDATE_ALIAS: function() {
		        return RSC_ACTION_VALIDATE_ALIAS;
		    },
		    RSC_MOD_REF_PROXY_ALIAS: function() {
		        return RSC_MOD_REF_PROXY_ALIAS;
		    },
		    RSC_PREFETCH_SUFFIX: function() {
		        return RSC_PREFETCH_SUFFIX;
		    },
		    RSC_SUFFIX: function() {
		        return RSC_SUFFIX;
		    },
		    SERVER_PROPS_EXPORT_ERROR: function() {
		        return SERVER_PROPS_EXPORT_ERROR;
		    },
		    SERVER_PROPS_GET_INIT_PROPS_CONFLICT: function() {
		        return SERVER_PROPS_GET_INIT_PROPS_CONFLICT;
		    },
		    SERVER_PROPS_SSG_CONFLICT: function() {
		        return SERVER_PROPS_SSG_CONFLICT;
		    },
		    SERVER_RUNTIME: function() {
		        return SERVER_RUNTIME;
		    },
		    SSG_FALLBACK_EXPORT_ERROR: function() {
		        return SSG_FALLBACK_EXPORT_ERROR;
		    },
		    SSG_GET_INITIAL_PROPS_CONFLICT: function() {
		        return SSG_GET_INITIAL_PROPS_CONFLICT;
		    },
		    STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR: function() {
		        return STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR;
		    },
		    UNSTABLE_REVALIDATE_RENAME_ERROR: function() {
		        return UNSTABLE_REVALIDATE_RENAME_ERROR;
		    },
		    WEBPACK_LAYERS: function() {
		        return WEBPACK_LAYERS;
		    },
		    WEBPACK_RESOURCE_QUERIES: function() {
		        return WEBPACK_RESOURCE_QUERIES;
		    }
		});
		const NEXT_QUERY_PARAM_PREFIX = "nxtP";
		const NEXT_INTERCEPTION_MARKER_PREFIX = "nxtI";
		const PRERENDER_REVALIDATE_HEADER = "x-prerender-revalidate";
		const PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER = "x-prerender-revalidate-if-generated";
		const RSC_PREFETCH_SUFFIX = ".prefetch.rsc";
		const RSC_SUFFIX = ".rsc";
		const ACTION_SUFFIX = ".action";
		const NEXT_DATA_SUFFIX = ".json";
		const NEXT_META_SUFFIX = ".meta";
		const NEXT_BODY_SUFFIX = ".body";
		const NEXT_CACHE_TAGS_HEADER = "x-next-cache-tags";
		const NEXT_CACHE_SOFT_TAGS_HEADER = "x-next-cache-soft-tags";
		const NEXT_CACHE_REVALIDATED_TAGS_HEADER = "x-next-revalidated-tags";
		const NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER = "x-next-revalidate-tag-token";
		const NEXT_CACHE_TAG_MAX_ITEMS = 128;
		const NEXT_CACHE_TAG_MAX_LENGTH = 256;
		const NEXT_CACHE_SOFT_TAG_MAX_LENGTH = 1024;
		const NEXT_CACHE_IMPLICIT_TAG_ID = "_N_T_";
		const CACHE_ONE_YEAR = 31536000;
		const MIDDLEWARE_FILENAME = "middleware";
		const MIDDLEWARE_LOCATION_REGEXP = `(?:src/)?${MIDDLEWARE_FILENAME}`;
		const INSTRUMENTATION_HOOK_FILENAME = "instrumentation";
		const PAGES_DIR_ALIAS = "private-next-pages";
		const DOT_NEXT_ALIAS = "private-dot-next";
		const ROOT_DIR_ALIAS = "private-next-root-dir";
		const APP_DIR_ALIAS = "private-next-app-dir";
		const RSC_MOD_REF_PROXY_ALIAS = "private-next-rsc-mod-ref-proxy";
		const RSC_ACTION_VALIDATE_ALIAS = "private-next-rsc-action-validate";
		const RSC_ACTION_PROXY_ALIAS = "private-next-rsc-server-reference";
		const RSC_ACTION_ENCRYPTION_ALIAS = "private-next-rsc-action-encryption";
		const RSC_ACTION_CLIENT_WRAPPER_ALIAS = "private-next-rsc-action-client-wrapper";
		const PUBLIC_DIR_MIDDLEWARE_CONFLICT = `You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://nextjs.org/docs/messages/public-next-folder-conflict`;
		const SSG_GET_INITIAL_PROPS_CONFLICT = `You can not use getInitialProps with getStaticProps. To use SSG, please remove your getInitialProps`;
		const SERVER_PROPS_GET_INIT_PROPS_CONFLICT = `You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.`;
		const SERVER_PROPS_SSG_CONFLICT = `You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps`;
		const STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR = `can not have getInitialProps/getServerSideProps, https://nextjs.org/docs/messages/404-get-initial-props`;
		const SERVER_PROPS_EXPORT_ERROR = `pages with \`getServerSideProps\` can not be exported. See more info here: https://nextjs.org/docs/messages/gssp-export`;
		const GSP_NO_RETURNED_VALUE = "Your `getStaticProps` function did not return an object. Did you forget to add a `return`?";
		const GSSP_NO_RETURNED_VALUE = "Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?";
		const UNSTABLE_REVALIDATE_RENAME_ERROR = "The `unstable_revalidate` property is available for general use.\n" + "Please use `revalidate` instead.";
		const GSSP_COMPONENT_MEMBER_ERROR = `can not be attached to a page's component and must be exported from the page. See more info here: https://nextjs.org/docs/messages/gssp-component-member`;
		const NON_STANDARD_NODE_ENV = `You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env`;
		const SSG_FALLBACK_EXPORT_ERROR = `Pages with \`fallback\` enabled in \`getStaticPaths\` can not be exported. See more info here: https://nextjs.org/docs/messages/ssg-fallback-true-export`;
		const ESLINT_DEFAULT_DIRS = [
		    "app",
		    "pages",
		    "components",
		    "lib",
		    "src"
		];
		const SERVER_RUNTIME = {
		    edge: "edge",
		    experimentalEdge: "experimental-edge",
		    nodejs: "nodejs"
		};
		/**
		 * The names of the webpack layers. These layers are the primitives for the
		 * webpack chunks.
		 */ const WEBPACK_LAYERS_NAMES = {
		    /**
		   * The layer for the shared code between the client and server bundles.
		   */ shared: "shared",
		    /**
		   * React Server Components layer (rsc).
		   */ reactServerComponents: "rsc",
		    /**
		   * Server Side Rendering layer for app (ssr).
		   */ serverSideRendering: "ssr",
		    /**
		   * The browser client bundle layer for actions.
		   */ actionBrowser: "action-browser",
		    /**
		   * The layer for the API routes.
		   */ api: "api",
		    /**
		   * The layer for the middleware code.
		   */ middleware: "middleware",
		    /**
		   * The layer for the instrumentation hooks.
		   */ instrument: "instrument",
		    /**
		   * The layer for assets on the edge.
		   */ edgeAsset: "edge-asset",
		    /**
		   * The browser client bundle layer for App directory.
		   */ appPagesBrowser: "app-pages-browser",
		    /**
		   * The server bundle layer for metadata routes.
		   */ appMetadataRoute: "app-metadata-route",
		    /**
		   * The layer for the server bundle for App Route handlers.
		   */ appRouteHandler: "app-route-handler"
		};
		const WEBPACK_LAYERS = {
		    ...WEBPACK_LAYERS_NAMES,
		    GROUP: {
		        serverOnly: [
		            WEBPACK_LAYERS_NAMES.reactServerComponents,
		            WEBPACK_LAYERS_NAMES.actionBrowser,
		            WEBPACK_LAYERS_NAMES.appMetadataRoute,
		            WEBPACK_LAYERS_NAMES.appRouteHandler,
		            WEBPACK_LAYERS_NAMES.instrument
		        ],
		        clientOnly: [
		            WEBPACK_LAYERS_NAMES.serverSideRendering,
		            WEBPACK_LAYERS_NAMES.appPagesBrowser
		        ],
		        nonClientServerTarget: [
		            // middleware and pages api
		            WEBPACK_LAYERS_NAMES.middleware,
		            WEBPACK_LAYERS_NAMES.api
		        ],
		        app: [
		            WEBPACK_LAYERS_NAMES.reactServerComponents,
		            WEBPACK_LAYERS_NAMES.actionBrowser,
		            WEBPACK_LAYERS_NAMES.appMetadataRoute,
		            WEBPACK_LAYERS_NAMES.appRouteHandler,
		            WEBPACK_LAYERS_NAMES.serverSideRendering,
		            WEBPACK_LAYERS_NAMES.appPagesBrowser,
		            WEBPACK_LAYERS_NAMES.shared,
		            WEBPACK_LAYERS_NAMES.instrument
		        ]
		    }
		};
		const WEBPACK_RESOURCE_QUERIES = {
		    edgeSSREntry: "__next_edge_ssr_entry__",
		    metadata: "__next_metadata__",
		    metadataRoute: "__next_metadata_route__",
		    metadataImageMeta: "__next_metadata_image_meta__"
		};

		
	} (constants));
	return constants;
}

var escapeRegexp = {};

var hasRequiredEscapeRegexp;

function requireEscapeRegexp () {
	if (hasRequiredEscapeRegexp) return escapeRegexp;
	hasRequiredEscapeRegexp = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "escapeStringRegexp", {
		    enumerable: true,
		    get: function() {
		        return escapeStringRegexp;
		    }
		});
		const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
		const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;
		function escapeStringRegexp(str) {
		    // see also: https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escapeRegExp.js#L23
		    if (reHasRegExp.test(str)) {
		        return str.replace(reReplaceRegExp, "\\$&");
		    }
		    return str;
		}

		
	} (escapeRegexp));
	return escapeRegexp;
}

var hasRequiredRouteRegex;

function requireRouteRegex () {
	if (hasRequiredRouteRegex) return routeRegex;
	hasRequiredRouteRegex = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    getNamedMiddlewareRegex: function() {
		        return getNamedMiddlewareRegex;
		    },
		    getNamedRouteRegex: function() {
		        return getNamedRouteRegex;
		    },
		    getRouteRegex: function() {
		        return getRouteRegex;
		    },
		    parseParameter: function() {
		        return parseParameter;
		    }
		});
		const _constants = requireConstants();
		const _interceptionroutes = requireInterceptionRoutes();
		const _escaperegexp = requireEscapeRegexp();
		const _removetrailingslash = requireRemoveTrailingSlash();
		function parseParameter(param) {
		    const optional = param.startsWith("[") && param.endsWith("]");
		    if (optional) {
		        param = param.slice(1, -1);
		    }
		    const repeat = param.startsWith("...");
		    if (repeat) {
		        param = param.slice(3);
		    }
		    return {
		        key: param,
		        repeat,
		        optional
		    };
		}
		function getParametrizedRoute(route) {
		    const segments = (0, _removetrailingslash.removeTrailingSlash)(route).slice(1).split("/");
		    const groups = {};
		    let groupIndex = 1;
		    return {
		        parameterizedRoute: segments.map((segment)=>{
		            const markerMatch = _interceptionroutes.INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m));
		            const paramMatches = segment.match(/\[((?:\[.*\])|.+)\]/) // Check for parameters
		            ;
		            if (markerMatch && paramMatches) {
		                const { key, optional, repeat } = parseParameter(paramMatches[1]);
		                groups[key] = {
		                    pos: groupIndex++,
		                    repeat,
		                    optional
		                };
		                return "/" + (0, _escaperegexp.escapeStringRegexp)(markerMatch) + "([^/]+?)";
		            } else if (paramMatches) {
		                const { key, repeat, optional } = parseParameter(paramMatches[1]);
		                groups[key] = {
		                    pos: groupIndex++,
		                    repeat,
		                    optional
		                };
		                return repeat ? optional ? "(?:/(.+?))?" : "/(.+?)" : "/([^/]+?)";
		            } else {
		                return "/" + (0, _escaperegexp.escapeStringRegexp)(segment);
		            }
		        }).join(""),
		        groups
		    };
		}
		function getRouteRegex(normalizedRoute) {
		    const { parameterizedRoute, groups } = getParametrizedRoute(normalizedRoute);
		    return {
		        re: new RegExp("^" + parameterizedRoute + "(?:/)?$"),
		        groups: groups
		    };
		}
		/**
		 * Builds a function to generate a minimal routeKey using only a-z and minimal
		 * number of characters.
		 */ function buildGetSafeRouteKey() {
		    let i = 0;
		    return ()=>{
		        let routeKey = "";
		        let j = ++i;
		        while(j > 0){
		            routeKey += String.fromCharCode(97 + (j - 1) % 26);
		            j = Math.floor((j - 1) / 26);
		        }
		        return routeKey;
		    };
		}
		function getSafeKeyFromSegment(param) {
		    let { interceptionMarker, getSafeRouteKey, segment, routeKeys, keyPrefix } = param;
		    const { key, optional, repeat } = parseParameter(segment);
		    // replace any non-word characters since they can break
		    // the named regex
		    let cleanedKey = key.replace(/\W/g, "");
		    if (keyPrefix) {
		        cleanedKey = "" + keyPrefix + cleanedKey;
		    }
		    let invalidKey = false;
		    // check if the key is still invalid and fallback to using a known
		    // safe key
		    if (cleanedKey.length === 0 || cleanedKey.length > 30) {
		        invalidKey = true;
		    }
		    if (!isNaN(parseInt(cleanedKey.slice(0, 1)))) {
		        invalidKey = true;
		    }
		    if (invalidKey) {
		        cleanedKey = getSafeRouteKey();
		    }
		    if (keyPrefix) {
		        routeKeys[cleanedKey] = "" + keyPrefix + key;
		    } else {
		        routeKeys[cleanedKey] = key;
		    }
		    // if the segment has an interception marker, make sure that's part of the regex pattern
		    // this is to ensure that the route with the interception marker doesn't incorrectly match
		    // the non-intercepted route (ie /app/(.)[username] should not match /app/[username])
		    const interceptionPrefix = interceptionMarker ? (0, _escaperegexp.escapeStringRegexp)(interceptionMarker) : "";
		    return repeat ? optional ? "(?:/" + interceptionPrefix + "(?<" + cleanedKey + ">.+?))?" : "/" + interceptionPrefix + "(?<" + cleanedKey + ">.+?)" : "/" + interceptionPrefix + "(?<" + cleanedKey + ">[^/]+?)";
		}
		function getNamedParametrizedRoute(route, prefixRouteKeys) {
		    const segments = (0, _removetrailingslash.removeTrailingSlash)(route).slice(1).split("/");
		    const getSafeRouteKey = buildGetSafeRouteKey();
		    const routeKeys = {};
		    return {
		        namedParameterizedRoute: segments.map((segment)=>{
		            const hasInterceptionMarker = _interceptionroutes.INTERCEPTION_ROUTE_MARKERS.some((m)=>segment.startsWith(m));
		            const paramMatches = segment.match(/\[((?:\[.*\])|.+)\]/) // Check for parameters
		            ;
		            if (hasInterceptionMarker && paramMatches) {
		                const [usedMarker] = segment.split(paramMatches[0]);
		                return getSafeKeyFromSegment({
		                    getSafeRouteKey,
		                    interceptionMarker: usedMarker,
		                    segment: paramMatches[1],
		                    routeKeys,
		                    keyPrefix: prefixRouteKeys ? _constants.NEXT_INTERCEPTION_MARKER_PREFIX : undefined
		                });
		            } else if (paramMatches) {
		                return getSafeKeyFromSegment({
		                    getSafeRouteKey,
		                    segment: paramMatches[1],
		                    routeKeys,
		                    keyPrefix: prefixRouteKeys ? _constants.NEXT_QUERY_PARAM_PREFIX : undefined
		                });
		            } else {
		                return "/" + (0, _escaperegexp.escapeStringRegexp)(segment);
		            }
		        }).join(""),
		        routeKeys
		    };
		}
		function getNamedRouteRegex(normalizedRoute, prefixRouteKey) {
		    const result = getNamedParametrizedRoute(normalizedRoute, prefixRouteKey);
		    return {
		        ...getRouteRegex(normalizedRoute),
		        namedRegex: "^" + result.namedParameterizedRoute + "(?:/)?$",
		        routeKeys: result.routeKeys
		    };
		}
		function getNamedMiddlewareRegex(normalizedRoute, options) {
		    const { parameterizedRoute } = getParametrizedRoute(normalizedRoute);
		    const { catchAll = true } = options;
		    if (parameterizedRoute === "/") {
		        let catchAllRegex = catchAll ? ".*" : "";
		        return {
		            namedRegex: "^/" + catchAllRegex + "$"
		        };
		    }
		    const { namedParameterizedRoute } = getNamedParametrizedRoute(normalizedRoute, false);
		    let catchAllGroupedRegex = catchAll ? "(?:(/.*)?)" : "";
		    return {
		        namedRegex: "^" + namedParameterizedRoute + catchAllGroupedRegex + "$"
		    };
		}

		
	} (routeRegex));
	return routeRegex;
}

var hasRequiredInterpolateAs;

function requireInterpolateAs () {
	if (hasRequiredInterpolateAs) return interpolateAs;
	hasRequiredInterpolateAs = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "interpolateAs", {
		    enumerable: true,
		    get: function() {
		        return interpolateAs;
		    }
		});
		const _routematcher = requireRouteMatcher();
		const _routeregex = requireRouteRegex();
		function interpolateAs(route, asPathname, query) {
		    let interpolatedRoute = "";
		    const dynamicRegex = (0, _routeregex.getRouteRegex)(route);
		    const dynamicGroups = dynamicRegex.groups;
		    const dynamicMatches = // Try to match the dynamic route against the asPath
		    (asPathname !== route ? (0, _routematcher.getRouteMatcher)(dynamicRegex)(asPathname) : "") || // Fall back to reading the values from the href
		    // TODO: should this take priority; also need to change in the router.
		    query;
		    interpolatedRoute = route;
		    const params = Object.keys(dynamicGroups);
		    if (!params.every((param)=>{
		        let value = dynamicMatches[param] || "";
		        const { repeat, optional } = dynamicGroups[param];
		        // support single-level catch-all
		        // TODO: more robust handling for user-error (passing `/`)
		        let replaced = "[" + (repeat ? "..." : "") + param + "]";
		        if (optional) {
		            replaced = (!value ? "/" : "") + "[" + replaced + "]";
		        }
		        if (repeat && !Array.isArray(value)) value = [
		            value
		        ];
		        return (optional || param in dynamicMatches) && // Interpolate group into data URL if present
		        (interpolatedRoute = interpolatedRoute.replace(replaced, repeat ? value.map(// these values should be fully encoded instead of just
		        // path delimiter escaped since they are being inserted
		        // into the URL and we expect URL encoded segments
		        // when parsing dynamic route params
		        (segment)=>encodeURIComponent(segment)).join("/") : encodeURIComponent(value)) || "/");
		    })) {
		        interpolatedRoute = "" // did not satisfy all requirements
		        ;
		    // n.b. We ignore this error because we handle warning for this case in
		    // development in the `<Link>` component directly.
		    }
		    return {
		        params,
		        result: interpolatedRoute
		    };
		}

		
	} (interpolateAs));
	return interpolateAs;
}

var hasRequiredResolveHref;

function requireResolveHref () {
	if (hasRequiredResolveHref) return resolveHref.exports;
	hasRequiredResolveHref = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "resolveHref", {
		    enumerable: true,
		    get: function() {
		        return resolveHref;
		    }
		});
		const _querystring = requireQuerystring();
		const _formaturl = requireFormatUrl();
		const _omit = requireOmit();
		const _utils = requireUtils$1();
		const _normalizetrailingslash = requireNormalizeTrailingSlash();
		const _islocalurl = requireIsLocalUrl();
		const _utils1 = requireUtils();
		const _interpolateas = requireInterpolateAs();
		function resolveHref(router, href, resolveAs) {
		    // we use a dummy base url for relative urls
		    let base;
		    let urlAsString = typeof href === "string" ? href : (0, _formaturl.formatWithValidation)(href);
		    // repeated slashes and backslashes in the URL are considered
		    // invalid and will never match a Next.js page/file
		    const urlProtoMatch = urlAsString.match(/^[a-zA-Z]{1,}:\/\//);
		    const urlAsStringNoProto = urlProtoMatch ? urlAsString.slice(urlProtoMatch[0].length) : urlAsString;
		    const urlParts = urlAsStringNoProto.split("?", 1);
		    if ((urlParts[0] || "").match(/(\/\/|\\)/)) {
		        console.error("Invalid href '" + urlAsString + "' passed to next/router in page: '" + router.pathname + "'. Repeated forward-slashes (//) or backslashes \\ are not valid in the href.");
		        const normalizedUrl = (0, _utils.normalizeRepeatedSlashes)(urlAsStringNoProto);
		        urlAsString = (urlProtoMatch ? urlProtoMatch[0] : "") + normalizedUrl;
		    }
		    // Return because it cannot be routed by the Next.js router
		    if (!(0, _islocalurl.isLocalURL)(urlAsString)) {
		        return resolveAs ? [
		            urlAsString
		        ] : urlAsString;
		    }
		    try {
		        base = new URL(urlAsString.startsWith("#") ? router.asPath : router.pathname, "http://n");
		    } catch (_) {
		        // fallback to / for invalid asPath values e.g. //
		        base = new URL("/", "http://n");
		    }
		    try {
		        const finalUrl = new URL(urlAsString, base);
		        finalUrl.pathname = (0, _normalizetrailingslash.normalizePathTrailingSlash)(finalUrl.pathname);
		        let interpolatedAs = "";
		        if ((0, _utils1.isDynamicRoute)(finalUrl.pathname) && finalUrl.searchParams && resolveAs) {
		            const query = (0, _querystring.searchParamsToUrlQuery)(finalUrl.searchParams);
		            const { result, params } = (0, _interpolateas.interpolateAs)(finalUrl.pathname, finalUrl.pathname, query);
		            if (result) {
		                interpolatedAs = (0, _formaturl.formatWithValidation)({
		                    pathname: result,
		                    hash: finalUrl.hash,
		                    query: (0, _omit.omit)(query, params)
		                });
		            }
		        }
		        // if the origin didn't change, it means we received a relative href
		        const resolvedHref = finalUrl.origin === base.origin ? finalUrl.href.slice(finalUrl.origin.length) : finalUrl.href;
		        return resolveAs ? [
		            resolvedHref,
		            interpolatedAs || resolvedHref
		        ] : resolvedHref;
		    } catch (_) {
		        return resolveAs ? [
		            urlAsString
		        ] : urlAsString;
		    }
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (resolveHref, resolveHref.exports));
	return resolveHref.exports;
}

var addLocale$1 = {exports: {}};

var addLocale = {};

var addPathPrefix = {};

var hasRequiredAddPathPrefix;

function requireAddPathPrefix () {
	if (hasRequiredAddPathPrefix) return addPathPrefix;
	hasRequiredAddPathPrefix = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "addPathPrefix", {
		    enumerable: true,
		    get: function() {
		        return addPathPrefix;
		    }
		});
		const _parsepath = requireParsePath();
		function addPathPrefix(path, prefix) {
		    if (!path.startsWith("/") || !prefix) {
		        return path;
		    }
		    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
		    return "" + prefix + pathname + query + hash;
		}

		
	} (addPathPrefix));
	return addPathPrefix;
}

var hasRequiredAddLocale$1;

function requireAddLocale$1 () {
	if (hasRequiredAddLocale$1) return addLocale;
	hasRequiredAddLocale$1 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "addLocale", {
		    enumerable: true,
		    get: function() {
		        return addLocale;
		    }
		});
		const _addpathprefix = requireAddPathPrefix();
		const _pathhasprefix = requirePathHasPrefix();
		function addLocale(path, locale, defaultLocale, ignorePrefix) {
		    // If no locale was given or the locale is the default locale, we don't need
		    // to prefix the path.
		    if (!locale || locale === defaultLocale) return path;
		    const lower = path.toLowerCase();
		    // If the path is an API path or the path already has the locale prefix, we
		    // don't need to prefix the path.
		    if (!ignorePrefix) {
		        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/api")) return path;
		        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/" + locale.toLowerCase())) return path;
		    }
		    // Add the locale prefix to the path.
		    return (0, _addpathprefix.addPathPrefix)(path, "/" + locale);
		}

		
	} (addLocale));
	return addLocale;
}

var hasRequiredAddLocale;

function requireAddLocale () {
	if (hasRequiredAddLocale) return addLocale$1.exports;
	hasRequiredAddLocale = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "addLocale", {
		    enumerable: true,
		    get: function() {
		        return addLocale;
		    }
		});
		const _normalizetrailingslash = requireNormalizeTrailingSlash();
		const addLocale = function(path) {
		    for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
		        args[_key - 1] = arguments[_key];
		    }
		    if (process.env.__NEXT_I18N_SUPPORT) {
		        return (0, _normalizetrailingslash.normalizePathTrailingSlash)(requireAddLocale$1().addLocale(path, ...args));
		    }
		    return path;
		};

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (addLocale$1, addLocale$1.exports));
	return addLocale$1.exports;
}

var appRouterContext_sharedRuntime = {};

var hasRequiredAppRouterContext_sharedRuntime;

function requireAppRouterContext_sharedRuntime () {
	if (hasRequiredAppRouterContext_sharedRuntime) return appRouterContext_sharedRuntime;
	hasRequiredAppRouterContext_sharedRuntime = 1;
	(function (exports) {
		"use client";
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    AppRouterContext: function() {
		        return AppRouterContext;
		    },
		    GlobalLayoutRouterContext: function() {
		        return GlobalLayoutRouterContext;
		    },
		    LayoutRouterContext: function() {
		        return LayoutRouterContext;
		    },
		    MissingSlotContext: function() {
		        return MissingSlotContext;
		    },
		    TemplateContext: function() {
		        return TemplateContext;
		    }
		});
		const _interop_require_default = _interop_require_default$1;
		const _react = /*#__PURE__*/ _interop_require_default._(React__default);
		const AppRouterContext = _react.default.createContext(null);
		const LayoutRouterContext = _react.default.createContext(null);
		const GlobalLayoutRouterContext = _react.default.createContext(null);
		const TemplateContext = _react.default.createContext(null);
		if (process.env.NODE_ENV !== "production") {
		    AppRouterContext.displayName = "AppRouterContext";
		    LayoutRouterContext.displayName = "LayoutRouterContext";
		    GlobalLayoutRouterContext.displayName = "GlobalLayoutRouterContext";
		    TemplateContext.displayName = "TemplateContext";
		}
		const MissingSlotContext = _react.default.createContext(new Set());

		
	} (appRouterContext_sharedRuntime));
	return appRouterContext_sharedRuntime;
}

var useIntersection = {exports: {}};

var requestIdleCallback = {exports: {}};

var hasRequiredRequestIdleCallback;

function requireRequestIdleCallback () {
	if (hasRequiredRequestIdleCallback) return requestIdleCallback.exports;
	hasRequiredRequestIdleCallback = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    cancelIdleCallback: function() {
		        return cancelIdleCallback;
		    },
		    requestIdleCallback: function() {
		        return requestIdleCallback;
		    }
		});
		const requestIdleCallback = typeof self !== "undefined" && self.requestIdleCallback && self.requestIdleCallback.bind(window) || function(cb) {
		    let start = Date.now();
		    return self.setTimeout(function() {
		        cb({
		            didTimeout: false,
		            timeRemaining: function() {
		                return Math.max(0, 50 - (Date.now() - start));
		            }
		        });
		    }, 1);
		};
		const cancelIdleCallback = typeof self !== "undefined" && self.cancelIdleCallback && self.cancelIdleCallback.bind(window) || function(id) {
		    return clearTimeout(id);
		};

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (requestIdleCallback, requestIdleCallback.exports));
	return requestIdleCallback.exports;
}

var hasRequiredUseIntersection;

function requireUseIntersection () {
	if (hasRequiredUseIntersection) return useIntersection.exports;
	hasRequiredUseIntersection = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "useIntersection", {
		    enumerable: true,
		    get: function() {
		        return useIntersection;
		    }
		});
		const _react = React__default;
		const _requestidlecallback = requireRequestIdleCallback();
		const hasIntersectionObserver = typeof IntersectionObserver === "function";
		const observers = new Map();
		const idList = [];
		function createObserver(options) {
		    const id = {
		        root: options.root || null,
		        margin: options.rootMargin || ""
		    };
		    const existing = idList.find((obj)=>obj.root === id.root && obj.margin === id.margin);
		    let instance;
		    if (existing) {
		        instance = observers.get(existing);
		        if (instance) {
		            return instance;
		        }
		    }
		    const elements = new Map();
		    const observer = new IntersectionObserver((entries)=>{
		        entries.forEach((entry)=>{
		            const callback = elements.get(entry.target);
		            const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
		            if (callback && isVisible) {
		                callback(isVisible);
		            }
		        });
		    }, options);
		    instance = {
		        id,
		        observer,
		        elements
		    };
		    idList.push(id);
		    observers.set(id, instance);
		    return instance;
		}
		function observe(element, callback, options) {
		    const { id, observer, elements } = createObserver(options);
		    elements.set(element, callback);
		    observer.observe(element);
		    return function unobserve() {
		        elements.delete(element);
		        observer.unobserve(element);
		        // Destroy observer when there's nothing left to watch:
		        if (elements.size === 0) {
		            observer.disconnect();
		            observers.delete(id);
		            const index = idList.findIndex((obj)=>obj.root === id.root && obj.margin === id.margin);
		            if (index > -1) {
		                idList.splice(index, 1);
		            }
		        }
		    };
		}
		function useIntersection(param) {
		    let { rootRef, rootMargin, disabled } = param;
		    const isDisabled = disabled || !hasIntersectionObserver;
		    const [visible, setVisible] = (0, _react.useState)(false);
		    const elementRef = (0, _react.useRef)(null);
		    const setElement = (0, _react.useCallback)((element)=>{
		        elementRef.current = element;
		    }, []);
		    (0, _react.useEffect)(()=>{
		        if (hasIntersectionObserver) {
		            if (isDisabled || visible) return;
		            const element = elementRef.current;
		            if (element && element.tagName) {
		                const unobserve = observe(element, (isVisible)=>isVisible && setVisible(isVisible), {
		                    root: rootRef == null ? void 0 : rootRef.current,
		                    rootMargin
		                });
		                return unobserve;
		            }
		        } else {
		            if (!visible) {
		                const idleCallback = (0, _requestidlecallback.requestIdleCallback)(()=>setVisible(true));
		                return ()=>(0, _requestidlecallback.cancelIdleCallback)(idleCallback);
		            }
		        }
		    // eslint-disable-next-line react-hooks/exhaustive-deps
		    }, [
		        isDisabled,
		        rootMargin,
		        rootRef,
		        visible,
		        elementRef.current
		    ]);
		    const resetVisible = (0, _react.useCallback)(()=>{
		        setVisible(false);
		    }, []);
		    return [
		        setElement,
		        visible,
		        resetVisible
		    ];
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (useIntersection, useIntersection.exports));
	return useIntersection.exports;
}

var getDomainLocale = {exports: {}};

var normalizeLocalePath$1 = {exports: {}};

var normalizeLocalePath = {};

var hasRequiredNormalizeLocalePath$1;

function requireNormalizeLocalePath$1 () {
	if (hasRequiredNormalizeLocalePath$1) return normalizeLocalePath;
	hasRequiredNormalizeLocalePath$1 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "normalizeLocalePath", {
		    enumerable: true,
		    get: function() {
		        return normalizeLocalePath;
		    }
		});
		function normalizeLocalePath(pathname, locales) {
		    let detectedLocale;
		    // first item will be empty string from splitting at first char
		    const pathnameParts = pathname.split("/");
		    (locales || []).some((locale)=>{
		        if (pathnameParts[1] && pathnameParts[1].toLowerCase() === locale.toLowerCase()) {
		            detectedLocale = locale;
		            pathnameParts.splice(1, 1);
		            pathname = pathnameParts.join("/") || "/";
		            return true;
		        }
		        return false;
		    });
		    return {
		        pathname,
		        detectedLocale
		    };
		}

		
	} (normalizeLocalePath));
	return normalizeLocalePath;
}

var hasRequiredNormalizeLocalePath;

function requireNormalizeLocalePath () {
	if (hasRequiredNormalizeLocalePath) return normalizeLocalePath$1.exports;
	hasRequiredNormalizeLocalePath = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "normalizeLocalePath", {
		    enumerable: true,
		    get: function() {
		        return normalizeLocalePath;
		    }
		});
		const normalizeLocalePath = (pathname, locales)=>{
		    if (process.env.__NEXT_I18N_SUPPORT) {
		        return requireNormalizeLocalePath$1().normalizeLocalePath(pathname, locales);
		    }
		    return {
		        pathname,
		        detectedLocale: undefined
		    };
		};

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (normalizeLocalePath$1, normalizeLocalePath$1.exports));
	return normalizeLocalePath$1.exports;
}

var detectDomainLocale$1 = {exports: {}};

var detectDomainLocale = {};

var hasRequiredDetectDomainLocale$1;

function requireDetectDomainLocale$1 () {
	if (hasRequiredDetectDomainLocale$1) return detectDomainLocale;
	hasRequiredDetectDomainLocale$1 = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "detectDomainLocale", {
		    enumerable: true,
		    get: function() {
		        return detectDomainLocale;
		    }
		});
		function detectDomainLocale(domainItems, hostname, detectedLocale) {
		    if (!domainItems) return;
		    if (detectedLocale) {
		        detectedLocale = detectedLocale.toLowerCase();
		    }
		    for (const item of domainItems){
		        var _item_domain, _item_locales;
		        // remove port if present
		        const domainHostname = (_item_domain = item.domain) == null ? void 0 : _item_domain.split(":", 1)[0].toLowerCase();
		        if (hostname === domainHostname || detectedLocale === item.defaultLocale.toLowerCase() || ((_item_locales = item.locales) == null ? void 0 : _item_locales.some((locale)=>locale.toLowerCase() === detectedLocale))) {
		            return item;
		        }
		    }
		}

		
	} (detectDomainLocale));
	return detectDomainLocale;
}

var hasRequiredDetectDomainLocale;

function requireDetectDomainLocale () {
	if (hasRequiredDetectDomainLocale) return detectDomainLocale$1.exports;
	hasRequiredDetectDomainLocale = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "detectDomainLocale", {
		    enumerable: true,
		    get: function() {
		        return detectDomainLocale;
		    }
		});
		const detectDomainLocale = function() {
		    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
		        args[_key] = arguments[_key];
		    }
		    if (process.env.__NEXT_I18N_SUPPORT) {
		        return requireDetectDomainLocale$1().detectDomainLocale(...args);
		    }
		};

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (detectDomainLocale$1, detectDomainLocale$1.exports));
	return detectDomainLocale$1.exports;
}

var hasRequiredGetDomainLocale;

function requireGetDomainLocale () {
	if (hasRequiredGetDomainLocale) return getDomainLocale.exports;
	hasRequiredGetDomainLocale = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "getDomainLocale", {
		    enumerable: true,
		    get: function() {
		        return getDomainLocale;
		    }
		});
		const _normalizetrailingslash = requireNormalizeTrailingSlash();
		const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";
		function getDomainLocale(path, locale, locales, domainLocales) {
		    if (process.env.__NEXT_I18N_SUPPORT) {
		        const normalizeLocalePath = requireNormalizeLocalePath().normalizeLocalePath;
		        const detectDomainLocale = requireDetectDomainLocale().detectDomainLocale;
		        const target = locale || normalizeLocalePath(path, locales).detectedLocale;
		        const domain = detectDomainLocale(domainLocales, undefined, target);
		        if (domain) {
		            const proto = "http" + (domain.http ? "" : "s") + "://";
		            const finalLocale = target === domain.defaultLocale ? "" : "/" + target;
		            return "" + proto + domain.domain + (0, _normalizetrailingslash.normalizePathTrailingSlash)("" + basePath + finalLocale + path);
		        }
		        return false;
		    } else {
		        return false;
		    }
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (getDomainLocale, getDomainLocale.exports));
	return getDomainLocale.exports;
}

var addBasePath = {exports: {}};

var hasRequiredAddBasePath;

function requireAddBasePath () {
	if (hasRequiredAddBasePath) return addBasePath.exports;
	hasRequiredAddBasePath = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		Object.defineProperty(exports, "addBasePath", {
		    enumerable: true,
		    get: function() {
		        return addBasePath;
		    }
		});
		const _addpathprefix = requireAddPathPrefix();
		const _normalizetrailingslash = requireNormalizeTrailingSlash();
		const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";
		function addBasePath(path, required) {
		    return (0, _normalizetrailingslash.normalizePathTrailingSlash)(process.env.__NEXT_MANUAL_CLIENT_BASE_PATH && !required ? path : (0, _addpathprefix.addPathPrefix)(path, basePath));
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (addBasePath, addBasePath.exports));
	return addBasePath.exports;
}

var routerReducerTypes = {exports: {}};

var hasRequiredRouterReducerTypes;

function requireRouterReducerTypes () {
	if (hasRequiredRouterReducerTypes) return routerReducerTypes.exports;
	hasRequiredRouterReducerTypes = 1;
	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", {
		    value: true
		});
		function _export(target, all) {
		    for(var name in all)Object.defineProperty(target, name, {
		        enumerable: true,
		        get: all[name]
		    });
		}
		_export(exports, {
		    ACTION_FAST_REFRESH: function() {
		        return ACTION_FAST_REFRESH;
		    },
		    ACTION_NAVIGATE: function() {
		        return ACTION_NAVIGATE;
		    },
		    ACTION_PREFETCH: function() {
		        return ACTION_PREFETCH;
		    },
		    ACTION_REFRESH: function() {
		        return ACTION_REFRESH;
		    },
		    ACTION_RESTORE: function() {
		        return ACTION_RESTORE;
		    },
		    ACTION_SERVER_ACTION: function() {
		        return ACTION_SERVER_ACTION;
		    },
		    ACTION_SERVER_PATCH: function() {
		        return ACTION_SERVER_PATCH;
		    },
		    PrefetchCacheEntryStatus: function() {
		        return PrefetchCacheEntryStatus;
		    },
		    PrefetchKind: function() {
		        return PrefetchKind;
		    },
		    isThenable: function() {
		        return isThenable;
		    }
		});
		const ACTION_REFRESH = "refresh";
		const ACTION_NAVIGATE = "navigate";
		const ACTION_RESTORE = "restore";
		const ACTION_SERVER_PATCH = "server-patch";
		const ACTION_PREFETCH = "prefetch";
		const ACTION_FAST_REFRESH = "fast-refresh";
		const ACTION_SERVER_ACTION = "server-action";
		var PrefetchKind;
		(function(PrefetchKind) {
		    PrefetchKind["AUTO"] = "auto";
		    PrefetchKind["FULL"] = "full";
		    PrefetchKind["TEMPORARY"] = "temporary";
		})(PrefetchKind || (PrefetchKind = {}));
		var PrefetchCacheEntryStatus;
		(function(PrefetchCacheEntryStatus) {
		    PrefetchCacheEntryStatus["fresh"] = "fresh";
		    PrefetchCacheEntryStatus["reusable"] = "reusable";
		    PrefetchCacheEntryStatus["expired"] = "expired";
		    PrefetchCacheEntryStatus["stale"] = "stale";
		})(PrefetchCacheEntryStatus || (PrefetchCacheEntryStatus = {}));
		function isThenable(value) {
		    // TODO: We don't gain anything from this abstraction. It's unsound, and only
		    // makes sense in the specific places where we use it. So it's better to keep
		    // the type coercion inline, instead of leaking this to other places in
		    // the codebase.
		    return value && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
		}

		if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
		  Object.defineProperty(exports.default, '__esModule', { value: true });
		  Object.assign(exports.default, exports);
		  module.exports = exports.default;
		}

		
	} (routerReducerTypes, routerReducerTypes.exports));
	return routerReducerTypes.exports;
}

(function (module, exports) {
	"use client";
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	Object.defineProperty(exports, "default", {
	    enumerable: true,
	    get: function() {
	        return _default;
	    }
	});
	const _interop_require_default = _interop_require_default$1;
	const _jsxruntime = require$$2;
	const _react = /*#__PURE__*/ _interop_require_default._(React__default);
	const _resolvehref = requireResolveHref();
	const _islocalurl = requireIsLocalUrl();
	const _formaturl = requireFormatUrl();
	const _utils = requireUtils$1();
	const _addlocale = requireAddLocale();
	const _routercontextsharedruntime = requireRouterContext_sharedRuntime();
	const _approutercontextsharedruntime = requireAppRouterContext_sharedRuntime();
	const _useintersection = requireUseIntersection();
	const _getdomainlocale = requireGetDomainLocale();
	const _addbasepath = requireAddBasePath();
	const _routerreducertypes = requireRouterReducerTypes();
	const prefetched = new Set();
	function prefetch(router, href, as, options, appOptions, isAppRouter) {
	    if (typeof window === "undefined") {
	        return;
	    }
	    // app-router supports external urls out of the box so it shouldn't short-circuit here as support for e.g. `replace` is added in the app-router.
	    if (!isAppRouter && !(0, _islocalurl.isLocalURL)(href)) {
	        return;
	    }
	    // We should only dedupe requests when experimental.optimisticClientCache is
	    // disabled.
	    if (!options.bypassPrefetchedCheck) {
	        const locale = // Let the link's locale prop override the default router locale.
	        typeof options.locale !== "undefined" ? options.locale : "locale" in router ? router.locale : undefined;
	        const prefetchedKey = href + "%" + as + "%" + locale;
	        // If we've already fetched the key, then don't prefetch it again!
	        if (prefetched.has(prefetchedKey)) {
	            return;
	        }
	        // Mark this URL as prefetched.
	        prefetched.add(prefetchedKey);
	    }
	    const doPrefetch = async ()=>{
	        if (isAppRouter) {
	            // note that `appRouter.prefetch()` is currently sync,
	            // so we have to wrap this call in an async function to be able to catch() errors below.
	            return router.prefetch(href, appOptions);
	        } else {
	            return router.prefetch(href, as, options);
	        }
	    };
	    // Prefetch the JSON page if asked (only in the client)
	    // We need to handle a prefetch error here since we may be
	    // loading with priority which can reject but we don't
	    // want to force navigation since this is only a prefetch
	    doPrefetch().catch((err)=>{
	        if (process.env.NODE_ENV !== "production") {
	            // rethrow to show invalid URL errors
	            throw err;
	        }
	    });
	}
	function isModifiedEvent(event) {
	    const eventTarget = event.currentTarget;
	    const target = eventTarget.getAttribute("target");
	    return target && target !== "_self" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || // triggers resource download
	    event.nativeEvent && event.nativeEvent.which === 2;
	}
	function linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAppRouter) {
	    const { nodeName } = e.currentTarget;
	    // anchors inside an svg have a lowercase nodeName
	    const isAnchorNodeName = nodeName.toUpperCase() === "A";
	    if (isAnchorNodeName && (isModifiedEvent(e) || // app-router supports external urls out of the box so it shouldn't short-circuit here as support for e.g. `replace` is added in the app-router.
	    !isAppRouter && !(0, _islocalurl.isLocalURL)(href))) {
	        // ignore click for browser’s default behavior
	        return;
	    }
	    e.preventDefault();
	    const navigate = ()=>{
	        // If the router is an NextRouter instance it will have `beforePopState`
	        const routerScroll = scroll != null ? scroll : true;
	        if ("beforePopState" in router) {
	            router[replace ? "replace" : "push"](href, as, {
	                shallow,
	                locale,
	                scroll: routerScroll
	            });
	        } else {
	            router[replace ? "replace" : "push"](as || href, {
	                scroll: routerScroll
	            });
	        }
	    };
	    if (isAppRouter) {
	        _react.default.startTransition(navigate);
	    } else {
	        navigate();
	    }
	}
	function formatStringOrUrl(urlObjOrString) {
	    if (typeof urlObjOrString === "string") {
	        return urlObjOrString;
	    }
	    return (0, _formaturl.formatUrl)(urlObjOrString);
	}
	/**
	 * A React component that extends the HTML `<a>` element to provide [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
	 * and client-side navigation between routes.
	 *
	 * It is the primary way to navigate between routes in Next.js.
	 *
	 * Read more: [Next.js docs: `<Link>`](https://nextjs.org/docs/app/api-reference/components/link)
	 */ const Link = /*#__PURE__*/ _react.default.forwardRef(function LinkComponent(props, forwardedRef) {
	    let children;
	    const { href: hrefProp, as: asProp, children: childrenProp, prefetch: prefetchProp = null, passHref, replace, shallow, scroll, locale, onClick, onMouseEnter: onMouseEnterProp, onTouchStart: onTouchStartProp, legacyBehavior = false, ...restProps } = props;
	    children = childrenProp;
	    if (legacyBehavior && (typeof children === "string" || typeof children === "number")) {
	        children = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
	            children: children
	        });
	    }
	    const pagesRouter = _react.default.useContext(_routercontextsharedruntime.RouterContext);
	    const appRouter = _react.default.useContext(_approutercontextsharedruntime.AppRouterContext);
	    const router = pagesRouter != null ? pagesRouter : appRouter;
	    // We're in the app directory if there is no pages router.
	    const isAppRouter = !pagesRouter;
	    const prefetchEnabled = prefetchProp !== false;
	    /**
	     * The possible states for prefetch are:
	     * - null: this is the default "auto" mode, where we will prefetch partially if the link is in the viewport
	     * - true: we will prefetch if the link is visible and prefetch the full page, not just partially
	     * - false: we will not prefetch if in the viewport at all
	     */ const appPrefetchKind = prefetchProp === null ? _routerreducertypes.PrefetchKind.AUTO : _routerreducertypes.PrefetchKind.FULL;
	    if (process.env.NODE_ENV !== "production") {
	        function createPropError(args) {
	            return new Error("Failed prop type: The prop `" + args.key + "` expects a " + args.expected + " in `<Link>`, but got `" + args.actual + "` instead." + (typeof window !== "undefined" ? "\nOpen your browser's console to view the Component stack trace." : ""));
	        }
	        // TypeScript trick for type-guarding:
	        const requiredPropsGuard = {
	            href: true
	        };
	        const requiredProps = Object.keys(requiredPropsGuard);
	        requiredProps.forEach((key)=>{
	            if (key === "href") {
	                if (props[key] == null || typeof props[key] !== "string" && typeof props[key] !== "object") {
	                    throw createPropError({
	                        key,
	                        expected: "`string` or `object`",
	                        actual: props[key] === null ? "null" : typeof props[key]
	                    });
	                }
	            }
	        });
	        // TypeScript trick for type-guarding:
	        const optionalPropsGuard = {
	            as: true,
	            replace: true,
	            scroll: true,
	            shallow: true,
	            passHref: true,
	            prefetch: true,
	            locale: true,
	            onClick: true,
	            onMouseEnter: true,
	            onTouchStart: true,
	            legacyBehavior: true
	        };
	        const optionalProps = Object.keys(optionalPropsGuard);
	        optionalProps.forEach((key)=>{
	            const valType = typeof props[key];
	            if (key === "as") {
	                if (props[key] && valType !== "string" && valType !== "object") {
	                    throw createPropError({
	                        key,
	                        expected: "`string` or `object`",
	                        actual: valType
	                    });
	                }
	            } else if (key === "locale") {
	                if (props[key] && valType !== "string") {
	                    throw createPropError({
	                        key,
	                        expected: "`string`",
	                        actual: valType
	                    });
	                }
	            } else if (key === "onClick" || key === "onMouseEnter" || key === "onTouchStart") {
	                if (props[key] && valType !== "function") {
	                    throw createPropError({
	                        key,
	                        expected: "`function`",
	                        actual: valType
	                    });
	                }
	            } else if (key === "replace" || key === "scroll" || key === "shallow" || key === "passHref" || key === "prefetch" || key === "legacyBehavior") {
	                if (props[key] != null && valType !== "boolean") {
	                    throw createPropError({
	                        key,
	                        expected: "`boolean`",
	                        actual: valType
	                    });
	                }
	            } else ;
	        });
	        // This hook is in a conditional but that is ok because `process.env.NODE_ENV` never changes
	        // eslint-disable-next-line react-hooks/rules-of-hooks
	        const hasWarned = _react.default.useRef(false);
	        if (props.prefetch && !hasWarned.current && !isAppRouter) {
	            hasWarned.current = true;
	            console.warn("Next.js auto-prefetches automatically based on viewport. The prefetch attribute is no longer needed. More: https://nextjs.org/docs/messages/prefetch-true-deprecated");
	        }
	    }
	    if (process.env.NODE_ENV !== "production") {
	        if (isAppRouter && !asProp) {
	            let href;
	            if (typeof hrefProp === "string") {
	                href = hrefProp;
	            } else if (typeof hrefProp === "object" && typeof hrefProp.pathname === "string") {
	                href = hrefProp.pathname;
	            }
	            if (href) {
	                const hasDynamicSegment = href.split("/").some((segment)=>segment.startsWith("[") && segment.endsWith("]"));
	                if (hasDynamicSegment) {
	                    throw new Error("Dynamic href `" + href + "` found in <Link> while using the `/app` router, this is not supported. Read more: https://nextjs.org/docs/messages/app-dir-dynamic-href");
	                }
	            }
	        }
	    }
	    const { href, as } = _react.default.useMemo(()=>{
	        if (!pagesRouter) {
	            const resolvedHref = formatStringOrUrl(hrefProp);
	            return {
	                href: resolvedHref,
	                as: asProp ? formatStringOrUrl(asProp) : resolvedHref
	            };
	        }
	        const [resolvedHref, resolvedAs] = (0, _resolvehref.resolveHref)(pagesRouter, hrefProp, true);
	        return {
	            href: resolvedHref,
	            as: asProp ? (0, _resolvehref.resolveHref)(pagesRouter, asProp) : resolvedAs || resolvedHref
	        };
	    }, [
	        pagesRouter,
	        hrefProp,
	        asProp
	    ]);
	    const previousHref = _react.default.useRef(href);
	    const previousAs = _react.default.useRef(as);
	    // This will return the first child, if multiple are provided it will throw an error
	    let child;
	    if (legacyBehavior) {
	        if (process.env.NODE_ENV === "development") {
	            if (onClick) {
	                console.warn('"onClick" was passed to <Link> with `href` of `' + hrefProp + '` but "legacyBehavior" was set. The legacy behavior requires onClick be set on the child of next/link');
	            }
	            if (onMouseEnterProp) {
	                console.warn('"onMouseEnter" was passed to <Link> with `href` of `' + hrefProp + '` but "legacyBehavior" was set. The legacy behavior requires onMouseEnter be set on the child of next/link');
	            }
	            try {
	                child = _react.default.Children.only(children);
	            } catch (err) {
	                if (!children) {
	                    throw new Error("No children were passed to <Link> with `href` of `" + hrefProp + "` but one child is required https://nextjs.org/docs/messages/link-no-children");
	                }
	                throw new Error("Multiple children were passed to <Link> with `href` of `" + hrefProp + "` but only one child is supported https://nextjs.org/docs/messages/link-multiple-children" + (typeof window !== "undefined" ? " \nOpen your browser's console to view the Component stack trace." : ""));
	            }
	        } else {
	            child = _react.default.Children.only(children);
	        }
	    } else {
	        if (process.env.NODE_ENV === "development") {
	            if ((children == null ? void 0 : children.type) === "a") {
	                throw new Error("Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.\nLearn more: https://nextjs.org/docs/messages/invalid-new-link-with-extra-anchor");
	            }
	        }
	    }
	    const childRef = legacyBehavior ? child && typeof child === "object" && child.ref : forwardedRef;
	    const [setIntersectionRef, isVisible, resetVisible] = (0, _useintersection.useIntersection)({
	        rootMargin: "200px"
	    });
	    const setRef = _react.default.useCallback((el)=>{
	        // Before the link getting observed, check if visible state need to be reset
	        if (previousAs.current !== as || previousHref.current !== href) {
	            resetVisible();
	            previousAs.current = as;
	            previousHref.current = href;
	        }
	        setIntersectionRef(el);
	        if (childRef) {
	            if (typeof childRef === "function") childRef(el);
	            else if (typeof childRef === "object") {
	                childRef.current = el;
	            }
	        }
	    }, [
	        as,
	        childRef,
	        href,
	        resetVisible,
	        setIntersectionRef
	    ]);
	    // Prefetch the URL if we haven't already and it's visible.
	    _react.default.useEffect(()=>{
	        // in dev, we only prefetch on hover to avoid wasting resources as the prefetch will trigger compiling the page.
	        if (process.env.NODE_ENV !== "production") {
	            return;
	        }
	        if (!router) {
	            return;
	        }
	        // If we don't need to prefetch the URL, don't do prefetch.
	        if (!isVisible || !prefetchEnabled) {
	            return;
	        }
	        // Prefetch the URL.
	        prefetch(router, href, as, {
	            locale
	        }, {
	            kind: appPrefetchKind
	        }, isAppRouter);
	    }, [
	        as,
	        href,
	        isVisible,
	        locale,
	        prefetchEnabled,
	        pagesRouter == null ? void 0 : pagesRouter.locale,
	        router,
	        isAppRouter,
	        appPrefetchKind
	    ]);
	    const childProps = {
	        ref: setRef,
	        onClick (e) {
	            if (process.env.NODE_ENV !== "production") {
	                if (!e) {
	                    throw new Error('Component rendered inside next/link has to pass click event to "onClick" prop.');
	                }
	            }
	            if (!legacyBehavior && typeof onClick === "function") {
	                onClick(e);
	            }
	            if (legacyBehavior && child.props && typeof child.props.onClick === "function") {
	                child.props.onClick(e);
	            }
	            if (!router) {
	                return;
	            }
	            if (e.defaultPrevented) {
	                return;
	            }
	            linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAppRouter);
	        },
	        onMouseEnter (e) {
	            if (!legacyBehavior && typeof onMouseEnterProp === "function") {
	                onMouseEnterProp(e);
	            }
	            if (legacyBehavior && child.props && typeof child.props.onMouseEnter === "function") {
	                child.props.onMouseEnter(e);
	            }
	            if (!router) {
	                return;
	            }
	            if ((!prefetchEnabled || process.env.NODE_ENV === "development") && isAppRouter) {
	                return;
	            }
	            prefetch(router, href, as, {
	                locale,
	                priority: true,
	                // @see {https://github.com/vercel/next.js/discussions/40268?sort=top#discussioncomment-3572642}
	                bypassPrefetchedCheck: true
	            }, {
	                kind: appPrefetchKind
	            }, isAppRouter);
	        },
	        onTouchStart: process.env.__NEXT_LINK_NO_TOUCH_START ? undefined : function onTouchStart(e) {
	            if (!legacyBehavior && typeof onTouchStartProp === "function") {
	                onTouchStartProp(e);
	            }
	            if (legacyBehavior && child.props && typeof child.props.onTouchStart === "function") {
	                child.props.onTouchStart(e);
	            }
	            if (!router) {
	                return;
	            }
	            if (!prefetchEnabled && isAppRouter) {
	                return;
	            }
	            prefetch(router, href, as, {
	                locale,
	                priority: true,
	                // @see {https://github.com/vercel/next.js/discussions/40268?sort=top#discussioncomment-3572642}
	                bypassPrefetchedCheck: true
	            }, {
	                kind: appPrefetchKind
	            }, isAppRouter);
	        }
	    };
	    // If child is an <a> tag and doesn't have a href attribute, or if the 'passHref' property is
	    // defined, we specify the current 'href', so that repetition is not needed by the user.
	    // If the url is absolute, we can bypass the logic to prepend the domain and locale.
	    if ((0, _utils.isAbsoluteUrl)(as)) {
	        childProps.href = as;
	    } else if (!legacyBehavior || passHref || child.type === "a" && !("href" in child.props)) {
	        const curLocale = typeof locale !== "undefined" ? locale : pagesRouter == null ? void 0 : pagesRouter.locale;
	        // we only render domain locales if we are currently on a domain locale
	        // so that locale links are still visitable in development/preview envs
	        const localeDomain = (pagesRouter == null ? void 0 : pagesRouter.isLocaleDomain) && (0, _getdomainlocale.getDomainLocale)(as, curLocale, pagesRouter == null ? void 0 : pagesRouter.locales, pagesRouter == null ? void 0 : pagesRouter.domainLocales);
	        childProps.href = localeDomain || (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(as, curLocale, pagesRouter == null ? void 0 : pagesRouter.defaultLocale));
	    }
	    return legacyBehavior ? /*#__PURE__*/ _react.default.cloneElement(child, childProps) : /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
	        ...restProps,
	        ...childProps,
	        children: children
	    });
	});
	const _default = Link;

	if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
	  Object.defineProperty(exports.default, '__esModule', { value: true });
	  Object.assign(exports.default, exports);
	  module.exports = exports.default;
	}

	
} (link$1, link$1.exports));

var linkExports = link$1.exports;

var link = linkExports;

var Link = /*@__PURE__*/getDefaultExportFromCjs(link);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && array.indexOf(className) === index;
}).join(" ");

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Icon = forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
      ...props
    })
  );
  Component.displayName = `${iconName}`;
  return Component;
};

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Crown = createLucideIcon("Crown", [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Eye = createLucideIcon("Eye", [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Heart = createLucideIcon("Heart", [
  [
    "path",
    {
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      key: "c3ymky"
    }
  ]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Package = createLucideIcon("Package", [
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  [
    "path",
    {
      d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
      key: "hh9hay"
    }
  ],
  ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }],
  ["path", { d: "M12 22V12", key: "d0xqtd" }]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ShoppingCart = createLucideIcon("ShoppingCart", [
  ["circle", { cx: "8", cy: "21", r: "1", key: "jimo8o" }],
  ["circle", { cx: "19", cy: "21", r: "1", key: "13723u" }],
  [
    "path",
    {
      d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
      key: "9zh506"
    }
  ]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Sparkles = createLucideIcon("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);

/**
 * @license lucide-react v0.446.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Star = createLucideIcon("Star", [
  [
    "polygon",
    {
      points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
      key: "8f66p6"
    }
  ]
]);

/**
 * Asset Management Utility for Harsha Delights
 * Centralized system for managing team-changeable assets
 */
// Asset base paths
var ASSET_BASE = '/assets';
// Background images (team-manageable)
var backgrounds = {
    hero: {
        bg1: "".concat(ASSET_BASE, "/branding/backgrounds/BG01.png"),
        bg2: "".concat(ASSET_BASE, "/branding/backgrounds/BG-02.png"),
        bg3: "".concat(ASSET_BASE, "/branding/backgrounds/BG-03.png"),
        bg4: "".concat(ASSET_BASE, "/branding/backgrounds/BG-04.png"),
        bg5: "".concat(ASSET_BASE, "/branding/backgrounds/BG-5.png"),
        bg6: "".concat(ASSET_BASE, "/branding/backgrounds/BG-06.png"),
        bg7: "".concat(ASSET_BASE, "/branding/backgrounds/BG-07.png"),
    },
    // Function to get random background
    getRandomHero: function () {
        var bgKeys = Object.keys(backgrounds.hero);
        var randomKey = bgKeys[Math.floor(Math.random() * bgKeys.length)];
        return backgrounds.hero[randomKey];
    }
};
// Logo variants (team-manageable)
var logos = {
    elegant: "".concat(ASSET_BASE, "/branding/logos/elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png"),
    elegantAlt: "".concat(ASSET_BASE, "/branding/logos/elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png"),
    // Default logo getter
    getDefault: function () { return logos.elegant; },
    getVariant: function (variant) {
        if (variant === void 0) { variant = 'elegant'; }
        return logos[variant];
    }
};
// Product image categories (team-manageable)
var products = {
    confectionery: "".concat(ASSET_BASE, "/products/confectionery"),
    seasonal: "".concat(ASSET_BASE, "/products/seasonal"),
    premium: "".concat(ASSET_BASE, "/products/premium"),
    categories: "".concat(ASSET_BASE, "/products/categories"),
    // Helper function to build product image paths
    getImagePath: function (category, filename) {
        return "".concat(products[category], "/").concat(filename);
    }
};
// CSS classes for luxury styling
var luxuryStyles = {
    // Background utilities
    backgrounds: {
        royalGradient: 'bg-royal-gradient',
        goldGradient: 'bg-gold-gradient',
        luxuryGradient: 'bg-luxury-gradient',
        hero: function (bgNumber) { return "bg-hero-bg-".concat(bgNumber); },
    },
    // Typography
    fonts: {
        royal: 'font-royal', // Playfair Display
        luxury: 'font-luxury', // Cormorant Garamond
        elegant: 'font-elegant', // Crimson Text
        premium: 'font-premium', // Inter
    },
    // Animations
    animations: {
        shimmer: 'animate-royal-shimmer',
        float: 'animate-luxury-float',
        glow: 'animate-gold-glow',
        pulse: 'animate-royal-pulse',
    },
    // Shadows
    shadows: {
        royal: 'shadow-royal',
        luxury: 'shadow-luxury',
        gold: 'shadow-gold',
        royalInset: 'shadow-royal-inset',
    },
    // Color utilities
    colors: {
        royal: {
            text: 'text-royal-700',
            bg: 'bg-royal-500',
            border: 'border-royal-300',
        },
        luxury: {
            gold: {
                text: 'text-luxury-gold-700',
                bg: 'bg-luxury-gold-500',
                border: 'border-luxury-gold-300',
            },
            burgundy: {
                text: 'text-luxury-burgundy-700',
                bg: 'bg-luxury-burgundy-500',
                border: 'border-luxury-burgundy-300',
            },
            champagne: {
                text: 'text-luxury-champagne-700',
                bg: 'bg-luxury-champagne-500',
                border: 'border-luxury-champagne-300',
            },
        },
    },
};
// Premium card styling presets
var cardStyles = {
    luxury: "\n    bg-white/95 backdrop-blur-md \n    border border-royal-200/50 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-500\n    hover:scale-105 hover:border-luxury-gold-300/50\n  ",
    royal: "\n    bg-gradient-to-br from-royal-50 to-royal-100 \n    border border-royal-300 \n    shadow-royal rounded-xl \n    hover:shadow-luxury transition-all duration-300\n  ",
    gold: "\n    bg-gradient-to-br from-luxury-gold-50 to-luxury-champagne-50 \n    border border-luxury-gold-300 \n    shadow-gold rounded-xl \n    hover:animate-gold-glow transition-all duration-300\n  ",
    premium: "\n    bg-white border border-gray-200 \n    shadow-luxury rounded-2xl \n    hover:shadow-royal transition-all duration-300\n    hover:border-royal-300\n  "
};
// Button styling presets
var buttonStyles = {
    royal: "\n    bg-royal-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-royal\n    hover:shadow-luxury hover:scale-105\n    transition-all duration-300\n  ",
    gold: "\n    bg-gold-gradient text-royal-900 font-semibold\n    px-8 py-4 rounded-xl shadow-gold\n    hover:animate-gold-glow hover:scale-105\n    transition-all duration-300\n  ",
    luxury: "\n    bg-luxury-gradient text-white font-semibold\n    px-8 py-4 rounded-xl shadow-luxury\n    hover:shadow-royal hover:scale-105\n    transition-all duration-300\n  ",
    outline: "\n    border-2 border-royal-500 text-royal-700 font-semibold\n    px-8 py-4 rounded-xl hover:bg-royal-50\n    hover:shadow-royal transition-all duration-300\n  "
};
// Utility functions
var utils = {
    // Combine multiple style classes
    combineStyles: function () {
        var styles = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            styles[_i] = arguments[_i];
        }
        return styles.join(' ');
    },
    // Get responsive classes
    responsive: {
        text: {
            hero: 'text-4xl md:text-6xl lg:text-7xl xl:text-8xl',
            heading: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
            subheading: 'text-lg md:text-xl lg:text-2xl xl:text-3xl',
            body: 'text-base md:text-lg lg:text-xl',
        },
        spacing: {
            section: 'py-16 md:py-24 lg:py-32',
            container: 'px-4 sm:px-6 lg:px-8 xl:px-12',
        }
    }
};

function LuxuryHero(_a) {
    var _b = _a.title, title = _b === void 0 ? "Exquisite Confectionery" : _b, _c = _a.subtitle, subtitle = _c === void 0 ? "Harsha Delights" : _c, _d = _a.description, description = _d === void 0 ? "Indulge in our royal collection of handcrafted sweets and premium confectionery. Every bite is a journey through elegance and taste." : _d, _e = _a.primaryCTA, primaryCTA = _e === void 0 ? { text: "Explore Collection", href: "/products" } : _e, _f = _a.secondaryCTA, secondaryCTA = _f === void 0 ? { text: "Our Story", href: "/about" } : _f, _g = _a.autoRotateBackground, autoRotateBackground = _g === void 0 ? true : _g, _h = _a.rotationInterval, rotationInterval = _h === void 0 ? 5000 : _h, _j = _a.className, className = _j === void 0 ? "" : _j;
    var _k = useState(0), currentBgIndex = _k[0], setCurrentBgIndex = _k[1];
    var _l = useState(false), isLoaded = _l[0], setIsLoaded = _l[1];
    var bgImages = [
        backgrounds.hero.bg1,
        backgrounds.hero.bg2,
        backgrounds.hero.bg3,
        backgrounds.hero.bg4,
        backgrounds.hero.bg5,
        backgrounds.hero.bg6,
        backgrounds.hero.bg7,
    ];
    // Auto-rotate background images
    useEffect(function () {
        if (!autoRotateBackground)
            return;
        var interval = setInterval(function () {
            setCurrentBgIndex(function (prev) { return (prev + 1) % bgImages.length; });
        }, rotationInterval);
        return function () { return clearInterval(interval); };
    }, [autoRotateBackground, rotationInterval, bgImages.length]);
    useEffect(function () {
        setIsLoaded(true);
    }, []);
    var heroClass = utils.combineStyles('relative min-h-screen flex items-center justify-center overflow-hidden', className);
    return (jsxs("section", { className: heroClass, children: [jsxs("div", { className: "absolute inset-0 z-0", children: [bgImages.map(function (bg, index) { return (jsx("div", { className: utils.combineStyles('absolute inset-0 transition-opacity duration-1000', index === currentBgIndex ? 'opacity-100' : 'opacity-0'), children: jsx(Image, { src: bg, alt: "Hero background ".concat(index + 1), fill: true, className: "object-cover scale-105 group-hover:scale-110 transition-transform duration-[10s]", sizes: "100vw", priority: index === 0 }) }, bg)); }), jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-royal-900/70 via-royal-800/50 to-luxury-gold-900/60" }), jsx("div", { className: "absolute inset-0 opacity-20", children: jsx("div", { className: "absolute inset-0 bg-royal-shimmer animate-royal-shimmer" }) })] }), jsxs("div", { className: "absolute inset-0 pointer-events-none z-10", children: [jsx(Sparkles, { className: utils.combineStyles('absolute top-1/4 left-1/4 w-6 h-6 text-luxury-gold-400', luxuryStyles.animations.float) }), jsx(Crown, { className: utils.combineStyles('absolute top-1/3 right-1/4 w-8 h-8 text-luxury-champagne-400', luxuryStyles.animations.float), style: { animationDelay: '2s' } }), jsx(Star, { className: utils.combineStyles('absolute bottom-1/3 left-1/3 w-5 h-5 text-luxury-gold-300', luxuryStyles.animations.float), style: { animationDelay: '4s' } })] }), jsxs("div", { className: utils.combineStyles('relative z-20 max-w-7xl mx-auto text-center', utils.responsive.spacing.container), children: [jsx("div", { className: utils.combineStyles('mb-8', isLoaded ? 'animate-fade-in' : 'opacity-0'), style: { animationDelay: '0.2s' }, children: jsx(Image, { src: logos.getDefault(), alt: "Harsha Delights Logo", width: 120, height: 120, className: utils.combineStyles('mx-auto drop-shadow-2xl', luxuryStyles.animations.glow) }) }), jsx("div", { className: utils.combineStyles('mb-4', isLoaded ? 'animate-slide-up' : 'opacity-0'), style: { animationDelay: '0.4s' }, children: jsx("span", { className: utils.combineStyles(luxuryStyles.fonts.elegant, 'text-luxury-gold-300 text-xl md:text-2xl lg:text-3xl font-medium', 'tracking-wide'), children: subtitle }) }), jsx("h1", { className: utils.combineStyles(luxuryStyles.fonts.royal, utils.responsive.text.hero, 'font-bold text-white mb-6 leading-tight', 'drop-shadow-2xl', isLoaded ? 'animate-slide-up' : 'opacity-0'), style: { animationDelay: '0.6s' }, children: jsx("span", { className: "bg-gradient-to-r from-white via-luxury-gold-200 to-luxury-champagne-200 bg-clip-text text-transparent", children: title }) }), jsx("p", { className: utils.combineStyles(luxuryStyles.fonts.premium, utils.responsive.text.body, 'text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed', isLoaded ? 'animate-slide-up' : 'opacity-0'), style: { animationDelay: '0.8s' }, children: description }), jsxs("div", { className: utils.combineStyles('flex flex-col sm:flex-row gap-4 justify-center items-center', isLoaded ? 'animate-slide-up' : 'opacity-0'), style: { animationDelay: '1s' }, children: [jsx(Link, { href: primaryCTA.href, children: jsxs("button", { className: utils.combineStyles(buttonStyles.gold, 'group flex items-center gap-3 min-w-[200px]'), children: [jsx("span", { children: primaryCTA.text }), jsx(ChevronRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" })] }) }), jsx(Link, { href: secondaryCTA.href, children: jsx("button", { className: utils.combineStyles('bg-white/10 backdrop-blur-md border-2 border-white/30', 'text-white font-semibold px-8 py-4 rounded-xl', 'hover:bg-white/20 hover:border-white/50 hover:scale-105', 'transition-all duration-300 min-w-[200px]'), children: secondaryCTA.text }) })] }), autoRotateBackground && (jsx("div", { className: utils.combineStyles('flex justify-center gap-2 mt-16', isLoaded ? 'animate-fade-in' : 'opacity-0'), style: { animationDelay: '1.2s' }, children: bgImages.map(function (_, index) { return (jsx("button", { onClick: function () { return setCurrentBgIndex(index); }, className: utils.combineStyles('w-3 h-3 rounded-full transition-all duration-300', index === currentBgIndex
                                ? 'bg-luxury-gold-400 scale-125'
                                : 'bg-white/40 hover:bg-white/60'), "aria-label": "Background ".concat(index + 1) }, index)); }) }))] }), jsx("div", { className: "absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20", children: jsx("div", { className: utils.combineStyles('w-6 h-10 border-2 border-white/50 rounded-full', 'flex justify-center', luxuryStyles.animations.pulse), children: jsx("div", { className: "w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" }) }) })] }));
}

function LuxuryProductCard(_a) {
    var _this = this;
    var product = _a.product, onAddToCart = _a.onAddToCart, onWishlist = _a.onWishlist, onQuickView = _a.onQuickView, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = useState(false), isWishlisted = _c[0], setIsWishlisted = _c[1];
    var _d = useState(false), isAddingToCart = _d[0], setIsAddingToCart = _d[1];
    var discountPercentage = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;
    var handleAddToCart = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsAddingToCart(true);
            onAddToCart === null || onAddToCart === void 0 ? void 0 : onAddToCart(product.id);
            setTimeout(function () { return setIsAddingToCart(false); }, 1500);
            return [2 /*return*/];
        });
    }); };
    var handleWishlist = function () {
        setIsWishlisted(!isWishlisted);
        onWishlist === null || onWishlist === void 0 ? void 0 : onWishlist(product.id);
    };
    var cardClass = utils.combineStyles(cardStyles.luxury, 'group relative overflow-hidden', className);
    return (jsxs("div", { className: cardClass, children: [product.isPremium && (jsx("div", { className: "absolute top-4 left-4 z-20", children: jsxs("div", { className: utils.combineStyles('flex items-center gap-1 px-3 py-1.5 rounded-full', 'bg-luxury-gradient text-white text-xs font-semibold', luxuryStyles.animations.glow), children: [jsx(Crown, { className: "w-3 h-3" }), jsx("span", { children: "Premium" })] }) })), product.isNew && (jsx("div", { className: "absolute top-4 right-4 z-20", children: jsx("div", { className: "bg-royal-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-full", children: "New" }) })), discountPercentage > 0 && (jsx("div", { className: "absolute top-16 right-4 z-20", children: jsxs("div", { className: "bg-luxury-burgundy-600 text-white text-xs font-bold px-3 py-1.5 rounded-full", children: [discountPercentage, "% OFF"] }) })), jsxs("div", { className: "relative aspect-square overflow-hidden rounded-t-2xl", children: [jsx("div", { className: utils.combineStyles('absolute inset-0 opacity-0 group-hover:opacity-100', 'bg-royal-shimmer transition-opacity duration-500 z-10') }), jsx(Image, { src: product.thumbnail || '/api/placeholder/400/400', alt: product.title, fill: true, className: "object-cover group-hover:scale-110 transition-transform duration-500", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }), !product.inStock && (jsx("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center z-10", children: jsx("span", { className: "bg-luxury-burgundy-800 text-white px-6 py-3 rounded-xl font-medium", children: "Out of Stock" }) })), jsxs("div", { className: "absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10", children: [jsx("button", { onClick: handleWishlist, className: utils.combineStyles('p-2 rounded-full shadow-luxury transition-all duration-300', isWishlisted
                                    ? 'bg-luxury-burgundy-600 text-white'
                                    : 'bg-white/95 text-luxury-burgundy-600 hover:bg-luxury-burgundy-50'), children: jsx(Heart, { className: "w-4 h-4 ".concat(isWishlisted ? 'fill-current' : '') }) }), onQuickView && (jsx("button", { onClick: function () { return onQuickView(product.id); }, className: "p-2 bg-white/95 text-royal-600 hover:bg-royal-50 rounded-full shadow-luxury transition-all duration-300", children: jsx(Eye, { className: "w-4 h-4" }) }))] })] }), jsxs("div", { className: "p-6", children: [jsx("div", { className: "mb-3", children: jsx("span", { className: utils.combineStyles('text-xs font-medium px-3 py-1 rounded-full', 'bg-luxury-champagne-100 text-luxury-champagne-800'), children: product.category }) }), jsx(Link, { href: "/products/".concat(product.id), children: jsx("h3", { className: utils.combineStyles(luxuryStyles.fonts.elegant, 'text-xl font-semibold text-gray-900 mb-2 line-clamp-2', 'group-hover:text-royal-700 transition-colors duration-300'), children: product.title }) }), jsx("p", { className: "text-sm text-gray-600 mb-4 line-clamp-2", children: product.description }), product.rating && (jsxs("div", { className: "flex items-center gap-2 mb-4", children: [jsx("div", { className: "flex items-center", children: __spreadArray([], Array(5), true).map(function (_, i) { return (jsx(Star, { className: "h-4 w-4 ".concat(i < Math.floor(product.rating)
                                        ? 'text-luxury-gold-500 fill-current'
                                        : 'text-gray-300') }, i)); }) }), jsxs("span", { className: "text-sm text-gray-600", children: ["(", product.rating, ")"] }), product.reviews && (jsxs("span", { className: "text-xs text-gray-500", children: ["\u2022 ", product.reviews, " reviews"] }))] })), jsxs("div", { className: "flex items-center gap-3 mb-6", children: [jsxs("span", { className: utils.combineStyles(luxuryStyles.fonts.royal, 'text-2xl font-bold text-gray-900'), children: ["\u20B9", product.price.toLocaleString()] }), product.comparePrice && (jsxs("span", { className: "text-lg text-gray-500 line-through", children: ["\u20B9", product.comparePrice.toLocaleString()] })), product.inStock && (jsxs("div", { className: "flex items-center text-xs text-luxury-gold-600 ml-auto", children: [jsx(Package, { className: "w-3 h-3 mr-1" }), jsx("span", { className: "font-medium", children: product.stockCount && product.stockCount < 10
                                            ? "Only ".concat(product.stockCount, " left")
                                            : 'In Stock' })] }))] }), jsx("button", { onClick: handleAddToCart, disabled: !product.inStock || isAddingToCart, className: utils.combineStyles(buttonStyles.royal, 'w-full flex items-center justify-center gap-3', 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'), children: isAddingToCart ? (jsxs(Fragment, { children: [jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), jsx("span", { children: "Adding..." })] })) : (jsxs(Fragment, { children: [jsx(ShoppingCart, { className: "w-4 h-4" }), jsx("span", { children: "Add to Cart" })] })) }), product.inStock && (jsx(Link, { href: "/checkout?product=".concat(product.id), children: jsx("button", { className: utils.combineStyles(buttonStyles.outline, 'w-full mt-3 py-3 text-sm'), children: "Buy Now" }) }))] })] }));
}

export { Button, LuxuryHero, LuxuryProductCard, backgrounds, buttonStyles, buttonVariants, cardStyles, cn, compareArrays, debounce, formatPrice, formatWeight, generateSlug, logos, luxuryStyles, products, truncateText, utils };
//# sourceMappingURL=index.esm.js.map
