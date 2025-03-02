import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

interface Passenger {
  id: number;
  name: string;
  rides: number;
}

export default function App() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [fareInput, setFareInput] = useState("10,00");
  const [newPassenger, setNewPassenger] = useState("");

  const fareNumber = parseFloat(fareInput.replace(",", ".")) || 0;

  useEffect(() => {
    fetch("/api/passageiros")
      .then((res) => res.json())
      .then((data) => setPassengers(data));
  }, []);

  const addPassenger = async () => {
    if (newPassenger.trim() === "") return;
    const response = await fetch("/api/passageiros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPassenger }),
    });
    const data = await response.json();
    setPassengers([...passengers, data]);
    setNewPassenger("");
  };

  const updateRides = async (id: number, action: "increment" | "decrement") => {
    const response = await fetch("/api/caronas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const updatedPassenger = await response.json();
    setPassengers(passengers.map((p) => (p.id === id ? updatedPassenger : p)));
  };

  const handleFareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFareInput(e.target.value);
  };

  const handleFareBlur = () => {
    const numeric = parseFloat(fareInput.replace(",", ".")) || 0;
    setFareInput(
      numeric.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerenciador de Caronas</h1>
      <div className="mb-6">
        <label className="text-lg font-semibold">Valor por carona (R$)</label>
        <Input
          type="text"
          value={fareInput}
          onChange={handleFareChange}
          onBlur={handleFareBlur}
          className="border p-2 w-full mt-2"
        />
      </div>
      <div className="mb-6">
        <label className="text-lg font-semibold">Adicionar Passageiro</label>
        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="Nome do passageiro"
            value={newPassenger}
            onChange={(e) => setNewPassenger(e.target.value)}
            className="border p-2 flex-grow"
          />
          <Button onClick={addPassenger}>Adicionar</Button>
        </div>
      </div>
      {passengers.map((passenger) => (
        <Card key={passenger.id} className="mb-3">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{passenger.name}</p>
              <p className="text-sm text-gray-600">
                Caronas: {passenger.rides}
              </p>
              <p className="text-sm font-semibold text-blue-600">
                Total devido: R${" "}
                {(passenger.rides * fareNumber).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => updateRides(passenger.id, "increment")}>
                +1
              </Button>
              <Button onClick={() => updateRides(passenger.id, "decrement")}>
                -1
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}