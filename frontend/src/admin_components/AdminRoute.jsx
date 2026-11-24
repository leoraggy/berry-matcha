import { useEffect, useState } from "react";
import Admin from "./Admin";
import Error from "../components/Error";
import Loading from "../components/Loading";

function AdminRoute() {
  const authError = new URLSearchParams(window.location.search).get("error");
  const [status, setStatus] = useState(authError ? "denied" : "checking");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    let active = true;

    if (authError) {
      return () => {
        active = false;
      };
    }

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.assign("/api/auth/google");
          return null;
        }
        if (!response.ok) {
          throw new Error("Unable to check admin login.");
        }
        return response.json();
      })
      .then((admin) => {
        if (active && admin) {
          setAdminEmail(admin.email);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [authError]);

  if (status === "checking") {
    return <Loading />;
  }
  if (status === "denied") {
    const message =
      authError === "unauthorized"
        ? "That Google account is not authorized to access the admin page."
        : "Google sign-in did not complete. Please try again.";
    return (
      <div role="alert">
        <Error error={message} />
        <p style={{ textAlign: "center" }}>
          <a href="/api/auth/google">Try another Google account</a>
        </p>
      </div>
    );
  }
  if (status === "error") {
    return <Error error="Unable to verify your admin login. Please refresh to try again." />;
  }

  return <Admin adminEmail={adminEmail} />;
}

export default AdminRoute;
