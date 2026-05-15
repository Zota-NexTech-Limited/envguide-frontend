// React 19 compatibility patch for Ant Design v5. Must come before any
// antd component is rendered — fixes static APIs (message/notification/
// Modal) and internal lifecycle issues that break Form.List propagation.
import "@ant-design/v5-patch-for-react-19";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
