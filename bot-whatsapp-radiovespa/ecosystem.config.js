module.exports = {
  apps: [
    {
      name: "radiovespa-bot",
      script: "logic/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
