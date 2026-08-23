/**
 * OFFLINE-ONLY stubs for the Node globals and built-in modules used by route
 * handlers, plus a global `React` namespace for `React.ReactNode` style
 * annotations. See .offline-types/react.d.ts for why these exist.
 */

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
  argv: string[];
  platform: string;
  exit(code?: number): never;
};

declare module 'node:fs/promises' {
  export function readFile(path: string): Promise<any>;
  export function writeFile(path: string, data: any): Promise<void>;
  export function stat(path: string): Promise<{ size: number; isFile(): boolean; isDirectory(): boolean }>;
  export function readdir(path: string): Promise<string[]>;
  export function mkdir(path: string, options?: any): Promise<void>;
  export function access(path: string, mode?: number): Promise<void>;
}

declare module 'node:path' {
  export function resolve(...parts: string[]): string;
  export function join(...parts: string[]): string;
  export function basename(path: string, ext?: string): string;
  export function dirname(path: string): string;
  export function extname(path: string): string;
  export const sep: string;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
  export function createHmac(algorithm: string, key: string): any;
  export function timingSafeEqual(a: any, b: any): boolean;
}

declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  type CSSProperties = Record<string, any>;
  type FC<P = {}> = (props: P & { children?: any }) => any;
  type PropsWithChildren<P = {}> = P & { children?: any };
  type ComponentType<P = {}> = (props: P) => any;
  type Ref<T> = any;
  type RefObject<T> = { current: T | null };
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prev: S) => S);
  type SyntheticEvent<T = any> = any;
  type FormEvent<T = any> = any;
  type ChangeEvent<T = any> = any;
  type MouseEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
  type FocusEvent<T = any> = any;
  type HTMLAttributes<T = any> = Record<string, any>;
  namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
