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

const [
  seccionActiva,
  setSeccionActiva,
] = useState(
  "resumen"
);

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

  const totalGastos =

  gastos.reduce(

    (
      total,
      gasto: any
    ) =>

      total +

      Number(
        gasto.monto || 0
      ),

    0

  );

const gananciaNeta =

  ingresos -

  totalGastos;

  

 return (

  <div
    className="
      flex
      gap-4
    "
  >

        <div
      className="
        w-40
        bg-white
        rounded-3xl
        shadow-lg
        p-4
        h-fit
      "
    >

      <h2
        className="
          font-bold
          text-lg
          mb-4
        "
      >

        Finanzas

      </h2>

      <div
        className="
          flex
          flex-col
          gap-2
        "
      >

       <button

  onClick={() =>
    setSeccionActiva(
      "resumen"
    )
  }

  className={`

    p-3
    rounded-xl
    text-left
    transition

    ${

      seccionActiva ===
      "resumen"

      ?

      "bg-teal-600 text-white"

      :

      "bg-slate-100"

    }

  `}
>

  Resumen

</button>

       <button

  onClick={() =>
    setSeccionActiva(
      "gastos"
    )
  }

  className={`

    p-3
    rounded-xl
    text-left
    transition

    ${

      seccionActiva ===
      "gastos"

      ?

      "bg-teal-600 text-white"

      :

      "bg-slate-100"

    }

  `}
>

  Gastos

</button>

<button

  onClick={() =>
    setSeccionActiva(
      "comisiones"
    )
  }

  className={`

    p-3
    rounded-xl
    text-left
    transition

    ${

      seccionActiva ===
      "comisiones"

      ?

      "bg-teal-600 text-white"

      :

      "bg-slate-100"

    }

  `}
>

  Comisiones

</button>

<button

  onClick={() =>
    setSeccionActiva(
      "doctores"
    )
  }

  className={`

    p-3
    rounded-xl
    text-left
    transition

    ${

      seccionActiva ===
      "doctores"

      ?

      "bg-teal-600 text-white"

      :

      "bg-slate-100"

    }

  `}
>

  Doctores

</button>

<button

  onClick={() =>
    setSeccionActiva(
      "configuracion"
    )
  }

  className={`

    p-3
    rounded-xl
    text-left
    transition

    ${

      seccionActiva ===
      "configuracion"

      ?

      "bg-teal-600 text-white"

      :

      "bg-slate-100"

    }

  `}
>

  Configuración

</button>

      </div>

    </div>

        <div
      className="
        flex-1
      "
    >

      <h1
        className="
          text-4xl
          font-bold
          text-slate-800
          mb-8
        "
      >

        {seccionActiva.charAt(0).toUpperCase() + seccionActiva.slice(1)}

      </h1>

      {seccionActiva === "gastos" && (

  <div
    className="
      bg-white
      rounded-3xl
      shadow-lg
      p-6
      mb-6
    "
  >

    <div
      className="
        flex
        justify-between
        items-center
        mb-6
      "
    >

      <h2
        className="
          text-2xl
          font-bold
        "
      >

        Gastos

      </h2>

      <button
        className="
          bg-teal-600
          text-white
          px-4
          py-2
          rounded-xl
        "
      >

        Agregar gasto

      </button>

    </div>

    <p>

      Total de gastos registrados:

      {" "}

      <strong>

        {gastos.length}

      </strong>

    </p>

    <div
  className="
    overflow-x-auto
    mt-6
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

          Concepto

        </th>

        <th className="p-3 text-left">

          Categoría

        </th>

        <th className="p-3 text-left">

          Monto

        </th>

      </tr>

    </thead>

    <tbody>

      {

        gastos.map(
          (
            gasto: any
          ) => (

            <tr
              key={gasto.id}
              className="
                border-b
                border-slate-100
              "
            >

              <td className="p-3">

                {gasto.fecha}

              </td>

              <td className="p-3">

                {gasto.concepto}

              </td>

              <td className="p-3">

                {gasto.categoria}

              </td>

              <td className="p-3">

                $

                {Number(
                  gasto.monto
                ).toLocaleString()}

              </td>

            </tr>

          )
        )

      }

    </tbody>

  </table>

</div>

  </div>

)}

{seccionActiva === "comisiones" && (

  <div
    className="
      bg-white
      rounded-3xl
      shadow-lg
      p-6
      mb-6
    "
  >

    <h2 className="text-2xl font-bold">

      Comisiones

    </h2>

  </div>

)}

{seccionActiva === "doctores" && (

  <div
    className="
      bg-white
      rounded-3xl
      shadow-lg
      p-6
      mb-6
    "
  >

    <h2 className="text-2xl font-bold">

      Doctores

    </h2>

  </div>

)}

{seccionActiva === "configuracion" && (

  <div
    className="
      bg-white
      rounded-3xl
      shadow-lg
      p-6
      mb-6
    "
  >

    <h2 className="text-2xl font-bold">

      Configuración

    </h2>

  </div>

)}

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

        <div
  className="
    bg-white
    rounded-3xl
    shadow-lg
    p-6
  "
>

  <p className="text-slate-500">

    Gastos

  </p>

  <h2
    className="
      text-3xl
      font-bold
      mt-2
      text-red-600
    "
  >

    $

    {totalGastos.toLocaleString()}

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

    Ganancia Neta

  </p>

  <h2
    className="
      text-3xl
      font-bold
      mt-2
      text-green-600
    "
  >

    $

    {gananciaNeta.toLocaleString()}

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

    </div>

  );

}