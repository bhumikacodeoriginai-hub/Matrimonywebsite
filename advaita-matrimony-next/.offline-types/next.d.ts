/**
 * OFFLINE-ONLY type stubs for the `next` framework surface we use.
 * See .offline-types/react.d.ts for why these exist.
 */

declare module 'next' {
  export interface Metadata {
    title?: any;
    description?: string;
    applicationName?: string;
    themeColor?: any;
    manifest?: string;
    metadataBase?: any;
    openGraph?: any;
    twitter?: any;
    robots?: any;
    icons?: any;
    alternates?: any;
    keywords?: any;
    authors?: any;
    creator?: string;
    publisher?: string;
    formatDetection?: any;
    appleWebApp?: any;
    other?: Record<string, any>;
  }
  export interface Viewport {
    width?: string;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    themeColor?: any;
    colorScheme?: string;
    viewportFit?: string;
  }
  export interface NextConfig {
    [key: string]: any;
  }
  const next: any;
  export default next;
}

declare module 'next/link' {
  const Link: (props: {
    href: string;
    children?: any;
    className?: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    target?: string;
    rel?: string;
    title?: string;
    onClick?: any;
    'aria-label'?: string;
    'aria-current'?: any;
    'aria-hidden'?: any;
    tabIndex?: number;
    style?: any;
    id?: string;
    role?: string;
    download?: any;
  }) => any;
  export default Link;
}

declare module 'next/image' {
  const Image: (props: Record<string, any>) => any;
  export default Image;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): {
    get(key: string): string | null;
    getAll(key: string): string[];
    has(key: string): boolean;
    toString(): string;
    entries(): IterableIterator<[string, string]>;
    forEach(cb: (value: string, key: string) => void): void;
  };
  export function useParams<T = Record<string, string>>(): T;
  export function redirect(href: string): never;
  export function notFound(): never;
}

declare module 'next/headers' {
  export function cookies(): Promise<any>;
  export function headers(): Promise<any>;
}

declare module 'next/dynamic' {
  const dynamic: (loader: () => Promise<any>, options?: Record<string, any>) => any;
  export default dynamic;
}

declare module 'next/script' {
  const Script: (props: Record<string, any>) => any;
  export default Script;
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
  export type NextRequest = Request & {
    nextUrl: URL;
    cookies: any;
  };
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';

declare module '*.svg' {
  const content: any;
  export default content;
}
