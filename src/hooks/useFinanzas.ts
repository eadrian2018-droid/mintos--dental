import { useState } from "react";

export default function useFinanzas() {

  const [
    tratamientos,
    setTratamientos,
  ] = useState<any[]>([]);

  const [
    pacientes,
    setPacientes,
  ] = useState<any[]>([]);

  const [
    gastos,
    setGastos,
  ] = useState<any[]>([]);

  const [
    doctores,
    setDoctores,
  ] = useState<any[]>([]);

  return {

    tratamientos,
    setTratamientos,

    pacientes,
    setPacientes,

    gastos,
    setGastos,

    doctores,
    setDoctores,

  };

}