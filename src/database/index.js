const mongoose = require('mongoose');

function mongo() {
  mongoose.connect(
    process.env.MONGO_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
}


module.exports = mongo();