const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const validateCost = (e) => {
  if (e === 0 || e % 5 !== 0) return false;
  else return true;
};

const validateAmount = (e) => {
  //description not explaing how many etc. So I assume the vending machine slots max. 10 per slots.
  //For future enhancement, made it with validateAmount function.

  if (e > 10) return false;
  else return true;
};

const ProductSchema = new Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  productName: {
    type: String,
    required: [true, " {PATH} is required."],
    unique: true,
    max: [50, "max length for {PATH} is ({MAXLENGTH})"], //not considering led screen size as this is a demo
    min: 2,
  },
  username: {
    type: String,
    required: true,
    max: 4,
    min: 2,
    immutable: true,
  },
  description: {
    type: String,
    required: [true, " {PATH} is required."],
    max: [100, "max length for {PATH} is ({MAXLENGTH})"],
    min: 5,
  },
  cost: {
    type: Number,
    default: 0,
    validate: [
      validateCost,
      "Cost of a product should multiples of 5 and can not be for free",
    ],
  },
  amountAvailable: {
    type: Number,
    default: 0,
    validate: [validateAmount, "Product amounts can not be more then 10pcs."],
    min: 0,
    max: 10,
  },
  sales: {
    type: Number,
    default: 0,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("products", ProductSchema);
