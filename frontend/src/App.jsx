import { createBrowserRouter, RouterProvider } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import AdminRoute from "./admin_components/AdminRoute";
import DrinkDetails from "./components/DrinkDetails";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import Success from "./pages/Success";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
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
        element: <AdminRoute />,
      },
      {
        path: "/loading",
        element: <Loading />,
      },
      {
        path: "success",
        element: <Success />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
