import React, { Suspense } from "react";

const withSuspense =
  (Component: React.LazyExoticComponent<React.FC>) => (props: any) =>
    (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );

export default withSuspense;
