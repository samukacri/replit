import { createContext, useContext, ReactNode } from "react";

interface DndContextValue {
  // This would contain drag and drop state and handlers
  // For now, we'll keep it simple
}

const DndContext = createContext<DndContextValue | null>(null);

export function DndProvider({ children }: { children: ReactNode }) {
  const value: DndContextValue = {
    // Drag and drop context value
  };

  return (
    <DndContext.Provider value={value}>
      {children}
    </DndContext.Provider>
  );
}

export function useDndContext() {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error("useDndContext must be used within a DndProvider");
  }
  return context;
}
