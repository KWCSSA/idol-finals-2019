import React from 'react';
import axios from 'axios';

var serverAddress = '';

if (process.env.NODE_ENV !== 'production') {
	serverAddress = 'http://localhost:9898';
}

class Results extends React.Component {
	state = { results: { votesA: 0, votesB: 0, votesC: 0, votesD: 0 }, showResults: [ false, false, false, false ] };

	componentDidMount() {
		setInterval(() => {
			axios.get(`${serverAddress}/api/results`).then(res => {
				if (res.status === 200 && !res.data.error) {
					if (JSON.stringify(this.state.results) !== JSON.stringify(res.data)) {
						this.setState({
							results: res.data
						});
					}
				}
			});
			axios.get(`${serverAddress}/api/format`).then(res => {
				if (res.status === 200) {
					if (res.data.format === '4-1') {
						let showResults = [ true, true, true, true ];
						if (JSON.stringify(this.state.showResults) !== JSON.stringify(showResults)) {
							this.setState({ showResults });
						}
					} else if (res.data.format === '3-1') {
						let showResults = [ true, true, true, false ];
						if (JSON.stringify(this.state.showResults) !== JSON.stringify(showResults)) {
							this.setState({ showResults });
						}
					} else if (res.data.format === '2-1') {
						let showResults = [ true, true, false, false ];
						if (JSON.stringify(this.state.showResults) !== JSON.stringify(showResults)) {
							this.setState({ showResults });
						}
					}
				}
			});
		}, 500);
	}

	render() {
		var max =
			Math.max(
				this.state.results.votesA,
				this.state.results.votesB,
				this.state.results.votesC,
				this.state.results.votesD
			) * 1.3;
		var styles = [
			{ background: '#ffc107' },
			{ background: '#ffc107' },
			{ background: '#ffc107' },
			{ background: '#ffc107' }
		];
		if (max === 0) {
			styles[0].height = 0 + '%';
			styles[1].height = 0 + '%';
			styles[2].height = 0 + '%';
			styles[3].height = 0 + '%';
		} else {
			styles[0].height = 100 * this.state.results.votesA / max + '%';
			styles[1].height = 100 * this.state.results.votesB / max + '%';
			styles[2].height = 100 * this.state.results.votesC / max + '%';
			styles[3].height = 100 * this.state.results.votesD / max + '%';
		}
		return (
			<div style={{ height: '100vh', width: '100vw', background: 'black', color: 'white' }}>
				<div style={{ height: '15vh', width: '100vw' }} className='d-flex justify-content-center align-items-center'>
					<img src='/banner.jpg' style={{ maxHeight: '100%', maxWidth: '100%' }} alt='banner' />
				</div>
				<div
					style={{ height: '85vh', width: '100vw' }}
					className='d-flex flex-row justify-content-center align-items-center'
				>
					{this.state.showResults[0] ? (
						<div
							className='d-flex flex-column justify-content-end align-items-center'
							style={{ height: '80%', width: '10%', marginLeft: '60px', marginRight: '60px' }}
						>
							<h3>{this.state.results.votesA}</h3>
							<div className='w-100 mt-2' style={styles[0]} />
							<div className='w-100 text-center mt-3' style={{ fontSize: '50px' }}>
								A
							</div>
						</div>
					) : (
						''
					)}
					{this.state.showResults[1] ? (
						<div
							className='d-flex flex-column justify-content-end align-items-center'
							style={{ height: '80%', width: '10%', marginLeft: '60px', marginRight: '60px' }}
						>
							<h3>{this.state.results.votesB}</h3>
							<div className='w-100 mt-2' style={styles[1]} />
							<div className='w-100 text-center mt-3' style={{ fontSize: '50px' }}>
								B
							</div>
						</div>
					) : (
						''
					)}
					{this.state.showResults[2] ? (
						<div
							className='d-flex flex-column justify-content-end align-items-center'
							style={{ height: '80%', width: '10%', marginLeft: '60px', marginRight: '60px' }}
						>
							<h3>{this.state.results.votesC}</h3>
							<div className='w-100 mt-2' style={styles[2]} />
							<div className='w-100 text-center mt-3' style={{ fontSize: '50px' }}>
								C
							</div>
						</div>
					) : (
						''
					)}
					{this.state.showResults[3] ? (
						<div
							className='d-flex flex-column justify-content-end align-items-center'
							style={{ height: '80%', width: '10%', marginLeft: '60px', marginRight: '60px' }}
						>
							<h3>{this.state.results.votesD}</h3>
							<div className='w-100 mt-2' style={styles[3]} />
							<div className='w-100 text-center mt-3' style={{ fontSize: '50px' }}>
								D
							</div>
						</div>
					) : (
						''
					)}
				</div>
			</div>
		);
	}
}

export default Results;
