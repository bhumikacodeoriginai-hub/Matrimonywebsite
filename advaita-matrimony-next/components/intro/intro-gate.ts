/**
 * Synchronous pre-paint scripts, kept in a NON-client module so the root layout
 * (a Server Component) can inline them without pulling a client bundle in.
 *
 * Both scripts follow the same principle: they only ever ADD an attribute to
 * <html>, and the stylesheets treat the absence of that attribute as the safe
 * default. So if either script fails, is blocked by CSP, or JavaScript is off
 * entirely, the result is the ordinary page — never a stuck curtain or an
 * unreadable colour scheme.
 *
 * They run in <head>, before first paint, which is the only way to avoid a flash
 * of the wrong state.
 */

/** sessionStorage key marking that the intro has played this session. */
export const INTRO_SESSION_KEY = 'advaita:intro-played';

/** localStorage key for an explicit light/dark choice. */
export const THEME_STORAGE_KEY = 'advaita:theme';

/**
 * Decides whether the first-launch intro should play.
 *
 * Conditions, all of which must hold:
 *   • the landing page ("/") — not a deep link
 *   • motion is welcome
 *   • it has not already played this session
 */
export const INTRO_GATE_SCRIPT = `(function(){try{
if(window.location.pathname!=='/')return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var s=null;try{s=window.sessionStorage.getItem('${INTRO_SESSION_KEY}')}catch(e){}
if(s)return;
document.documentElement.setAttribute('data-intro','play');
}catch(e){}})();`;

/**
 * Applies a stored theme choice before paint.
 *
 * Only runs when the member has explicitly chosen light or dark. With no stored
 * choice it does nothing, leaving the `prefers-color-scheme` media query in
 * tokens.css to decide — which is the correct default.
 */
export const THEME_SCRIPT = `(function(){try{
var t=window.localStorage.getItem('${THEME_STORAGE_KEY}');
if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();`;
