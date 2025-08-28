const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const authRoutes = require("./routes/authRoutes");
// passar para migrations depois
const db = require("./models");

const app = express();

app.use(cors());
// app.use(cors({
//   origin: ["https://sala3.vercel.app"],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/reserva", reservaRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("[SUCCESS] :: API Sala3 funcionando!");
});

db.sequelize
    .sync({ force: true })
    .then(() => {
        console.log("Banco de dados sincronizado com sucesso!");
    })
    .catch((err) => {
        console.error("Erro ao sincronizar banco de dados :: ", err);
    });

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`[SUCCESS] :: Servidor rodando na porta ${PORT}!`));