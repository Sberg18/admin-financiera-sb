const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log de entrada
  console.log(`📥 ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer [REDACTED]' : 'None',
      'user-agent': req.headers['user-agent']
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body).substring(0, 500) : 'N/A',
    query: req.query
  });

  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log de salida
    console.log(`📤 ${req.method} ${req.path} ${statusCode}`, {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      status: statusCode,
      response: statusCode >= 400 ? body : `${statusCode < 400 ? '✅' : '❌'} Success`
    });
    
    originalSend.call(this, body);
  };

  next();
};

module.exports = logger;