import Gastos from "../components/finanzas/Gastos";

import Resumen from "../components/finanzas/Resumen";

import Doctores from "../components/finanzas/Doctores";

import Comisiones from "../components/finanzas/Comisiones";

import { finanzasService } from "../services/finanzas.service";

 

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

const [
  _doctorDetalle,
  setDoctorDetalle,
] = useState<any>(
  null
);

const [
  _mostrarDetalleDoctor,
  setMostrarDetalleDoctor,
] = useState(
  false
);

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

  const tratamientosDB =
    await finanzasService.cargarTratamientos();

  setTratamientos(
    tratamientosDB
  );

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

  const doctoresDB =
    await finanzasService.cargarDoctores();

  setDoctores(
    doctoresDB
  );

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

    fecha >= lunesSemana &&

    fecha <= domingoSemana

  );

}

if (
  periodo ===
  "mes"
) {

  return (

    fecha.getMonth() ===
      hoy.getMonth()

    &&

    fecha.getFullYear() ===
      hoy.getFullYear()

  );

}

if (
  periodo ===
  "anio"
) {

  return (

    fecha.getFullYear() ===
    hoy.getFullYear()

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

    fecha >= lunesSemana &&

    fecha <= domingoSemana

  );

}

if (
  periodo ===
  "mes"
) {

  return (

    fecha.getMonth() ===
      hoy.getMonth()

    &&

    fecha.getFullYear() ===
      hoy.getFullYear()

  );

}

