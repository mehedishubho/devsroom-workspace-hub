
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface DashboardProps {
  children: ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;
