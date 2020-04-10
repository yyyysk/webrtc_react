const express = require('express');
const app = express();

app.use(express.static('app/build'));
app.use('/', express.static(__dirname + '/app/build'));

app.use((req, res, next) =>  {
  next(createError(404));
});

app.use((err, req, res, next) =>  {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;