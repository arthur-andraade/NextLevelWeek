import React from 'react';
import {Route, BrowserRouter} from 'react-router-dom'

import CreatePoint from './pages/CreatePoint/index';
import Home from './pages/Home/index';

const Routes = ()=>{
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact/>
            <Route component={CreatePoint} path="/create-point" />
        </BrowserRouter>
    );
}

export default Routes;