
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";
import { getToastFunction } from "@/hooks/use-toast";
import { convertCurrency } from "@/utils/currency";

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get toast function
  const { toast } = getToastFunction();
  
  try {
    // Get projects count by status
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, status, budget');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    // Get clients count
    const { count: clientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true });

    if (clientsError) {
      console.error('Error fetching clients count:', clientsError);
      throw clientsError;
    }

    // Get payments data with currency
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, currency');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      throw paymentsError;
    }

    // Calculate dashboard metrics
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    
    const totalRevenue = projectsData.reduce((sum, project) => 
      sum + (project.budget || 0), 0);
    
    // Convert all payments to USD for consistent calculation
    const paidRevenue = paymentsData ? paymentsData.reduce((sum, payment) => {
      const amount = payment.amount || 0;
      const currency = payment.currency || 'USD';
      
      // Convert to USD if needed
      const amountInUsd = convertCurrency(amount, currency, 'USD');
      return sum + amountInUsd;
    }, 0) : 0;
    
    const unpaidRevenue = totalRevenue - paidRevenue;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalClients: clientsCount || 0,
      totalRevenue,
      paidRevenue,
      unpaidRevenue
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    toast({
      title: "Error fetching dashboard statistics",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    
    // Return default values in case of error
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalClients: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      unpaidRevenue: 0
    };
  }
}
