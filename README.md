# Demo
[Live demo on Heroku CD](https://nodejs-vending-machine-restapi.herokuapp.com/)

# Nodejs Vending Machine Rest Api

```js
const Deniz_Umut_Dereli = {
  title:
    "Senior Full Stack Developer, Software/Database Architect",
  contact: {
    linkedin: "denizumutereli",
    email: "denizumutdereli@gmail.com",
  },
};
```
This is a demo purpose Vending Machine Rest Api Project by @denizumutdereli
 
 > npm install

 > npm start
 
 > npm test

 > /api -> verifyToken middleware x-access-token in all requests

 
# Welcome

| Route | HTTP Verb	 | POST body	 | Description	 |
| --- | --- | --- | --- |
| / | `ALL` | Empty | Api welcome resonse. |

# Registration & Auth (JWT)

| Route | HTTP Verb	 | POST body	 | Description	 |
| --- | --- | --- | --- |
| /user | `POST` | { username:'James Bond', password: '007', role: 'seller/buyer'} | Create a new user |
| /register | `POST` | { username:'James Bond', password: '007', role: 'seller/buyer'} | Create a new user |
| /auth | `POST` | { username:'James Bond', password: '007'} | Getting Login and JWT Auth token |

# Users

| Route | HTTP Verb	 | POST body	 | Description	 |
| --- | --- | --- | --- |
| /api/user | `GET` | {empty} |  List profile. (Admin role can list all users) |
| /api/user/update/:user_id | `PUT` | { username:'James Bond', password: '007', deposit:100 }| Update user info |
| /api/user/deposit/:user_id | `PUT` | {deposit:100 }| Update user deposit |
| /api/user/reset/:user_id | `PUT` | { empty}| Reset user deposit |
| /api/user/delete/:user_id | `DELETE` | Empty | Delete a user @only admins roles |

# Products

| Route | HTTP Verb	 | POST body	 | Description	 |
| --- | --- | --- | --- |
| /api/products | `GET` | Empty | List all products. |
| /api/products | `POST` | {productName:'After8', description:'Menthol Chocalate', cost:5, amountAvailable:10}} | Create a new product |
| /api/products/top10 | `GET` | Empty | Get top10 products {sales.desc}. |
| /api/products/detail/:product_id | `GET` | {empty} | Get details of the product |
| /api/products/buy/:product_id | `PUT` | {quantity:1} | Buy one product. Exchange calculation: Deposit and amount of the product decrease |
| /api/products/update/:product_id | `PUT` | {productName:'After8', description:'Menthol Chocalate', cost:5, amountAvailable:10}} | Product update - owners |
| /api/products/delete/:product_id | `DELETE` | Empty | Delete product - owners |

# Demo
[Live demo on Heroku CD](https://nodejs-vending-machine-restapi.herokuapp.com/)

Cheers!
