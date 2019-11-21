import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import Admin from './Admin';
import Audience from './Audience';
import Results from './Results';

const NotFound = () => <div>404</div>;

class App extends React.Component {
	render() {
		return (
			<div>
				<BrowserRouter>
					<Switch>
						<Route exact path='/admin' component={Admin} />
						<Route exact path='/' component={Audience} />
						<Route exact path='/results' component={Results} />
						<Route component={NotFound} />
					</Switch>
				</BrowserRouter>
			</div>
		);
	}
}

export default App;
