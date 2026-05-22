"use client";

import React from "react";
import UnsupportedSection from "./UnsupportedSection";

interface State {
  hasError: boolean;
}

// Wraps each section in an error boundary so a single broken section
// does not crash the entire page.
export default class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <UnsupportedSection type="unknown" reason="render error" />;
    }
    return this.props.children;
  }
}
