module.exports = {
  apps: [
    {
      name: "tibia-home-worker",
      script: "npm",
      args: "run start:worker",
      cwd: "C:\\Users\\pifot\\Desktop\\simulator",
      // Altere esta URL depois para a URL do seu servidor Maestro no Render.com
      // Exemplo: "https://whellofdestiny-maestro.onrender.com"
      env: {
        MAESTRO_URL: "http://localhost:3000"
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
