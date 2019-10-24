import React from 'react';
import { Switch, Route } from 'react-router';

import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  );
};

export default App;
