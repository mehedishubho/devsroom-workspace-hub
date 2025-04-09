
import React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/88fcb074-6ed0-4626-9475-0d9454ffbad9.png" 
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
