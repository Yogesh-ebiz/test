// Response Interceptor Middleware
const response = (req, res, next) => {
  try {
    const oldJSON = res.json;
    res.json = (data) => {

      // For Async call, handle the promise and then set the data to `oldJson`
      if (data && data.then != undefined) {
        // Resetting json to original to avoid cyclic call.
        return data.then((responseData) => {
          // Custom logic/code. -----> Write your logic to add success wrapper around the response
          res.json = oldJSON;
          // return oldJSON.call(res, responseData);
          res.json({ data: responseData, code: res.statusCode, message: 'Success'});
        }).catch((error) => {
          next(error);
        });
      } else {
        // For non-async interceptor functions
        // Resetting json to original to avoid cyclic call.
        // Custom logic/code.
        res.json = oldJSON;
        // const result = res.statusCode >=400 ? null:data;
        // const message = res.statusCode >=400 ? 'Fail':'Success';
        // return oldJSON.call(res, data);
        if(res.statusCode>=400){
          delete data.stack;
          return res.json({...data, data: null});
        } else {
          return res.json({ data, code: res.statusCode, message: 'Success' });
        }
      }
    }
  } catch (error) {
    next(error);
  }

  next();
}


module.exports = {
  response,
};
