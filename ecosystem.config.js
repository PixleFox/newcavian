module.exports = {
  apps: [
    {
      name: "cavian",
      script: "node",
      args: "./node_modules/next/dist/bin/next start",
      cwd: "E:\\Cavian-website\\cavian",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};