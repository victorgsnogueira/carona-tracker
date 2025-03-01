import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import serverless from "serverless-http";

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.resolve("./api/db.json");

const readDB = () => JSON.parse(fs.readFileSync(dbPath, "utf-8"));

const writeDB = (data: any) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");

app.get("/passageiros", (req, res) => {
  const db = readDB();
  res.json(db.passageiros);
});

app.post("/passageiros", (req, res) => {
  const db = readDB();
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nome é obrigatório" });

  const novoPassageiro = { id: Date.now(), name, rides: 0 };
  db.passageiros.push(novoPassageiro);
  writeDB(db);

  res.status(201).json(novoPassageiro);
});

app.put("/caronas", (req, res) => {
  const db = readDB();
  const { id, action } = req.body;
  const passageiro = db.passageiros.find((p: any) => p.id === id);
  if (!passageiro)
    return res.status(404).json({ error: "Passageiro não encontrado" });

  if (action === "increment") passageiro.rides += 1;
  if (action === "decrement" && passageiro.rides > 0)
    passageiro.rides -= 1;

  writeDB(db);
  res.json(passageiro);
});

export default serverless(app);