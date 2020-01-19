function Response(data, res) {

  let defaultStatus = 200;

  this.data  = data  || null;
  this.message = data? 'Retrieved Successfully': 'Not Found';
  this.status = 200;


  return this;
}

module.exports = Response;
