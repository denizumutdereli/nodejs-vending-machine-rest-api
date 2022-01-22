const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../app');
const genUsername =require ("unique-username-generator");

const productNameGenerated = genUsername.generateUsername("", 3);

chai.use(chaiHttp);

let token, product_id;

describe('/api/products tests', () => {
	
	before('Get Token', (done) => {
		chai.request(server)
			.post('/auth')
			.send({username: 'seller@test.com', password: 'test'})
			.end((err, res) => {
				if (err)
					throw err;

				token = res.body.token;
				done();
			});
	});

    describe('/GET User Profile', () => {
		it('Get user info', (done) => {
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
 
    describe('/GET api/products', () => {
		it('Get products list', (done) => {
			chai.request(server)
				.get('/api/products/')
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
 
 
    describe('/GET api/products/top10 Products', () => {
		it('Get top 10 products list', (done) => {
			chai.request(server)
				.get('/api/products/')
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
 
    /* This is for cost calculation rejecting test Costs should be multiple of 5  */
    describe('/POST api/products', () => {
		it('it should **NOT** POST a product', (done) => {
			const product = {
				productName: productNameGenerated,
				description: 'test description',
				cost: 3, // -> here this is not %5 == 0
				amountAvailable: 10
			};

			chai.request(server)
				.post('/api/products/')
				.send(product)
				.set('x-access-token', token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
                    res.body.should.have.property('status').eql(false);
					done();
				});
		});
	});

    /* This will confirm the record */
    describe('/POST api/products', () => {
		it('it should POST a product', (done) => {
			const product = {
				productName: productNameGenerated,
				description: 'test description',
				cost: 5, // -> this is okay.
				amountAvailable: 10 
			};

			chai.request(server)
				.post('/api/products/')
				.send(product)
				.set('x-access-token', token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
                    res.body.should.have.property('status').eql(true);
					product_id = res.body.data._id;
					done();
				});
		});
	});
 
	describe('/PUT/ api/products/update/:product_id', () => {
		it('it should UPDATE a product given by id', (done) => {
			const product = {
				productName: productNameGenerated + ' - updated ',
				description: 'test description - updated',
				cost: 15, // -> this is okay.
				amountAvailable: 5 
			};

			chai.request(server)
				.put('/api/products/update/' + product_id)
				.send(product)
				.set('x-access-token', token)
				.end((err, res) => {
					res.body.should.be.a('object');
					res.body.should.have.property('status').eql(true);
					res.body.should.have.property('data').to.have.own.property('productName').eql(product.productName);
					res.body.should.have.property('data').to.have.own.property('description').eql(product.description);
					res.body.should.have.property('data').to.have.own.property('cost').eql(product.cost);
					res.body.should.have.property('data').to.have.own.property('amountAvailable').eql(product.amountAvailable);
                    
					
					done();
				});
		});

    });
});