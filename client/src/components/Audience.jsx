import React from 'react';
import axios from 'axios';

var serverAddress = '';
axios.defaults.withCredentials = true;

if (process.env.NODE_ENV !== 'production') {
	serverAddress = 'http://localhost:9898';
}

class Audience extends React.Component {
	state = {
		auth: false,
		matchTitle: '请等待',
		matchCandidates: { A: '', B: '', C: '', D: '' },
		showChoice: [ false, false, false, false ],
		regCode: '',
		message: { error: false, text: '' },
		loginError: '',
		doInit: false
	};

	componentDidMount() {
		axios.get(`${serverAddress}/audience/status`).then(res => {
			if (res.status === 200 && res.data.isAudience) {
				this.setState({ auth: true, doInit: true });
			}
		});
	}

	componentDidUpdate() {
		if (this.state.doInit) {
			this.setState({
				doInit: false
			});
			axios.get(`${serverAddress}/api/matchInfo`).then(res => {
				if (res.status === 200 && res.data.title) {
					this.setState({
						matchCandidates: res.data.candidates,
						matchTitle: res.data.title
					});
					if (res.data.format === '4-1') {
						this.setState({
							showChoice: [ true, true, true, true ]
						});
					} else if (res.data.format === '3-1') {
						this.setState({
							showChoice: [ true, true, true, false ]
						});
					} else if (res.data.format === '2-1') {
						this.setState({
							showChoice: [ true, true, false, false ]
						});
					}
				}
			});
			setInterval(() => {
				axios.get(`${serverAddress}/api/matchInfo`).then(res => {
					if (res.status === 200 && res.data.title) {
						this.setState({
							matchCandidates: res.data.candidates,
							matchTitle: res.data.title
						});
						if (res.data.format === '4-1') {
							this.setState({
								showChoice: [ true, true, true, true ]
							});
						} else if (res.data.format === '3-1') {
							this.setState({
								showChoice: [ true, true, true, false ]
							});
						} else if (res.data.format === '2-1') {
							this.setState({
								showChoice: [ true, true, false, false ]
							});
						}
					}
				});
			}, 5000);
		}
	}

	handleVoteClick(candidate) {
		axios
			.post(`${serverAddress}/api/audience/vote`, { candidate })
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
						message: { error: false, text: '' }
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
				<div style={{ height: '80%', width: '90%' }}>
					<div
						style={{ height: '10%', width: '100%', fontSize: '4vh', fontWeight: '700' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						{this.state.matchTitle}
					</div>
					<div
						style={{ height: '10%', width: '100%', fontSize: '4vh', fontWeight: '700' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						<div style={this.state.message.error ? { color: 'red' } : { color: 'lime' }}>{this.state.message.text}</div>
					</div>
					<div
						style={{ height: '20%', width: '100%' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						{this.state.showChoice[0] ? (
							<button
								className='btn btn-outline-warning mt-3 mb-3'
								style={{ height: '90%', width: '90%', fontSize: '30px', fontWeight: '500' }}
								onClick={() => this.handleVoteClick(1)}
							>
								A - {this.state.matchCandidates.A}
							</button>
						) : (
							''
						)}
					</div>
					<div
						style={{ height: '20%', width: '100%' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						{this.state.showChoice[1] ? (
							<button
								className='btn btn-outline-warning mt-3 mb-3'
								style={{ height: '90%', width: '90%', fontSize: '30px', fontWeight: '500' }}
								onClick={() => this.handleVoteClick(1)}
							>
								B - {this.state.matchCandidates.B}
							</button>
						) : (
							''
						)}
					</div>
					<div
						style={{ height: '20%', width: '100%' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						{this.state.showChoice[2] ? (
							<button
								className='btn btn-outline-warning mt-3 mb-3'
								style={{ height: '90%', width: '90%', fontSize: '30px', fontWeight: '500' }}
								onClick={() => this.handleVoteClick(1)}
							>
								C - {this.state.matchCandidates.C}
							</button>
						) : (
							''
						)}
					</div>
					<div
						style={{ height: '20%', width: '100%' }}
						className='d-flex flex-column justify-content-center align-items-center'
					>
						{this.state.showChoice[3] ? (
							<button
								className='btn btn-outline-warning mt-3 mb-3'
								style={{ height: '90%', width: '90%', fontSize: '30px', fontWeight: '500' }}
								onClick={() => this.handleVoteClick(1)}
							>
								D - {this.state.matchCandidates.D}
							</button>
						) : (
							''
						)}
					</div>
				</div>
			</div>
		);
	}

	handleLoginSubmit(event) {
		event.preventDefault();
		axios
			.post(`${serverAddress}/audience/login`, { username: 'audience', password: this.state.regCode })
			.then(res => {
				if (res.status === 200 && res.data.isAudience) {
					this.setState({ auth: true, loginError: '', inti: true });
				} else {
					this.setState({
						loginError: '登陆失败，请确认注册码输入正确'
					});
				}
			})
			.catch(err => {
				this.setState({
					loginError: '登陆失败，请确认注册码输入正确'
				});
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
						<small className='text-danger'>{this.state.loginError}</small>
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
