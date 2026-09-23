import { useUser } from "@clerk/clerk-react";

const LandingPage = () => {
  const { user } = useUser();
  return (
    <div>
      <h1>Welcome {user?.id}</h1>
    </div>
  );
};

export default LandingPage;
