import React, { useState } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import Entry from './Entry';
import Room from './Room';

const App = () => {
  const [userName, setUserName] = useState('');

  return (
    <>
      <BrowserRouter>
        <Route exact path='/' render={() => <Entry setUserName={setUserName} userName={userName} />} />
        <Route path='/rooms/:roomId' render={(props) => <Room {...props} userName={userName} />} />
      </BrowserRouter>
    </>
  );
}

export default App;
