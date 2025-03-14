
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardProps {
  children: ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6 flex-grow">
        {user && (
          <div className="mb-6 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Logged in as <span className="font-medium">{user.email}</span></span>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
