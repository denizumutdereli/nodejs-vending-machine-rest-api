const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../app');
const genUsername =require ("../node_modules/unique-username-generator");
 

chai.use(chaiHttp);

let token, user_id;

const usernameGenerated = genUsername.generateUsername("", 3);
 
describe('Users tests', () => {
	before('Get Token', (done) => {
		chai.request(server)
			.post('/auth')
			.send({username: 'admin@test.com', password: 'test'})
			.end((err, res) => {
				if (err)
					throw err;

				token = res.body.token;
				done();
			});
	});

	describe('/GET Users', () => {
		it('Get all user records', (done) => {
			chai.request(server)
				.get('/api/user/')
				.set('x-access-token', token)
				.end((err, res) => {
					if (err)
						throw err;

					res.should.have.status(200);
					res.body.should.be.a('object');
					done();
				});
		});
	});

	describe('/POST User', () => {
		it('Add User record', (done) => {
			const user = {
				username: usernameGenerated, //unique name
				password: 'dereli',
				role: 'seller'
			};
			chai.request(server).post('/register')
				.send(user)
				.set('x-access-token', token)
				.end((err, res) => {
					if (err)
						throw err;

					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('status').eql(true);
					user_id = res.body.data._id;
					done();
				});
		});
	});

	describe('/PUT /user/update/:user_id', () => {
		it('Update User record', (done) => {
			const user = {
				username: 'Kuzey Deniz',
                deposit: '100'
			};

			chai.request(server)
				.put('/api/user/update/' + user_id)
				.send(user)
				.set('x-access-token', token)
				.end((err, res) => {
					if (err)
						throw err;

					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('status').eql(true);
					done();
				});
		});
	});

	describe('/PUT /user/update/:user_id', () => {
		it('Update User record Error Check', (done) => {
			const user = {
				username: 'Kuzey Deniz',
                deposit: '6' // %5!=0
			};

			chai.request(server)
				.put('/api/user/update/' + user_id)
				.send(user)
				.set('x-access-token', token)
				.end((err, res) => {
					if (err)
						throw err;

					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('status').eql(false);
					done();
				});
		});
	});
});



