import { Spin } from "antd";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  //  loading Spin while checking the sign-in status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  //user not signed in go to the sign-in page
  if (!isSignedIn) {
    return <Navigate to="/?sign-in=true" />;
  }

  return children;
};

export default ProtectRoute;
ProtectRoute.propTypes = { children: PropTypes.node.isRequired };
