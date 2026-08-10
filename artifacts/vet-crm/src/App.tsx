import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';

import DashboardPage from '@/pages/dashboard';
import OrdersPage from '@/pages/orders/index';
import OrderDetailPage from '@/pages/orders/detail';
import VetsPage from '@/pages/vets/index';
import VetDetailPage from '@/pages/vets/detail';
import ClientsPage from '@/pages/clients/index';
import ClientDetailPage from '@/pages/clients/detail';
import PetsPage from '@/pages/pets/index';
import PetDetailPage from '@/pages/pets/detail';
import ServicesPage from '@/pages/services/index';
import FinancePage from '@/pages/finance/index';
import LeaderboardPage from '@/pages/leaderboard/index';
import SuggestionsPage from '@/pages/suggestions/index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/orders/:id" component={OrderDetailPage} />
        <Route path="/vets" component={VetsPage} />
        <Route path="/vets/:id" component={VetDetailPage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/:id" component={ClientDetailPage} />
        <Route path="/pets" component={PetsPage} />
        <Route path="/pets/:id" component={PetDetailPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/finance" component={FinancePage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/suggestions" component={SuggestionsPage} />
        <Route>
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-green-400 mb-2">404</h1>
              <p className="text-muted-foreground">Страница не найдена</p>
            </div>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
