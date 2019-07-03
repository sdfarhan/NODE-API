module.exports = {
    database : 'mongodb+srv://farhan:farhan123@demo-nhoid.mongodb.net/test?retryWrites=true&w=majority',
    secretKey : 'mykey',
    mongoUri : process.env.MONGOLAB_URI ||
  'mongodb+srv://farhan:farhan123@demo-nhoid.mongodb.net/test?retryWrites=true&w=majority'
}