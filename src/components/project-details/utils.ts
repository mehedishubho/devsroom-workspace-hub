
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'on-hold':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'in-progress':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

export const getDisplayStatus = (status: string, originalStatus?: string) => {
  if (status === 'active' && originalStatus === 'in-progress') {
    return 'In Progress';
  }
  
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
};
