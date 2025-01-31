export default module.exports = (req: any, res: any, next: any) => {
  const messageData = req.body;
  if (!messageData) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};