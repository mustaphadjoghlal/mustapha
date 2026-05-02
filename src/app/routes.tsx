import { createBrowserRouter } from "react-router";
import { Layout } from "./shared/Layout";
import { HomePage } from "./pages/home/HomePage";
import { AboutPage } from "./pages/about/AboutPage";
import { PortfolioDesignPage } from "./pages/portfolio-design/PortfolioDesignPage";
import { PortfolioPhotographyPage } from "./pages/portfolio-photography/PortfolioPhotographyPage";
import { PortfolioVoicePage } from "./pages/portfolio-voice/PortfolioVoicePage";
import { CoursesPage } from "./pages/courses/CoursesPage";
import { NotFoundPage } from "./pages/not-found/NotFoundPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { ArticlesPage } from "./pages/articles/ArticlesPage";
import { ArticlePage } from "./pages/articles/ArticlePage";

export const router = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "portfolio-design", Component: PortfolioDesignPage },
      { path: "portfolio-photography", Component: PortfolioPhotographyPage },
      { path: "portfolio-voice", Component: PortfolioVoicePage },
      { path: "courses", Component: CoursesPage },
      { path: "articles", Component: ArticlesPage },
      { path: "articles/:id", Component: ArticlePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
