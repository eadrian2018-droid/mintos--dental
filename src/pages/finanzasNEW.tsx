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

const [
  periodo,
  setPeriodo,
] = useState(
  "semana"
);

const [
  fechaGasto,
  setFechaGasto,
] = useState("");

const [
  conceptoGasto,
  setConceptoGasto,
] = useState("");

const [
  categoriaGasto,
  setCategoriaGasto,
] = useState("");

const [
  montoGasto,
  setMontoGasto,
] = useState("");

const [
  notasGasto,
  setNotasGasto,
] = useState("");

const [
  doctores,
  setDoctores,
] = useState<any[]>([]);

const [
  nombreDoctor,
  setNombreDoctor,
] = useState("");

const [
  especialidadDoctor,
  setEspecialidadDoctor,
] = useState("");

const [
  porcentajeDoctor,
  setPorcentajeDoctor,
] = useState("30");

useEffect(() => {

  cargarTratamientos();

  cargarPacientes();

  cargarGastos();

  cargarDoctores();

}, []);

async function guardarDoctor() {

  const {
    error,
  } = await supabase

    .from(
      "doctores"
    )

    .insert([
      {
        nombre:
          nombreDoctor,

        especialidad:
          especialidadDoctor,

        porcentaje:
          Number(
            porcentajeDoctor
          ),

        activo: true,
      },
    ]);

  if (
  error
) {

  console.log(
    error
  );

  alert(
    error.message
  );

  return;

}
  setNombreDoctor("");

  setEspecialidadDoctor("");

  setPorcentajeDoctor(
    "30"
  );

  cargarDoctores();

}

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

async function cargarDoctores() {

  const {
    data,
    error,
  } = await supabase

    .from(
      "doctores"
    )

    .select("*")

    .order(
      "nombre",
      {
        ascending: true,
      }
    );

  if (
    !error &&
    data
  ) {

    setDoctores(
      data
    );

  }

}

async function guardarGasto() {

  const {
    error,
  } = await supabase

    .from(
      "gastos"
    )

    .insert([
      {
        fecha: fechaGasto,
        concepto: conceptoGasto,
        categoria: categoriaGasto,
        monto: Number(
          montoGasto
        ),
        notas: notasGasto,
      },
    ]);

  if (
    error
  ) {

    alert(
      "Error al guardar gasto"
    );

    return;

  }

  setFechaGasto("");

  setConceptoGasto("");

  setCategoriaGasto("");

  setMontoGasto("");

  setNotasGasto("");

  cargarGastos();

}

async function eliminarGasto(
  id: number
) {

  const confirmar =
    window.confirm(
      "¿Eliminar este gasto?"
    );

  if (
    !confirmar
  ) {

    return;

  }

  await supabase

    .from(
      "gastos"
    )

    .delete()

    .eq(
      "id",
      id
    );

  cargarGastos();

}

const hoy = new Date();

const lunesSemana =

  new Date(
    hoy
  );

const diaActual =

  hoy.getDay();

const diasDesdeLunes =

  diaActual === 0

    ? 6

    : diaActual - 1;

lunesSemana.setDate(

  hoy.getDate() -

  diasDesdeLunes

);

lunesSemana.setHours(
  0,
  0,
  0,
  0
);

const domingoSemana =

  new Date(
    lunesSemana
  );

domingoSemana.setDate(

  lunesSemana.getDate() +

  6

);

const inicioSemana =
  new Date(hoy);

inicioSemana.setDate(
  hoy.getDate() -
  hoy.getDay()
);

inicioSemana.setHours(
  0,
  0,
  0,
  0
);

const tratamientosFiltrados =

  tratamientos.filter(
    (item: any) => {

      if (
        periodo ===
        "historico"
      ) {

        return true;

      }

      const fecha =
        new Date(
          item.fecha
        );

      if (
        periodo ===
        "semana"
      ) {

        return (
          fecha >=
          inicioSemana
        );

      }

      return true;

    }
  );

