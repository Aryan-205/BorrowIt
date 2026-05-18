/**
 * React Native host components use Constructor mixins that don't satisfy
 * strict React JSX element checks. Widen JSX.ElementType for RN compatibility.
 */
declare namespace React {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ElementType = any;
  }
}

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ElementType = any;
  }
}
