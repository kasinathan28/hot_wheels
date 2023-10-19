const mongoose = require('mongoose');
const db = process.env.DATABASE;

console.log('DB Connection String:', db); // Add this line for debugging

mongoose.connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log("Connected successfully..!");
})
.catch((error)=> {
    console.log(error);
});
