import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SiteTextProvider } from './shared/siteText';

export default function App() {
  return (
    <SiteTextProvider>
      <RouterProvider router={router} />
    </SiteTextProvider>
  );
}
