const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const ProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 1 create account requests per `window` (here, per hour)
  message: {
    status: false,
    message:"Too many conections by same IP, please follow-up x-limits and try again after an hour later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @api {get} /products /products/all /products/full
 * @apiName Show Products List
 * @apiPermission JWT Token
 * @apiGroup User (all users)
 *
 * @apiParam  {String} [token] token
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `Product` object(s) -> _id, productName, cost, amountAvailable
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.get(['/', '/all', '/full'], ProductLimiter, (req, res) => {
	const promise = Product.aggregate([ //Mongodb
		{
			$lookup: {
				from: 'users',
				localField: 'seller_id',
				foreignField: '_id',
				as: 'seller'
			}
		},
		{
			$unwind: {
				path: '$seller',
			}
		},
		  {
			$project: {
				_id: '$_id',
				productName: '$productName',
				cost: '$cost',
        amountAvailable: '$amountAvailable' 
			}
		}
	]);

	promise.then((data) => {res.json({status:true, data:data});	}).catch((err) => {res.json(err);})});

/**
 * @api {post} /products
 * @apiName Create Product
 * @apiPermission JWT Token
 * @apiGroup User (sellers)
 *
 * @apiParam  {String} [token] token
 * @apiParam  {String} [productName] productName
 * @apiParam  {String} [description] description
 * @apiParam  {Number} [cost] enum [0, 5, 10, 20, 50, 100] from Schema
 * @apiParam  {Number} [amountAvailable] max:10 from Schema - considered the vending-machine slots.
 * @apiParam  {String} [seller_id] Schema-Object-Relation
 * @apiParam  {String} [username] Simply-bypass mongodb jungle
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `Product` object(s) -> _id, productName, cost, amountAvailable
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.post('/', ProductLimiter, function (req, res, next) {

    let userid = req.decoded.username;
    let userRole = req.decoded.role;
    let param = { username: userid };

    if (userRole !== 'seller')
      res.json({ status: false, message: 'Only sellers can deploy products' });
    else {
      const _promise = User.find(param).select({ _id: 1 });

      _promise.then((data) => !data ? next({ message: 'Not added!', code: 0 }) : data).then((data) => {

        const { productName, description, cost, amountAvailable } = req.body;

        const insert = new Product({
          productName,
          description,
          cost,
          amountAvailable,
          seller_id: data[0].id,
          username: userid //keeping simple
        });

        const promise = insert.save();
        promise.then((data) => {
          !data ? next({ message: 'Not added!', code: 0 }) : res.json({ status: true, data: data });
        }).catch((e) => { res.json({ status: false, error: e.message }); });
      }).catch((e) => { res.json({ status: false, error: e.message }); });

    }
  });

/**
 * @api {get} /products/detail/:product_id
 * @apiName Show product - No action
 * @apiPermission JWT Token
 * @apiGroup User (all users)
 *
 * @apiParam  {String} [token] token
 * @apiParam  {String} [productName] productName
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `Product` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.get('/detail/:product_id', ProductLimiter, (req, res, next) => {
 
  if (req.params.product_id.match(/^[0-9a-fA-F]{24}$/)) {

    const promise = Product.findById({_id: req.params.product_id});

    promise.then((data) => {
      !data ? next({ message: 'Product Not found!', code: 0 }) : res.json({status:true, data:data});
    }).catch( (e)=>{res.json({status:false, error:e.message})} );;

  } else res.json({status: false, message: 'invalid product id'});

  
});

/**
 * @api {put} /update/:product_id
 * @apiName Update Product
 * @apiPermission JWT Token
 * @apiGroup User (seller's own products)
 *
 * @apiParam  {String} [token] token
 * @apiParam  {String} [productName] productName unique
 * @apiParam  {String} [description] description
 * @apiParam  {Number} [cost] multiples of 5 from Schema
 * @apiParam  {Number} [amountAvailable] enum [0, 5, 10, 20, 50, 100] from Schema
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes
 * 
 * @apiFixing if user_id is different then the authenticated user's id, 
 * return {status:false, message:'You can conly update your own products.'}
 * 
 * @apiSuccess (200) {Object} mixed `Product` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.put('/update/:product_id', ProductLimiter, (req, res, next) => {

  if (req.params.product_id.match(/^[0-9a-fA-F]{24}$/) || !req.body) {

  let userid = req.decoded.username;

  const update = Product.findById(req.params.product_id).select({seller_id:1, username:1, _id:1}) 

  update.then( (data)=> {
    if(!data) {next({ message: 'Product not found!', code: 0 })}
    else if(userid != data.username){ next({status:false, message:'You can conly update your own products.'}) } //to permit admin: (userid != data.username && userrole!='admin')
    else {
      
      const { productName, description, cost, amountAvailable } = req.body;

      Product.findByIdAndUpdate( req.params.product_id, { productName, description, cost, amountAvailable}, {new:true, runValidators: true}).then((data) => {
        !data ? next({ message: 'Product can not be updated', code: 0 }) : res.json({status:true, data:data});
      }).catch( (e)=>{res.json({status:false, error:e.message})} );//admin can update anyone

    }}).catch( (e)=>{res.json({status:false, error:e.message})} );//admin can update anyone

  }
    else res.json({status:false, message: 'invalid id or empty data'});

});

/**
 * @api {put} /buy/:product_id
 * @apiName Buy Product
 * @apiPermission JWT Token
 * @apiGroup User (seller/buyer)
 *
 * @apiParam  {String} [token] token
 * @apiParam  {Number} [quantity] quantity
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes
 * 
 * @apiFixing Checking available amount of the product, user deposit and the exchange 
 * @apiNotes Buggy MongoDB transactions 
 * 
 * @apiSuccess (200) {Object} mixed `Result` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.put('/buy/:product_id', ProductLimiter, (req, res, next) => {
  
  if (req.params.product_id.match(/^[0-9a-fA-F]{24}$/) && req.body.quantity && req.body.quantity.match(/^[0-9]+$/) != null) {

  let userid = req.decoded.username;

  const update = Product.findById(req.params.product_id)

  update.then( (data)=> {
    if(!data) {next({ message: 'Product not found!', code: 0 })}
    else {
      const balance = User.findOne({username:userid});
            
      balance.then( (user)=> {

        if(!user) {next({ message: 'User not found!', code: 0 })}

        const { quantity } = req.body;
        const {cost, amountAvailable} = data;
        const {deposit} = user;

        let gross = cost*quantity;
        let exchange = deposit - gross;

        if(amountAvailable === 0) { res.json({status:false, message:"Sorry for that, this product is not avaialable."})}
        
        else if(quantity>amountAvailable) { res.json({status:false, message:`No sufficient product numbers. Currently max: ${amountAvailable} `})}
         
         
        //else if(![0, 5, 10, 20, 50, 100].includes(exchange)) { res.json({status:false, message:"I am not able to exchange. Please try changing quantity."})}
        
        else if ( cost*quantity > deposit) { res.json({status:false, message:`Your deposit is not enough. You have: ${deposit} and gross total is: ${gross}`})}
        
        else { //All done make sales.. 

        //calculation
        let change = [100, 50, 20, 10, 5];
          let exchange_safe= exchange;
          let exchange_description;
          let s = [];

          if (exchange % 10 !== 0 || exchange === 5) {
            s.push([5, 1]);
            exchange = exchange - 5;
          }

          if (exchange !== 0) {
            let amount = [...change].filter((x) => x <= exchange).sort((x, y) => y - x);
            let highest = amount.shift();
            let c = Math.floor(exchange / highest);
            s.push([highest, c]);
            let current = exchange - highest * c;
            if (current !== 0) {
              for (let i = 0; i < amount.length; i++) {
                let d = Math.floor(current / amount[i]);
                if (d >= 1) {
                  s.push([amount[i], d]);
                  current = current - amount[i] * d;
                }
              }
            }
          }

          exchange_description = s.sort((a, b) => b[0] - a[0]);
              
        const sales = Product.findByIdAndUpdate( req.params.product_id,  { $inc: { amountAvailable: -quantity, sales: 1 } }, {new:true, runValidators: true})
        .then((data) => {  if(!data) next({ message: 'Product can not be updated', code: 0 })
        else {
          const balance = User.findByIdAndUpdate(user.id,  { $inc: { deposit: -gross, sales: 1 }}).then( (data)=> 
          !data ? next({status:false, message:'User balance can not be updated!'}) : res.json({status:true, message:'Thank you visit again.', exchange:exchange_safe, exchange_description:exchange_description})
          ).catch( (e)=>{res.json({status:false, error:e.message})} );  } }).catch( (e)=>{res.json({status:false, error:e.message})} );
        }
          
      } );

    }}).catch( (e)=>{res.json({status:false, error:e.message})} );//admin can update anyone

  }
    else res.json({status:false, message: 'invalid product id or not valid quantity data'});

});

/**
 * @api {delete} /products/delete:product_id
 * @apiName Delete Products - if user.role == admin, possible to reset deposits to all users;
 * @apiPermission JWT Token and only user.role == admin
 * @apiGroup User (product owners) - Admins are not permited
 *
 * @apiParam  {String} [token] token
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes  (UserLimiter not in charge)
 * 
 * @apiFixing if user_id is different then the authenticated user's id, 
 * return {status:false, message:'You can only delete your own products.'}
 * 
 * @apiSuccess (200) {Object} mixed `Result` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.delete('/delete/:product_id', ProductLimiter, (req, res, next) => {

  if (req.params.product_id.match(/^[0-9a-fA-F]{24}$/) || !req.body) {

    let userid = req.decoded.username;

    const update = Product.findById(req.params.product_id).select({seller_id:1, username:1, _id:1}) 

    update.then( (data)=> {
      if(!data) {next({ message: 'Product not found!', code: 0 })}
      else if(userid != data.username){ next({status:false, message:'You can only delete your own products.'}) } //to permit admin: (userid != data.username && userrole!='admin')
      else { 
        const promise = Product.findByIdAndRemove(req.params.product_id).then((data) => {
          !data ? next({ message: 'Product can not be deleted', code: 0 }) : res.json({status:true, message:'Product deleted!'});
        }).catch( (e)=>{res.json({status:false, error:e.message})} );//admin can update anyone

      }}).catch( (e)=>{res.json({status:false, error:e.message})} );//admin can update anyone

    }
      else res.json({status:false, message: 'invalid id or empty data'});

});

/**
 * @api {get} /products/top10
 * @apiName List top 10 products - product.sales desc
 * @apiPermission JWT Token and only user.role == admin
 * @apiGroup User (all users)
 *
 * @apiParam  {String} [token] token
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:50 / JWT 12 minutes  (UserLimiter not in charge)
 * 
 * 
 * @apiSuccess (200) {Object} mixed `Product(s)` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O wending machine for demo purpose
 **/

router.get('/top10', ProductLimiter, (req, res, next) => {

  const promise = Product.find().limit(10).sort({sales:-1});

  promise.then((data) => {
    !data ? next({ message: 'No products found!', code: 0 }) : res.json({status:true, data:data});
  }).catch( (e)=>{res.json({status:false, error:e.message})} );;
  
});


module.exports = router;