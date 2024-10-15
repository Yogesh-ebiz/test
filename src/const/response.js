function Response(data, message, res) {

  let defaultStatus = 200;

  this.data  = data  || null;
  this.message = res.__(message);
  this.status = 200;


  return this;
}

module.exports = Response;
