import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../lib/supabase";

export default function Finanzas() {

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

useEffect(() => {

  cargarTratamientos();

  cargarPacientes();

  cargarGastos();

}, []);

async function cargarTratamientos() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "tratamientos"
    )

    .select("*");

  if (
    !error &&
    data
  ) {

    setTratamientos(
      data
    );

  }

}

async function cargarPacientes() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "pacientes"
    )

    .select("*");

  if (
    !error &&
    data
  ) {

    setPacientes(
      data
    );

  }

}

async function cargarGastos() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "gastos"
    )

    .select("*")

    .order(
      "fecha",
      {
        ascending: false,
      }
    );

  if (
    !error &&
    data
  ) {

    setGastos(
      data
    );

  }

}

const ingresos =

  tratamientos.reduce(

    (
      total,
      item
    ) =>

      total +

      Number(
        item.total || 0
      ),

    0

  );

const cobrado =

  tratamientos.reduce(

    (
      total,
      item
    ) =>

      total +

      Number(
        item.pago || 0
      ),

    0

  );

const pendiente =

  ingresos -

  cobrado;

  

  return (

    <div>

      <h1
        className="
          text-4xl
          font-bold
          text-slate-800
          mb-8
        "
      >

        Finanzas

      </h1>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          gap-6
          mb-8
        "
      >

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Ingresos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            ${ingresos.toLocaleString()}

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Cobrado
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            ${cobrado.toLocaleString()}

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Pendiente
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

            ${pendiente.toLocaleString()}

          </h2>

        </div>

        <div
          className="
            bg-white
            rounded-3xl
            shadow-lg
            p-6
          "
        >

          <p className="text-slate-500">
            Tratamientos
          </p>

          <h2
            className="
              text-3xl
              font-bold
              mt-2
            "
          >

           {tratamientos.length}

          </h2>

        </div>

      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
        "
      >

        <h2

  className="
    text-2xl
    font-bold
    mb-6
  "

>

  Movimientos

</h2>

<div
  className="
    overflow-x-auto
  "
>

  <table
    className="
      w-full
      text-sm
    "
  >

    <thead>

      <tr
        className="
          border-b
          border-slate-200
        "
      >

        <th className="p-3 text-left">
          Fecha
        </th>

        <th className="p-3 text-left">
  Paciente
</th>

        <th className="p-3 text-left">
          Tratamiento
        </th>

        <th className="p-3 text-left">
          Total
        </th>

        <th className="p-3 text-left">
          Pagado
        </th>

        <th className="p-3 text-left">
          Pendiente
        </th>

      </tr>

    </thead>

    <tbody>

      {

        tratamientos.map(
          (
            item: any
          ) => (

            <tr
              key={item.id}
              className="
                border-b
                border-slate-100
              "
            >

              <td className="p-3">

  {item.fecha}

</td>

<td className="p-3">

  {

    pacientes.find(

      (p) =>

        p.id ===
        item.paciente_id

    )?.nombre ||

    "-"

  }

</td>

<td className="p-3">

  {item.tratamiento}

</td>

<td className="p-3">

  $

  {Number(
    item.total
  ).toLocaleString()}

</td>

<td className="p-3">

  $

  {Number(
    item.pago
  ).toLocaleString()}

</td>

<td className="p-3">

  $

  {Number(
    item.resta
  ).toLocaleString()}

</td>

            </tr>

          )
        )

      }

      <tr
  className="
    bg-slate-50
    font-bold
    border-t-2
    border-slate-300
  "
>

  <td
    className="p-3"
    colSpan={3}
  >

    TOTAL GENERAL

  </td>

  <td className="p-3">

    $

    {ingresos.toLocaleString()}

  </td>

  <td className="p-3">

    $

    {cobrado.toLocaleString()}

  </td>

  <td className="p-3">

    $

    {pendiente.toLocaleString()}

  </td>

</tr>

    </tbody>

  </table>

</div>

      </div>

    </div>

  );

}