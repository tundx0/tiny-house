import React, { useEffect, useRef } from "react";

import { useMutation } from "@apollo/client";
import { LOG_IN } from "../mutations";
import { useViewer } from "../contexts/ViewerContext";

const withAuth = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const { viewer, setViewer } = useViewer();
    const [logIn, { error }] = useMutation(LOG_IN, {
      onCompleted: (data) => {
        if (data && data.logIn) {
          setViewer(data.logIn);
        }
      },
    });
    const logInRef = useRef(logIn);

    useEffect(() => {
      if (!viewer.id) {
        logInRef.current();
      }
    }, []);

    console.log(viewer);

    if (!viewer.id) {
      return <p>Loading...</p>; // Or any loading indicator
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
