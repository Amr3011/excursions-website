import { Routes, Route } from "react-router-dom";
import Excursions from "../pages/excursions/excursions";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Excursions/>} />
    </Routes>
  );
};

export default AppRouter;
