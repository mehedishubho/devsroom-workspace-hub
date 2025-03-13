
import React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/logo.png" 
        alt="Devsroom Workspace" 
        className="h-7 w-auto"
      />
      <span className="font-semibold text-lg hidden md:inline-block">
        Devsroom Workspace
      </span>
    </div>
  );
};

export default AppLogo;
