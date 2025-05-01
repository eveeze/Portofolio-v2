import About from "./components/pages/About";
import Home from "./components/pages/Home";
import Contact from "./components/pages/Contact";
import Project from "./components/pages/Project";
import Navbar from "./components/ui/Navbar";
import { Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/project" element={<Project/>} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
};

export default App;
