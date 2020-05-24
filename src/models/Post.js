const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util'); //converte o formato antigo para utiliazr o "async/await"


const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String, //Nome original da imagem
  size: Number,   
  key: String,    //Nome original + hash da imagem
  url: String, //Ficará a url que a imagem está contida
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre('save', function() {
  if(!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

PostSchema.pre('remove', function() {
  if(process.env.STORAGE_TYPE === 's3') {
    return s3.deleteObject({
      Bucket: process.env.AWS_BUCKET,
      Key: this.key,
    }).promise();     //o mongoose utiliza o formato antigo, mas equivalentemente, estamos lançando uma função assíncrona.
  } else {
    return promisify(fs.unlink)(path.resolve(__dirname,
       '..', '..', 'tmp', 'uploads', this.key));
  }
});

module.exports = mongoose.model("Post", PostSchema);