import { useAuthListener } from '@/hooks';
import { router } from '@/router';
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { LoadingSpinner } from './components';

function App() {
  useAuthListener();

  const { isAuthLoading } = useAuthStore();
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  return <RouterProvider router={router} />;
}

export default App;
