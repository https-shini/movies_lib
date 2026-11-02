import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Outlet />
      <footer className="site-footer"><p>MoviesLib <span>•</span> Descubra seu próximo filme favorito.</p></footer>
    </div>
  );
}

export default App;
