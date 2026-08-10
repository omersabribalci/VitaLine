const accessTokenConfig = {
  secret: process.env.ACCESS_TOKEN_SECRET,
  expiresIn: "15m",
};

const refreshTokenConfig = {
  secret: process.env.REFRESH_TOKEN_SECRET,
  expiresIn: "3d",
};

module.exports = { accessTokenConfig, refreshTokenConfig };
