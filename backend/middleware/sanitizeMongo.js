// Removes MongoDB operator keys like "$ne" and dotted keys from request input.
function clean(value) {
  if (!value || typeof value !== 'object') {
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
    } else {
      clean(value[key]);
    }
  }
}

function sanitizeMongo(req, res, next) {
  clean(req.body);
  clean(req.params);
  return next();
}

module.exports = sanitizeMongo;
