import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import DrinkDetails from "./components/DrinkDetails";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/menu",
        element: <Menu />,
      },
      {
        path: "/menu/:name",
        element: <DrinkDetails />,
      },
      {
        path: "/order",
        element: <Order />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return (
    // <div className="app-container">
    //   <NavBar />
    //   <main>
    //     <Routes>
    //       <Route path="/" element={<Home />} />
    //       <Route path="/about" element={<About />} />
    //       <Route path="/menu" element={<Menu />} />
    //       <Route path="/menu/:id" element={<DrinkDetails />} />
    //       <Route path="/order" element={<Order />} />
    //     </Routes>
    //   </main>
    //   <Footer />
    // </div>
    <RouterProvider router={router} />
  );
}

export default App;
