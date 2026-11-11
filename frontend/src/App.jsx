import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import Admin from "./admin_components/Admin";
import DrinkDetails from "./components/DrinkDetails";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Loading from "./components/Loading";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
        path: "/menu/:id",
        element: <DrinkDetails />,
      },
      {
        path: "/order",
        element: <Order />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/loading",
        element: <Loading />,
      },
      {
        path: "/*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
