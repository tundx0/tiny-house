import React, { createContext, useState, useContext } from "react";
import { Viewer } from "../types";

interface ViewerContextType {
  viewer: Viewer;
  setViewer: React.Dispatch<React.SetStateAction<Viewer>>;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export const ViewerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewer, setViewer] = useState<Viewer>({
    id: null,
    avatar: null,
    token: null,
    hasWallet: null,
    didRequest: false,
  });

  return (
    <ViewerContext.Provider value={{ viewer, setViewer }}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewer = () => {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
};
