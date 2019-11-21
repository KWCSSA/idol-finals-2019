import React from 'react';
import axios from 'axios';

import AdminContent from './AdminContent';

var serverAddress = '';
axios.defaults.withCredentials = true;

if (process.env.NODE_ENV !== 'production') {
	serverAddress = 'http://localhost:9898';
}

class Admin extends React.Component {
	state = { auth: false, username: '', password: '' };

	componentDidMount() {
		axios.get(`${serverAddress}/admin/status`).then(res => {
			if (res.status === 200 && res.data.isAdmin) {
				this.setState({ auth: true });
			}
		});
	}

	handleInputChange(field, value) {
		var newState = {};
		newState[field] = value;
		this.setState(newState);
	}

	handleSubmit(event) {
		event.preventDefault();
		axios
			.post(`${serverAddress}/admin/login`, { username: this.state.username, password: this.state.password })
			.then(res => {
				if (res.status === 200 && res.data.isAdmin) {
					this.setState({ auth: true });
				}
			});
	}

	renderLogin() {
		return (
			<div style={{ height: '100vh', width: '100vw' }} className='d-flex justify-content-center align-items-center'>
				<form onSubmit={this.handleSubmit.bind(this)}>
					<div className='form-group'>
						<input
							className='form-control'
							type='username'
							placeholder='Username'
							value={this.state.username}
							onChange={e => this.handleInputChange('username', e.target.value)}
						/>
					</div>
					<div className='form-group'>
						<input
							className='form-control'
							type='password'
							placeholder='Password'
							value={this.state.password}
							onChange={e => this.handleInputChange('password', e.target.value)}
						/>
					</div>
					<button type='submit' className='btn btn-primary w-100'>
						Login
					</button>
				</form>
			</div>
		);
	}

	render() {
		return this.state.auth ? <AdminContent /> : this.renderLogin();
	}
}

export default Admin;
