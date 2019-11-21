import React from 'react';
import axios from 'axios';

var serverAddress = '';

if (process.env.NODE_ENV !== 'production') {
	serverAddress = 'http://localhost:4000';
	axios.defaults.withCredentials = true;
}

class Audience extends React.Component {
	state = { auth: false, regCode: '', message: { error: false, text: '-' } };

	componentDidMount() {
		axios.get(`${serverAddress}/audience/status`).then(res => {
			console.log(res);
			if (res.status === 200 && res.data.isAudience) {
				this.setState({ auth: true });
			}
		});
	}

	handleVoteClick(candidate) {
		console.log(candidate);
		axios
			.post(`${serverAddress}/api/audience/vote/`, { candidate })
			.then(res => {
				if (res.status === 200) {
					if (!res.data.error) {
						this.setState({
							message: { error: false, text: '投票成功' }
						});
					} else {
						this.setState({
							message: { error: true, text: res.data.error }
						});
					}
				} else {
					this.setState({
						message: { error: true, text: '投票失败' }
					});
				}
				setTimeout(() => {
					this.setState({
						message: { error: false, text: '-' }
					});
				}, 2000);
			})
			.catch(err => {
				this.setState({ auth: false });
			});
	}

	renderContent() {
		return (
			<div
				style={{ height: '100vh', width: '100vw', background: 'black', color: 'white' }}
				className='d-flex flex-column justify-content-center align-items-center'
			>
				<div
					style={
						this.state.message.error ? (
							{ color: 'red', fontWeight: '700', fontSize: '40px' }
						) : (
							{ color: 'lime', fontWeight: '700', fontSize: '40px' }
						)
					}
				>
					{this.state.message.text}
				</div>
				<button
					className='btn btn-outline-warning mt-3 mb-3'
					style={{ height: '13vh', width: '70vw', fontSize: '40px', fontWeight: '700' }}
					onClick={() => this.handleVoteClick(1)}
				>
					A
				</button>
				<button
					className='btn btn-outline-warning mt-3 mb-3'
					style={{ height: '13vh', width: '70vw', fontSize: '40px', fontWeight: '700' }}
					onClick={() => this.handleVoteClick(2)}
				>
					B
				</button>
				<button
					className='btn btn-outline-warning mt-3 mb-3'
					style={{ height: '13vh', width: '70vw', fontSize: '40px', fontWeight: '700' }}
					onClick={() => this.handleVoteClick(3)}
				>
					C
				</button>
				<button
					className='btn btn-outline-warning mt-3 mb-3'
					style={{ height: '13vh', width: '70vw', fontSize: '40px', fontWeight: '700' }}
					onClick={() => this.handleVoteClick(4)}
				>
					D
				</button>
			</div>
		);
	}

	handleLoginSubmit(event) {
		event.preventDefault();
		axios.post(`${serverAddress}/audience/login`, { username: 'audience', password: this.state.regCode }).then(res => {
			if (res.status === 200 && res.data.isAudience) {
				this.setState({ auth: true });
			}
		});
	}

	handleLoginInputChange(value) {
		this.setState({
			regCode: value
		});
	}

	renderLogin() {
		return (
			<div style={{ height: '100vh', width: '100vw' }} className='d-flex justify-content-center align-items-center'>
				<form onSubmit={this.handleLoginSubmit.bind(this)}>
					<div className='form-group'>
						<label>请输入注册码</label>
						<input
							className='form-control'
							type='number'
							placeholder='请输入注册码'
							value={this.state.regCode}
							onChange={e => this.handleLoginInputChange(e.target.value)}
						/>
					</div>
					<button type='submit' className='btn btn-primary w-100'>
						登陆
					</button>
				</form>
			</div>
		);
	}

	render() {
		return this.state.auth ? this.renderContent() : this.renderLogin();
	}
}

export default Audience;
