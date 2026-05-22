"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { TooltipProvider } from "@/components/ui/tooltip";

// Wraps the app in the Redux Provider and TooltipProvider.
// Extracted as a Client Component because layout.tsx is a Server Component
// and cannot use React context directly.
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Provider store={store}>
      <TooltipProvider>{children}</TooltipProvider>
    </Provider>
  );
}
