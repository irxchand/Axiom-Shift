import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpatialLayout } from './components/spatial/SpatialLayout';
import { SpatialCommandPortal } from './views/spatial/SpatialCommandPortal';
import { SpatialTimetablePortal } from './views/spatial/SpatialTimetablePortal';
import { SpatialSubjectUniversePortal } from './views/spatial/SpatialSubjectUniversePortal';
import { SpatialThreatRiskPortal } from './views/spatial/SpatialThreatRiskPortal';
import { SpatialAICorePortal } from './views/spatial/SpatialAICorePortal';
import { SpatialSourceHandoffPortal } from './views/spatial/SpatialSourceHandoffPortal';
import { SpatialStudyPlannerPortal } from './views/spatial/SpatialStudyPlannerPortal';
import { SpatialNotificationPortal } from './views/spatial/SpatialNotificationPortal';
import { SpatialWorkspacePortal } from './views/spatial/SpatialWorkspacePortal';
import { SpatialCalendarPortal } from './views/spatial/SpatialCalendarPortal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5
    }
  }
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SpatialLayout />}>
            <Route index element={<SpatialCommandPortal />} />
            <Route path="calendar" element={<SpatialCalendarPortal />} />
            <Route path="timetable" element={<SpatialTimetablePortal />} />
            <Route path="subjects" element={<SpatialSubjectUniversePortal />} />
            <Route path="evaluations" element={<SpatialThreatRiskPortal />} />
            <Route path="ai-chat" element={<SpatialAICorePortal />} />
            <Route path="ingest" element={<SpatialSourceHandoffPortal />} />
            <Route path="ingestion" element={<SpatialSourceHandoffPortal />} />
            <Route path="sources" element={<SpatialSourceHandoffPortal />} />
            <Route path="source-handoff" element={<SpatialSourceHandoffPortal />} />
            <Route path="planner" element={<SpatialStudyPlannerPortal />} />
            <Route path="notifications" element={<SpatialNotificationPortal />} />
            <Route path="workspace" element={<SpatialWorkspacePortal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
