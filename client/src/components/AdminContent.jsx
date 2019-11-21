import React from 'react';
import axios from 'axios';

var serverAddress = '';
axios.defaults.withCredentials = true;

if (process.env.NODE_ENV !== 'production') {
	serverAddress = 'http://localhost:9898';
}

class AdminContent extends React.Component {
	state = {
		isVoting: false,
		matchFormat: '4-1',
		matchInfo: 'null',
		votes: { a: 0, b: 0, c: 0, d: 0 },
		candidate: '1',
		voteInput: ''
	};

	componentDidMount() {
		axios.get(`${serverAddress}/api/admin/getMatchInfo`).then(res => {
			if (res.status === 200 && res.data.id) {
				this.setState({
					matchInfo: `${res.data.id} - ${res.data.format.replace('-', '选')}`
				});
				axios
					.get(`${serverAddress}/api/results`)
					.then(res => {
						if (res.status === 200) {
							this.setState(prevState => {
								var newVotes = {
									a: res.data.votesA,
									b: res.data.votesB,
									c: res.data.votesC,
									d: res.data.votesD
								};
								if (JSON.stringify(newVotes) !== JSON.stringify(prevState.votes)) {
									return {
										votes: newVotes
									};
								}
							});
						}
						if (res.data.isVoting) {
							this.setState({
								isVoting: true
							});
							this.updateInterval = setInterval(() => {
								axios
									.get(`${serverAddress}/api/isVoting`)
									.then(res => {
										if (res.status === 200) {
											this.setState(prevState => {
												if (prevState.isVoting !== res.data.isVoting) {
													return { isVoting: res.data.isVoting };
												}
											});
										} else {
											window.location.reload();
										}
									})
									.catch(err => {
										window.location.reload();
									});
								axios
									.get(`${serverAddress}/api/results`)
									.then(res => {
										if (res.status === 200) {
											this.setState(prevState => {
												var newVotes = {
													a: res.data.votesA,
													b: res.data.votesB,
													c: res.data.votesC,
													d: res.data.votesD
												};
												if (JSON.stringify(newVotes) !== JSON.stringify(prevState.votes)) {
													return {
														votes: newVotes
													};
												}
											});
										}
									})
									.catch(err => {
										window.location.reload();
									});
							}, 100);
						}
					})
					.catch(err => {
						window.location.reload();
					});
			}
		});
	}

	handleLogout() {
		axios.get(`${serverAddress}/admin/logout`);
		window.location.reload();
	}

	handleModeChange(value) {
		this.setState({
			matchFormat: value
		});
	}

	handleCandidateChange(value) {
		this.setState({
			candidate: value
		});
	}

	handleVoteInput(value) {
		this.setState({
			voteInput: value
		});
	}

	generateRegCode() {
		axios.post(`${serverAddress}/api/admin/generateRegCode`, {});
	}

	generateNewMatch() {
		axios
			.post(`${serverAddress}/api/admin/generateNewMatch`, { matchFormat: this.state.matchFormat })
			.then(res => {
				if (res.status === 200) {
					this.setState({
						matchInfo: `${res.data.id} - ${res.data.format.replace('-', '选')}`,
						votes: { a: 0, b: 0, c: 0, d: 0 }
					});
				} else {
					window.location.reload();
				}
			})
			.catch(err => {
				window.location.reload();
			});
	}

	startVoting() {
		if (this.state.matchInfo !== 'null') {
			axios
				.post(`${serverAddress}/api/admin/startVoting`, {})
				.then(res => {
					if (res.status === 200 && !res.data.error) {
						this.updateInterval = setInterval(() => {
							axios
								.get(`${serverAddress}/api/isVoting`)
								.then(res => {
									if (res.status === 200) {
										this.setState(prevState => {
											if (prevState.isVoting !== res.data.isVoting) {
												return { isVoting: res.data.isVoting };
											}
										});
									} else {
										window.location.reload();
									}
								})
								.catch(err => {
									window.location.reload();
								});
							axios
								.get(`${serverAddress}/api/results`)
								.then(res => {
									if (res.status === 200) {
										this.setState(prevState => {
											var newVotes = {
												a: res.data.votesA,
												b: res.data.votesB,
												c: res.data.votesC,
												d: res.data.votesD
											};
											if (JSON.stringify(newVotes) !== JSON.stringify(prevState.votes)) {
												return {
													votes: newVotes
												};
											}
										});
									}
								})
								.catch(err => {
									window.location.reload();
								});
						}, 100);
					} else {
						window.location.reload();
					}
				})
				.catch(err => {
					window.location.reload();
				});
		}
	}

