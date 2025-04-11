
import { Client, Project, Payment } from "@/types";
import { format } from "date-fns";

/**
 * Maps a client record from the database to the Client type
 */
export const mapDbClientToClient = (dbClient: any): Client => {
  return {
    id: dbClient.id,
    name: dbClient.name,
    email: dbClient.email,
    phone: dbClient.phone,
    address: dbClient.address,
    city: dbClient.city,
    state: dbClient.state,
    zipCode: dbClient.zip_code,
    country: dbClient.country,
    companyId: dbClient.company_id,
    createdAt: new Date(dbClient.created_at),
    updatedAt: new Date(dbClient.updated_at)
  };
};

/**
 * Maps payment data from our application to the database format
 */
export const mapPaymentToDbPayment = (payment: Payment, projectId: string) => {
  return {
    project_id: projectId,
    amount: payment.amount,
    payment_date: payment.date instanceof Date 
      ? format(payment.date, 'yyyy-MM-dd') 
      : payment.date ? payment.date.toString() : '',
    description: payment.description || '',
    payment_method: payment.status || 'pending',
    currency: payment.currency || 'USD'
  };
};

/**
 * Fixes project status to be one of the valid status types
 */
export const ensureValidProjectStatus = (status: string): "active" | "completed" | "on-hold" | "cancelled" | "under-revision" => {
  const validStatuses = ["active", "completed", "on-hold", "cancelled", "under-revision"];
  
  if (validStatuses.includes(status)) {
    return status as "active" | "completed" | "on-hold" | "cancelled" | "under-revision";
  }
  
  // Default to active if not valid
  return "active";
};
