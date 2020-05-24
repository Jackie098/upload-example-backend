const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require("aws-sdk");
const multerS3 = require('multer-s3');

const storageTypes = {
  local:  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
    },
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        if(err) callback(err);

        file.key = `${hash.toString('hex')}-${file.originalname}`;

        callback(null, file.key);
      });
    },
  }),

  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE, //Essa declaração nos permite abrir a imagem no navegador ao invès de forçar o download
    acl:'public-read', //permissão de leitura
    key: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        if(err) callback(err);

        const fileName = `${hash.toString('hex')}-${file.originalname}`;

        callback(null, fileName);
      });
    }
  }),
}

module.exports =  {
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    /** 
     * A ideia é transformar o tamanho máximo do arquivo que será medido em 
     * bytes para Mbytes. Primeiro converto para Kbytes e dps para Mbytes,
     * neste caso, o tamanho máximo que um arquivo pode ter é de 2MB
     * */ 
    fileSize: 2 * 1024 * 1024,
  },
  /**
   * Serve para filtrar os arquivos. Um exemplo é quando eu quero lmiitar o tipo
   * de arquivo que o usuário poderá fazer o upload: "não quero 
   * arquivos com a extensão .jep e nem .gif" (por exemplo)
   */
  fileFilter: (req, file, callback) => { 
    /**
     * 3 parâmetros -
     * -> A requisição
     * -> O arquivo a ser manipulado
     * -> A função de retorno
     */

     //mime types permitidas
     const allowedMimes = [
       'image/jpeg',
       'image/pjpeg',
       'image/png',
       'image/gif',
     ];

     /**
      * Se o arquivo estiver no array acima, retorna tudo ok, se não estiver
      * retorna um erro
      */
     if(allowedMimes.includes(file.mimetype)){
       callback(null, true);
     } else {
       callback(new Error("Invalid file type."));
     }
  },
}