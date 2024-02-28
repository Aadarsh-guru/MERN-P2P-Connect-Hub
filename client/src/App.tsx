import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Navbar from "./components/shared/Navbar";
import Home from "./pages/Home";
import Room from "./pages/Room";

const App: React.FC = () => {
  return (
    <div className="transition-colors duration-300 dark:bg-gradient-to-tr dark:from-gray-700 dark:to-gray-800 dark:bg-opacity-75 bg-gradient-to-tr from-gray-200 to-blue-300 bg-opacity-75" >
      <div className="md:container mx-auto" >
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room" element={<Room />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </main>
      </div>
    </div>
  );
};

export default App;