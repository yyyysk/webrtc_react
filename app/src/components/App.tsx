import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import Entry from './Entry';
import Room from './Room';

const App = () => {
  return (
    <BrowserRouter>
      <Route exact path='/' component={Entry} />
      <Route path='/rooms/:roomId' component={Room} />
    </BrowserRouter>
  );
}

export default App;
