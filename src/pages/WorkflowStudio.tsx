import React, { useState } from 'react';
import StudioLayout from '@/components/workflow/StudioLayout';
import AdvancedWorkflowEditor from '@/components/workflow/AdvancedWorkflowEditor';
import StudioRuns from '@/components/workflow/StudioRuns';
import StudioSettings from '@/components/workflow/StudioSettings';

export default function WorkflowStudio() {
  const [activeTab, setActiveTab] = useState('builder');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'builder':
        return <AdvancedWorkflowEditor />;
      case 'runs':
        return <StudioRuns />;
      case 'settings':
        return <StudioSettings />;
      default:
        return <AdvancedWorkflowEditor />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <StudioLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="h-full w-full">
          {renderActiveTab()}
        </div>
      </StudioLayout>
    </div>
  );
}