if (
  periodo ===
  "anio"
) {

  return (

    fecha.getFullYear() ===
    hoy.getFullYear()

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

  const totalBaseClinica =

  tratamientosFiltrados.reduce(

    (
      total,
      item: any
    ) =>

      total +

      (

        Number(
          item.pago || 0
        )

        -

        Number(
          item.laboratorio || 0
        )

        -

        Number(
          item.especialista || 0
        )

        -

        Number(
          item.comision_banco || 0
        )

      ),

    0

  );

const totalComisionesDoctor =

  tratamientosFiltrados.reduce(

    (
      total,
      item: any
    ) => {

      const doctor =

        doctores.find(
          (d: any) =>
            d.id ===
            item.doctor_id
        );

      const porcentaje =

        Number(
          doctor?.porcentaje || 0
        );

      const baseClinica =

        Number(
          item.pago || 0
        )

        -

        Number(
          item.laboratorio || 0
        )

        -

        Number(
          item.especialista || 0
        )

        -

        Number(
          item.comision_banco || 0
        );

      return (

        total +

        (

          baseClinica *

          porcentaje /

          100

        )

      );

    },

    0

  );

const gananciaNeta =

  totalBaseClinica

  -

  totalComisionesDoctor

  -

  totalGastos;

 

  const totalTarjeta =

  tratamientosFiltrados

    .filter(
      (t: any) =>
        t.metodo_pago ===
        "Tarjeta"
    )

    .reduce(

      (
        total,
        t: any
      ) =>

        total +

        Number(
          t.pago || 0
        ),

      0

    );

const totalTransferencia =

  tratamientosFiltrados

    .filter(
      (t: any) =>
        t.metodo_pago ===
        "Transferencia"
    )

  .reduce(

      (
        total,
        t: any
      ) =>

        total +

        Number(
          t.pago || 0
        ),

      0

    );

    const cajaMXN =

  tratamientosFiltrados

    .filter(
      (t: any) =>

        t.moneda === "MXN" &&

        t.metodo_pago === "Efectivo"
    )

    .reduce(

      (
        total,
        t: any
      ) =>

        total +

        Number(
          t.pago || 0
        ),

      0

    );

const cajaUSD =

  tratamientosFiltrados

    .filter(
      (t: any) =>

        t.moneda === "USD" &&

        t.metodo_pago === "Efectivo"
    )

    .reduce(

      (
        total,
        t: any
      ) =>

        total +

        Number(
          t.pago || 0
        ),

      0

    );

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



      {seccionActiva === "gastos" && false && (

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

      <div>

  <h2
    className="
      text-2xl
      font-bold
    "
  >

    Gastos

  </h2>

  <p
    className="
      text-slate-500
      mt-1
    "
  >

    Control y administración de gastos operativos

  </p>

</div>

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

<div
  className="
    grid
    md:grid-cols-2
    gap-4
    mb-6
  "
>

  <div
    className="
      bg-slate-50
      rounded-2xl
      p-4
    "
  >

    <p className="text-slate-500">

      Total Gastos

    </p>

    <h3
      className="
        text-2xl
        font-bold
        text-red-600
      "
    >

      $

      {totalGastos.toLocaleString()}

    </h3>

  </div>

  <div
    className="
      bg-slate-50
      rounded-2xl
      p-4
    "
  >

    <p className="text-slate-500">

      Cantidad de Gastos

    </p>

    <h3
      className="
        text-2xl
        font-bold
      "
    >

      {gastosFiltrados.length}

    </h3>

  </div>

</div>

<div>


</div>

</div>

)}

{seccionActiva === "gastos" && (

<Gastos

  total={totalGastos}

  cantidad={gastosFiltrados.length}

  fechaGasto={fechaGasto}
  setFechaGasto={setFechaGasto}

  conceptoGasto={conceptoGasto}
  setConceptoGasto={setConceptoGasto}

  categoriaGasto={categoriaGasto}
  setCategoriaGasto={setCategoriaGasto}

  montoGasto={montoGasto}
  setMontoGasto={setMontoGasto}

  notasGasto={notasGasto}
  setNotasGasto={setNotasGasto}

  guardarGasto={guardarGasto}

  gastosFiltrados={gastosFiltrados}

eliminarGasto={eliminarGasto}

gastosPorCategoria={gastosPorCategoria}

/>

)}

{seccionActiva === "doctores" && (

<Doctores

  doctores={doctores}

  nombreDoctor={nombreDoctor}
  setNombreDoctor={setNombreDoctor}

  especialidadDoctor={especialidadDoctor}
  setEspecialidadDoctor={setEspecialidadDoctor}

  porcentajeDoctor={porcentajeDoctor}
  setPorcentajeDoctor={setPorcentajeDoctor}

  guardarDoctor={guardarDoctor}

/>

)}
{seccionActiva === "comisiones" && (

  <Comisiones

    doctores={doctores}

    tratamientos={tratamientos}

    setDoctorDetalle={setDoctorDetalle}

    setMostrarDetalleDoctor={setMostrarDetalleDoctor}

  />

)}

{_doctorDetalle && (

  <div
    className="
      bg-white
      rounded-3xl
      shadow-lg
      p-6
      mt-6
    "
  >


<div
  className="
    flex
    justify-between
    items-center
    mb-4
  "
>

  <h3
    className="
      text-xl
      font-bold
    "
  >

    Detalle de {_doctorDetalle.nombre}

  </h3>

  <button

    onClick={() => {

      setDoctorDetalle(
        null
      );

    }}

    className="
      bg-red-500
      hover:bg-red-600
      text-white
      px-4
      py-2
      rounded-lg
    "

  >

    Cerrar

  </button>

</div>

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
  Paciente
</th>

    <th className="p-3 text-left">
      Tratamiento
    </th>

    <th className="p-3 text-left">
      Pagado
    </th>

    <th className="p-3 text-left">
      Base Clínica
    </th>

    <th className="p-3 text-left">
      Comisión
    </th>

  </tr>

</thead>

<tbody>

  {

    tratamientos

      .filter(
        (t: any) =>
          t.doctor_id ===
          _doctorDetalle.id
      )

      .map(
        (t: any) => {

          const baseClinica =

            Number(
              t.pago || 0
            )

            -

            Number(
              t.laboratorio || 0
            )

            -

            Number(
              t.especialista || 0
            )

            -

            Number(
              t.comision_banco || 0
            );

          const comision =

            baseClinica *

            Number(
              _doctorDetalle.porcentaje || 0
            ) /

            100;

          return (

            <tr
              key={t.id}
              className="
                border-b
                border-slate-100
              "
            >

              <td className="p-3">

                {t.fecha}

              </td>

              <td className="p-3">

  {

    pacientes.find(
      (p: any) =>
        p.id ===
        t.paciente_id
    )?.nombre ||

    "-"

  }

</td>

              <td className="p-3">

                {t.tratamiento}

              </td>

              <td className="p-3">

                $

                {Number(
                  t.pago || 0
                ).toLocaleString()}

              </td>

              <td className="p-3">

                $

                {baseClinica.toLocaleString()}

              </td>

              <td
                className="
                  p-3
                  font-bold
                  text-green-600
                "
              >

                $

                {comision.toLocaleString()}

              </td>

            </tr>

          );

        }

      )

  }

</tbody>

  </table>

</div>

<div
  className="
    grid
    md:grid-cols-4
    gap-4
    mt-6
  "
>
  

  <div
    className="
      bg-slate-50
      rounded-xl
      p-4
    "
  >

    <p className="text-slate-500">
      Tratamientos
    </p>

    <h3 className="text-2xl font-bold">

      {

        tratamientos.filter(
          (t: any) =>
            t.doctor_id ===
            _doctorDetalle.id
        ).length

      }

    </h3>

  </div>

</div>

  </div>

)}


{seccionActiva === "resumen" && (

<Resumen

  ingresos={ingresos}
  cobrado={cobrado}
  pendiente={pendiente}
  gananciaNeta={gananciaNeta}
  tratamientos={tratamientos}
  totalGastos={totalGastos}
  totalBaseClinica={totalBaseClinica}
  totalComisionesDoctor={totalComisionesDoctor}
  cajaMXN={cajaMXN}
  cajaUSD={cajaUSD}
  totalTarjeta={totalTarjeta}
  totalTransferencia={totalTransferencia}
  pacientes={pacientes}
  tratamientosFiltrados={tratamientosFiltrados}

/>

)}


</div>

</div>

);

}