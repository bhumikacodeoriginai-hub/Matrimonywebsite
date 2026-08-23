/**
 * OFFLINE-ONLY type stubs.
 *
 * This sandbox has no npm registry access, so `node_modules` cannot be installed
 * and the real `@types/react` / `next` type packages are unavailable. These stubs
 * exist ONLY so `tsc -p tsconfig.offline.json` can catch genuine mistakes in our
 * own source (typos, bad imports, wrong hook usage, wrong props on our own
 * components) while developing offline.
 *
 * They are intentionally loose. They are NOT a substitute for the real types and
 * are excluded from the app's own tsconfig.json. Delete this folder (or just
 * ignore it) once `npm install` is possible — see docs/OFFLINE_VERIFICATION.md.
 */

/**
 * NOTE FOR MAINTAINERS OF THIS STUB
 * ---------------------------------
 * `ElementChildrenAttribute` and `ElementAttributesProperty` are matched by
 * TypeScript on their OWN declared members. An interface that merely `extends`
 * another has no own members, so writing
 *
 *     interface ElementChildrenAttribute extends Base {}
 *
 * silently disables JSX children mapping, and every component with a required
 * `children` prop then fails with "Property 'children' is missing".
 *
 * So each JSX namespace below declares its members directly. The duplication is
 * required, not an oversight.
 */
declare namespace JSX {
  type Element = any;
  interface ElementClass {
    render?: any;
  }
  interface ElementAttributesProperty {
    props: any;
  }
  interface ElementChildrenAttribute {
    children: any;
  }
  interface IntrinsicAttributes {
    key?: string | number | null;
  }
  interface IntrinsicClassAttributes<T> {
    ref?: any;
  }
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export type Key = string | number;
  export type CSSProperties = Record<string, any>;
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;
  export type RefObject<T> = { current: T | null };
  export type MutableRefObject<T> = { current: T };
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export type DependencyList = readonly any[];
  export type Context<T> = { Provider: any; Consumer: any; displayName?: string };
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type ComponentType<P = {}> = FC<P>;
  export type ElementType = any;

  export interface SyntheticEvent<T = any> {
    currentTarget: T;
    target: any;
    preventDefault(): void;
    stopPropagation(): void;
    nativeEvent: any;
  }
  export interface FormEvent<T = any> extends SyntheticEvent<T> {}
  export interface ChangeEvent<T = any> extends SyntheticEvent<T> {
    currentTarget: T;
    target: T;
  }
  export interface MouseEvent<T = any> extends SyntheticEvent<T> {
    clientX: number;
    clientY: number;
    button: number;
  }
  export interface PointerEvent<T = any> extends MouseEvent<T> {
    pointerId: number;
    pointerType: string;
  }
  export interface TouchEvent<T = any> extends SyntheticEvent<T> {
    touches: any;
    changedTouches: any;
  }
  export interface KeyboardEvent<T = any> extends SyntheticEvent<T> {
    key: string;
    code: string;
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
  }
  export interface FocusEvent<T = any> extends SyntheticEvent<T> {
    relatedTarget: any;
  }
  export interface ClipboardEvent<T = any> extends SyntheticEvent<T> {
    clipboardData: any;
  }
  export interface DragEvent<T = any> extends MouseEvent<T> {
    dataTransfer: any;
  }
  export interface WheelEvent<T = any> extends MouseEvent<T> {
    deltaY: number;
  }

  export type HTMLAttributes<T = any> = Record<string, any>;
  export type ButtonHTMLAttributes<T = any> = Record<string, any>;
  export type InputHTMLAttributes<T = any> = Record<string, any>;
  export type TextareaHTMLAttributes<T = any> = Record<string, any>;
  export type SelectHTMLAttributes<T = any> = Record<string, any>;
  export type AnchorHTMLAttributes<T = any> = Record<string, any>;
  export type FormHTMLAttributes<T = any> = Record<string, any>;
  export type LabelHTMLAttributes<T = any> = Record<string, any>;
  export type SVGProps<T = any> = Record<string, any>;
  export type ComponentPropsWithoutRef<T = any> = Record<string, any>;
  export type ComponentProps<T = any> = Record<string, any>;

  export function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: () => void | (() => void), deps?: DependencyList): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: DependencyList): void;
  export function useMemo<T>(factory: () => T, deps: DependencyList): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: DependencyList): T;
  export function useRef<T>(initial: T): MutableRefObject<T>;
  export function useRef<T>(initial: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initial: S): [S, Dispatch<A>];
  export function useContext<T>(context: Context<T>): T;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useId(): string;
  export function useTransition(): [boolean, (cb: () => void) => void];
  export function useDeferredValue<T>(value: T): T;
  export function useSyncExternalStore<T>(subscribe: any, getSnapshot: () => T, getServerSnapshot?: () => T): T;
  export function useImperativeHandle<T>(ref: any, init: () => T, deps?: DependencyList): void;
  export function memo<P>(component: FC<P>, areEqual?: (a: P, b: P) => boolean): FC<P>;
  export function forwardRef<T, P>(render: (props: P, ref: Ref<T>) => ReactElement | null): FC<P & { ref?: Ref<T> }>;
  export function startTransition(cb: () => void): void;
  export function lazy<T>(factory: () => Promise<{ default: T }>): T;
  export const Fragment: any;
  export const StrictMode: any;
  export const Suspense: any;
  export const Children: any;
  export function cloneElement(element: any, props?: any, ...children: any[]): any;
  export function isValidElement(value: any): boolean;
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;

  // Members declared directly — see the note above the global JSX namespace.
  export namespace JSX {
    type Element = any;
    interface ElementClass {
      render?: any;
    }
    interface ElementAttributesProperty {
      props: any;
    }
    interface ElementChildrenAttribute {
      children: any;
    }
    interface IntrinsicAttributes {
      key?: string | number | null;
    }
    interface IntrinsicClassAttributes<T> {
      ref?: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  const React: any;
  export default React;
}

/**
 * With `"jsx": "preserve"` (what Next.js uses), TypeScript resolves the JSX
 * namespace from the `jsxImportSource` module — i.e. `react/jsx-runtime` — NOT
 * from the global `JSX` namespace. The global one above is kept for older
 * resolution paths, but THIS is the declaration that actually governs children
 * mapping and intrinsic element checking in this project.
 */
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;

  export namespace JSX {
    type Element = any;
    interface ElementClass {
      render?: any;
    }
    interface ElementAttributesProperty {
      props: any;
    }
    interface ElementChildrenAttribute {
      children: any;
    }
    interface IntrinsicAttributes {
      key?: string | number | null;
    }
    interface IntrinsicClassAttributes<T> {
      ref?: any;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
  export function createPortal(children: any, container: any): any;
}
