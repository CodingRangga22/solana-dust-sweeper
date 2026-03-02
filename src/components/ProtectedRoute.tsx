interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper for the Dashboard/Main App.
 * Currently allows all access. Add wallet/connection checks here when auth is implemented.
 * Example: if (!walletConnected) return <Navigate to="/" replace />;
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {

  // Add authentication/authorization checks here when wallet connection is required
  // e.g., check if wallet is connected before allowing access to /app
  // if (!isWalletConnected) {
  //   return <Navigate to="/" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
