const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const validateDeposit = (e) => {
  let deposits = [0, 5, 10, 20, 50, 100];
  if (!deposits.includes(e)) return false;
  else return true;
};

const UserSchema = new Schema({
  //_id: mongoose.SchemaTypes.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
    max: 4,
    min: 2,
    immutable: true,
  },
  password: {
    type: String,
    required: [true, " {PATH} is required."],
    max: [16, "max length for {PATH} is ({MAXLENGTH})"],
    min: 5,
  },
  deposit: {
    type: Number,
    default: 0,
    validate: [
      validateDeposit,
      "Deposit can only be 5,10,20,50,100 or withdraws",
    ],
  },
  role: {
    type: String,
    enum: ["admin","buyer", "seller"], //admin logic should be control by external class
    message: "{VALUE} is not supported. Try {buyer/seller}",
    required: [true, " {PATH} is required. You can set {buyer/seller}"],
    lowercase: true,
    immutable: true, //there should be some other features to update and track clients. Not here.
  },
  products: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", UserSchema);
