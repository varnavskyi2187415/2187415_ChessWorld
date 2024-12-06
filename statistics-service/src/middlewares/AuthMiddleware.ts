export default module.exports = (req: any, res: any, next: any) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  console.log('Token is valid');
  next();
};