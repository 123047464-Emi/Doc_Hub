const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("dotenv").config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DocHub API",
      version: "1.0.0",
      description: "Documentación de la API de gestión documental"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./routes/*.js"]
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rate limiter (protecciÃ³n bÃ¡sica)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/usuarios", require("./routes/usuarios"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/expedientes", require("./routes/expedientes"));
app.use("/documentos", require("./routes/documentos"));
app.use("/firmas", require("./routes/firmas"));
app.use("/notificaciones", require("./routes/notificaciones"));

app.use((err, _req, res, _next) => {
  res.status(400).json({ message: err.message || "Error en la solicitud" });
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("API corriendo en puerto " + process.env.PORT);
});

const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const certPath = path.join(__dirname, 'certs', 'server.crt');
const keyPath = path.join(__dirname, 'certs', 'server.key');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
    console.log("API HTTPS corriendo en puerto " + HTTPS_PORT);
  });
} else {
  console.warn('[SSL] No se encontraron certificados en /certs. HTTPS no se inició.');
}