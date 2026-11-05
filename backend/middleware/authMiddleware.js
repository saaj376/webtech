const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authorization = req.get('Authorization');

  if (!authorization) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  const bearer = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!bearer) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim() || secret.includes('<')) {
    console.error('JWT verification secret is not configured.');
    return res.status(500).json({ message: 'Unable to authenticate request. Please try again later.' });
  }

  try {
    const decoded = jwt.verify(bearer[1], secret, { algorithms: ['HS256'] });

    if (typeof decoded !== 'object' ||
        typeof decoded.userId !== 'string' || !decoded.userId ||
        typeof decoded.emailId !== 'string' || !decoded.emailId ||
        !['user', 'admin'].includes(decoded.role) ||
        typeof decoded.exp !== 'number') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return next();
}

module.exports = authMiddleware;
