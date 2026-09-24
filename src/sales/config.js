// The schema is installed in production. Set the flag to "false" for an emergency UI rollback.
export const protectedSalesEnabled = import.meta.env.VITE_PROTECTED_SALES_ENABLED !== "false";
