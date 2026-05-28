import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/AppSidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-surface-400">404 · No Signal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This frequency is empty.</h1>
        <p className="mt-2 text-sm text-surface-500">
          The page you're looking for has moved or never existed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to Mission Control
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-danger">System interference</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Something disrupted the signal.</h1>
        <p className="mt-2 text-sm text-surface-500">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-surface-950 px-5 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
          <a href="/" className="rounded-full border border-border bg-white px-5 py-2 text-sm font-medium">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Signal — Creator Partnership Intelligence" },
      { name: "description", content: "Internal creator partnership intelligence and digital missions operations platform." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-surface-50 text-surface-900">
        <AppSidebar />
        <div className="lg:pl-64">
          <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
