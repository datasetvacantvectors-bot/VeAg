import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="page-container not-found-container">
      <div className="background-glow error-glow"></div>

      <div className="not-found-content">
        <AlertTriangle className="error-icon" />
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link to="/" className="btn-primary">
          <ArrowLeft className="btn-icon" /> Back to Download
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;