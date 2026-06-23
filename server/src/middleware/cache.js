export const cache = (ttl) => {
  const storage = new Map();
  return (req, res, next) => {
    const key = req.url;
    const cached = storage.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.send(cached.data);
    }

    const originalSend = res.send;
    res.send = (body) => {
      storage.set(key, { data: body, timestamp: Date.now() });
      return originalSend.call(res, body);
    };

    next();
  };
};
