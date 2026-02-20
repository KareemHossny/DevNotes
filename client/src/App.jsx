import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ROUTES, ROUTE_PATHS } from "./constants/routes.js";
import { buildCanonicalUrl } from "./utils/seo.js";
import PageLoader from "./components/ui/PageLoader.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Posts = lazy(() => import("./pages/Posts.jsx"));
const PostDetails = lazy(() => import("./pages/PostDetails.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const CreateEditPost = lazy(() => import("./pages/CreateEditPost.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const App = () => {
  const location = useLocation();
  const canonicalUrl = buildCanonicalUrl(location.pathname);

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading page" />
      }
    >
      <Helmet>
        <title>DevNotes</title>
        <meta
          name="description"
          content="DevNotes is a developer-first blogging platform for engineering notes, build logs, and architecture insights."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="DevNotes" />
        <meta
          property="og:description"
          content="Developer-first publishing for engineering notes, build logs, and architecture insights."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/Copilot_20260216_032458.png" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <Routes>
        <Route path={ROUTE_PATHS.ROOT} element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={ROUTE_PATHS.POSTS_ROOT} element={<Posts />} />
          <Route path={ROUTE_PATHS.POSTS_ID} element={<PostDetails />} />
          <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
          <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTE_PATHS.POSTS_NEW} element={<CreateEditPost mode="create" />} />
            <Route path={ROUTE_PATHS.POSTS_EDIT} element={<CreateEditPost mode="edit" />} />
            <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
          </Route>
          <Route path={ROUTE_PATHS.NOT_FOUND} element={<NotFound />} />
          <Route path={ROUTE_PATHS.WILDCARD} element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