const gastosFiltrados =

  gastos.filter(
    (gasto: any) => {

      if (
        periodo ===
        "historico"
      ) {

        return true;

      }

      const fecha =
        new Date(
          gasto.fecha
        );

      if (
        periodo ===
        "semana"
      ) {

        return (
          fecha >=
          inicioSemana
        );

      }

      return true;

    }
  );

const ingresos =

  tratamientosFiltrados.reduce(

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

  tratamientosFiltrados.reduce(

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

  gastosFiltrados.reduce(

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

  const gastosPorCategoria =

  gastosFiltrados.reduce(

    (
      acumulado: any,
      gasto: any
    ) => {

      const categoria =

        gasto.categoria ||

        "Sin categoría";

      acumulado[
        categoria
      ] =

        (
          acumulado[
            categoria
          ] || 0
        ) +

        Number(
          gasto.monto || 0
        );

      return acumulado;

    },

    {}

  );

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

      <div
  className="
    mb-6
  "
>

  <select

    value={periodo}

    onChange={(e) =>
      setPeriodo(
        e.target.value
      )
    }

    className="
      border
      rounded-xl
      px-4
      py-2
      bg-white
    "
  >

    <option value="semana">

      Semana

    </option>

    <option value="mes">

      Mes

    </option>

    <option value="anio">

      Año

    </option>

    <option value="historico">

      Histórico

    </option>

  </select>

</div>

<div
  className="
    mb-6
    text-slate-600
  "
>

  {

    periodo ===
    "semana"

    &&

    <>

      Semana Actual

      <br />

      {

        lunesSemana.toLocaleDateString()

      }

      {" - "}

      {

        domingoSemana.toLocaleDateString()

      }

    </>

  }

  {

    periodo ===
    "historico"

    &&

    <>Todos los registros</>

  }

</div>

<div
  className="
    bg-white
    rounded-3xl
    shadow-lg
    p-6
    mb-8
  "
>

  <h2
    className="
      text-xl
      font-bold
      mb-4
    "
  >

    Corte Semanal

  </h2>

  <div
    className="
      grid
      md:grid-cols-2
      gap-4
    "
  >

    <div>

      Ingresos Totales

    </div>

    <div
      className="
        font-semibold
      "
    >

      $

      {ingresos.toLocaleString()}

    </div>

    <div>

      Cobrado

    </div>

    <div
      className="
        font-semibold
      "
    >

      $

      {cobrado.toLocaleString()}

    </div>

    <div>

      Pendiente

    </div>

    <div
      className="
        font-semibold
      "
    >

      $

      {pendiente.toLocaleString()}

    </div>

    <div>

      Gastos

    </div>

    <div
      className="
        font-semibold
        text-red-600
      "
    >

      $

      {totalGastos.toLocaleString()}

    </div>

    <div>

      Ganancia Neta

    </div>

    <div
      className="
        font-bold
        text-green-600
      "
    >

      $

      {gananciaNeta.toLocaleString()}

    </div>

  </div>

</div>

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

      <div
  className="
    grid
    md:grid-cols-2
    gap-4
    mt-6
    mb-6
  "
>

  <input
    type="date"
    value={fechaGasto}
    onChange={(e) =>
      setFechaGasto(
        e.target.value
      )
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

  <input
    type="text"
    placeholder="Concepto"
    value={conceptoGasto}
    onChange={(e) =>
      setConceptoGasto(
        e.target.value
      )
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

 <select

  value={categoriaGasto}

  onChange={(e) =>
    setCategoriaGasto(
      e.target.value
    )
  }

  className="
    border
    rounded-lg
    p-3
  "
>

  <option value="">

    Seleccionar categoría

  </option>

  <option value="Material Dental">

    Material Dental

  </option>

  <option value="Limpieza">

    Limpieza

  </option>

  <option value="Laboratorio">

    Laboratorio

  </option>

  <option value="Especialistas">

    Especialistas

  </option>

  <option value="Nómina">

    Nómina

  </option>

  <option value="Servicios">

    Servicios

  </option>

  <option value="Marketing">

    Marketing

  </option>

  <option value="Otros">

    Otros

  </option>

</select>

  <input
    type="number"
    placeholder="Monto"
    value={montoGasto}
    onChange={(e) =>
      setMontoGasto(
        e.target.value
      )
    }
    className="
      border
      rounded-xl
      p-3
    "
  />

  <textarea
    placeholder="Notas"
    value={notasGasto}
    onChange={(e) =>
      setNotasGasto(
        e.target.value
      )
    }
    className="
      border
      rounded-xl
      p-3
      md:col-span-2
    "
  />

  <button
    onClick={
      guardarGasto
    }
    className="
      bg-teal-600
      text-white
      px-4
      py-3
      rounded-xl
      md:col-span-2
    "
  >

    Guardar gasto

  </button>

</div>

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

        <th className="p-3 text-left">

  Acciones

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

              <td className="p-3">

  <button

    onClick={() =>
      eliminarGasto(
        gasto.id
      )
    }

    className="
      bg-red-600
      text-white
      px-3
      py-1
      rounded-lg
    "
  >

    Eliminar

  </button>

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

    TOTAL GASTOS

  </td>

  <td className="p-3">

    $

    {totalGastos.toLocaleString()}

  </td>

  <td className="p-3">

  </td>

</tr>

    </tbody>

  </table>

</div>

<div
  className="
    bg-slate-50
    rounded-2xl
    p-6
    mt-6
  "
>

  <h3
    className="
      text-xl
      font-bold
      mb-4
    "
  >

    Resumen por Categoría

  </h3>

  {

    Object.entries(
      gastosPorCategoria
    ).map(

      (
        [
          categoria,
          total,
        ]: any
      ) => (

        <div
          key={categoria}
          className="
            flex
            justify-between
            py-2
            border-b
            border-slate-200
          "
        >

          <span>

            {categoria}

          </span>

          <span
            className="
              font-semibold
            "
          >

            $

            {Number(
              total
            ).toLocaleString()}

          </span>

        </div>

      )

    )

  }

</div>

  </div>

)}

{seccionActiva === "doctores" && (

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

      Doctores

    </h2>

    <div
      className="
        grid
        md:grid-cols-3
        gap-4
        mb-6
      "
    >

      <input
        type="text"
        placeholder="Nombre"
        value={nombreDoctor}
        onChange={(e) =>
          setNombreDoctor(
            e.target.value
          )
        }
        className="
          border
          rounded-xl
          p-3
        "
      />

      <input
        type="text"
        placeholder="Especialidad"
        value={especialidadDoctor}
        onChange={(e) =>
          setEspecialidadDoctor(
            e.target.value
          )
        }
        className="
          border
          rounded-xl
          p-3
        "
      />

      <input
        type="number"
        placeholder="% Comisión"
        value={porcentajeDoctor}
        onChange={(e) =>
          setPorcentajeDoctor(
            e.target.value
          )
        }
        className="
          border
          rounded-xl
          p-3
        "
      />

    </div>

    <button
      onClick={
        guardarDoctor
      }
      className="
        bg-teal-600
        text-white
        px-4
        py-3
        rounded-xl
        mb-6
      "
    >

      Guardar Doctor

    </button>

    <table
      className="
        w-full
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

            Nombre

          </th>

          <th className="p-3 text-left">

            Especialidad

          </th>

          <th className="p-3 text-left">

            %

          </th>

        </tr>

      </thead>

      <tbody>

        {

          doctores.map(
            (
              doctor: any
            ) => (

              <tr
                key={doctor.id}
                className="
                  border-b
                  border-slate-100
                "
              >

                <td className="p-3">

                  {doctor.nombre}

                </td>

                <td className="p-3">

                  {doctor.especialidad}

                </td>

                <td className="p-3">

                  {doctor.porcentaje}%

                </td>

              </tr>

            )
          )

        }

      </tbody>

    </table>

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