const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use("/user", userRoutes);
app.use("/reserva", reservaRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("[SUCCESS] :: API Sala3 funcionando!");
});

const db = require("./models")
db.sequelize
    .sync()
    .then(() => {
        console.log("Banco de dados sincronizado com sucesso!");
    })
    .catch((err) => {
        console.error("Erro ao sincronizar banco de dados :: ", err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[SUCCESS] :: Servidor rodando na porta ${PORT}!`));