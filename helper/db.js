const mongoose = require('mongoose');

const mongoOptions = {
    autoIndex: true, //this is the code I added that solved it all
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    //useFindAndModify: false, 
  }

const mongodb_crendentials = process.env.mongodb_crendentials

module.exports = () => {
    mongoose.connect('mongodb+srv://'+mongodb_crendentials+'@mcluster.yuskm.mongodb.net/vending_machine?retryWrites=true&w=majority', mongoOptions)

    mongoose.connection.on('open', ()=> {

        //console.log('MongoDB:Connected');

    })
    mongoose.connection.on('error', (err)=> {

        console.log('MongoDB: Not Connected ' + err);

    })

    mongoose.Promise = global.Promise;
}