const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const server = require("../app");
const genUsername = require("unique-username-generator");

chai.use(chaiHttp);

const product_id = "61ec11c1fb93fc8aeb5331dc"; //test product with amount availabla 10.000
const quantity = Math.floor(Math.random() * 5 + 1).toString();
let token, user_id;

describe("/api/produsts TEST", () => {
  before("Get Token", (done) => {
    chai
      .request(server)
      .post("/auth")
      .send({ username: "buyer@test.com", password: "test" })
      .end((err, res) => {
        if (err) throw err;

        token = res.body.token;

        done();
      });
  });

  describe("/GET User Profile", () => {
    it("Get User record", (done) => {
      chai
        .request(server)
        .get("/api/user/")
        .set("x-access-token", token)
        .end((err, res) => {
          if (err) throw err;

          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("status").eql(true);
          user_id = res.body.data[0]._id;
          done();
        });
    });
  });

  describe("/PUT api/user/deposit/:user_id Deposit", () => {
    it("Update deposit info", (done) => {
      const options = {
        deposit: 100,
      };

      chai
        .request(server)
        .put("/api/user/deposit/" + user_id)
        .set("x-access-token", token)
        .send(options)
        .end((err, res) => {
          if (err) throw err;

          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have
            .property("data")
            .to.have.own.property("deposit")
            .eql(100);
          done();
        });
    });
  });

  describe("/PUT api/products/buy/:product_id Product Buy", () => {
    it("it should BUY a product", (done) => {
      const options = {
        quantity: quantity,
      };

      chai
        .request(server)
        .put("/api/products/buy/" + product_id)
        .set("x-access-token", token)
        .send(options)
        .end((err, res) => {
          if (err) throw err;

          console.log(res.body);

          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("exchange").eql(100 - quantity * 5);
          done();
        });
    });
  });
});
