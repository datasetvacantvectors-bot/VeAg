import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DownloadPage from "./DownloadPage";
import NotFoundPage from "./NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DownloadPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
