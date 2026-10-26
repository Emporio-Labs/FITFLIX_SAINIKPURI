import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, publicRestLink } from "@/lib/trpc";
import Home from "@/pages/Home";
import Privacy from "@/pages/Privacy";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({ links: [publicRestLink] });

function Page() {
  const pathname = window.location.pathname;
  const privacy = pathname.endsWith("/privacy") || pathname.endsWith("/kompally-founders-privacy.html");
  return privacy ? <Privacy /> : <Home />;
}

export default function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
