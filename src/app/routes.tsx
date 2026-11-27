import { createBrowserRouter, Navigate } from "react-router";
import { IS_HK_HOST } from "./pages/hakawati/hakawatiSite";
import { Layout } from "./shared/Layout";
import { HomePage } from "./pages/home/HomePage";
import { AboutPage } from "./pages/about/AboutPage";
import { PortfolioDesignPage } from "./pages/portfolio-design/PortfolioDesignPage";
import { PortfolioPhotographyPage } from "./pages/portfolio-photography/PortfolioPhotographyPage";
import { PortfolioMotionPage } from "./pages/portfolio-motion/PortfolioMotionPage";
import { ToolsPage } from "./pages/tools/ToolsPage";
import { PortfolioVoicePage } from "./pages/portfolio-voice/PortfolioVoicePage";
import { CoursesPage } from "./pages/courses/CoursesPage";
import { NotFoundPage } from "./pages/not-found/NotFoundPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { ArticlesPage } from "./pages/articles/ArticlesPage";
import { ArticlePage } from "./pages/articles/ArticlePage";
import { WorkDetailPage } from "./pages/portfolio/WorkDetailPage";
import { PortfolioIndexPage } from "./pages/portfolio/PortfolioIndexPage";
import { HakawatiLayout } from "./pages/hakawati/HakawatiLayout";
import { HakawatiHomePage } from "./pages/hakawati/HakawatiHomePage";
import { HakawatiStoriesPage } from "./pages/hakawati/HakawatiStoriesPage";
import { HakawatiStoryPage } from "./pages/hakawati/HakawatiStoryPage";
import HakawatiGamePage from "./pages/hakawati/HakawatiGamePage";

const hakawatiChildren = [
  { index: true, Component: HakawatiHomePage },
  { path: "stories", Component: HakawatiStoriesPage },
  { path: "stories/:id", Component: HakawatiStoryPage },
  { path: "game", Component: HakawatiGamePage },
];

// على elhakawatti.mustaphadjoghlal.com يكون الحكواتي هو الموقع كله، وصفحاته في الجذر
const hakawatiSiteRouter = () =>
  createBrowserRouter([
    {
      path: "/",
      Component: HakawatiLayout,
      children: [...hakawatiChildren, { path: "*", element: <Navigate to="/" replace /> }],
    },
  ]);

const mainSiteRouter = () => createBrowserRouter([
  { path: "/admin", Component: AdminPage },
  {
    path: "/hakawati",
    Component: HakawatiLayout,
    children: hakawatiChildren,
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
      { path: "portfolio-motion", Component: PortfolioMotionPage },
      { path: "tools", Component: ToolsPage },
      { path: "courses", Component: CoursesPage },
      { path: "articles", Component: ArticlesPage },
      { path: "articles/:id", Component: ArticlePage },
      { path: "portfolio", Component: PortfolioIndexPage },
      { path: "portfolio/:id", Component: WorkDetailPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

export const router = IS_HK_HOST ? hakawatiSiteRouter() : mainSiteRouter();
