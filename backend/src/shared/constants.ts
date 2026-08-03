export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'change-this-secret',
};

export const Roles = {
  Admin: 'admin',
  Customer: 'customer',
};