	endVoting() {
		if (this.state.matchInfo !== 'null') {
			axios.post(`${serverAddress}/api/admin/endVoting`, {}).then(res => {
				if (res.status === 200 && !res.data.error) {
					this.setState({
						isVoting: false
					});
					clearInterval(this.updateInterval);
				}
			});
		}
	}

	handleVoteChange(mode) {
		if (this.state.matchInfo !== 'null') {
			if (mode === 'add') {
				axios
					.post(`${serverAddress}/api/admin/addVote`, {
						candidate: parseInt(this.state.candidate),
						count: parseInt(this.state.voteInput)
					})
					.then(res => {
						if (res.status === 200 && !res.data.error) {
							this.setState(prevState => {
								var newVotes = {
									a: res.data.votesA,
									b: res.data.votesB,
									c: res.data.votesC,
									d: res.data.votesD
								};
								if (JSON.stringify(newVotes) !== JSON.stringify(prevState.votes)) {
									return {
										votes: newVotes
									};
								}
							});
						} else {
							window.location.reload();
						}
					})
					.catch(err => {
						window.location.reload();
					});
			} else if (mode === 'replace') {
				axios
					.post(`${serverAddress}/api/admin/changeVote`, {
						candidate: parseInt(this.state.candidate),
						count: parseInt(this.state.voteInput)
					})
					.then(res => {
						if (res.status === 200 && !res.data.error) {
							this.setState(prevState => {
								var newVotes = {
									a: res.data.votesA,
									b: res.data.votesB,
									c: res.data.votesC,
									d: res.data.votesD
								};
								if (JSON.stringify(newVotes) !== JSON.stringify(prevState.votes)) {
									return {
										votes: newVotes
									};
								}
							});
						} else {
							window.location.reload();
						}
					})
					.catch(err => {
						window.location.reload();
					});
			}
		}
	}

	render() {
		return (
			<div className='container'>
				<ul className='list-group mt-5 mb-5'>
					<li className='list-group-item text-center'>
						<button className='btn btn-danger w-50' onClick={() => this.handleLogout()}>
							Logout
						</button>
					</li>
					<li className='list-group-item text-center'>
						<button className='btn btn-warning w-50' onClick={() => this.generateRegCode()}>
							生成观众注册码
						</button>
					</li>
					<li className='list-group-item d-flex flex-column align-items-center'>
						<h3>此轮投票ID</h3>
						<h4>{this.state.matchInfo}</h4>
					</li>
					<li className='list-group-item text-center'>
						<div className='form-group'>
							<h3>投票模式</h3>
							<select
								className='form-control'
								onChange={e => this.handleModeChange(e.target.value)}
								value={this.state.matchFormat}
							>
								<option value='4-1'>四选一</option>
								<option value='3-1'>三选一</option>
								<option value='2-1'>二选一</option>
							</select>
						</div>
					</li>
					<li className='list-group-item d-flex flex-column align-items-center'>
						<h4>A: {this.state.votes.a}</h4>
						<h4>B: {this.state.votes.b}</h4>
						<h4>C: {this.state.votes.c}</h4>
						<h4>D: {this.state.votes.d}</h4>
					</li>
					<li className='list-group-item text-center'>
						<div className='form-group'>
							<select
								className='form-control'
								onChange={e => this.handleCandidateChange(e.target.value)}
								value={this.state.candidate}
							>
								<option value='1'>A</option>
								<option value='2'>B</option>
								<option value='3'>C</option>
								<option value='4'>D</option>
							</select>
						</div>
						<div className='form-group'>
							<input
								className='form-control'
								type='number'
								placeholder='票数'
								value={this.state.voteInput}
								onChange={e => this.handleVoteInput(e.target.value)}
							/>
						</div>
						<div className='form-group'>
							<button className='btn btn-danger mr-2 ml-2' onClick={() => this.handleVoteChange('add')}>
								添加以上票数
							</button>
							<button className='btn btn-danger mr-2 ml-2' onClick={() => this.handleVoteChange('replace')}>
								更改为以上票数
							</button>
						</div>
					</li>
					<li className='list-group-item d-flex flex-column align-items-center'>
						<h4 className='mt-3' style={{ fontWeight: '700' }}>
							{this.state.isVoting ? '投票中' : '投票已停止'}
						</h4>
						<div className='mt-3'>
							<button className='btn btn-success mr-2 ml-2' onClick={() => this.startVoting()}>
								开始投票
							</button>
							<button className='btn btn-warning mr-2 ml-2' onClick={() => this.endVoting()}>
								停止投票
							</button>
						</div>
					</li>
					<li className='list-group-item text-center'>
						<button className='btn btn-danger w-50' onClick={() => this.generateNewMatch()}>
							生成新一轮投票
						</button>
					</li>
				</ul>
			</div>
		);
	}
}

export default AdminContent;
