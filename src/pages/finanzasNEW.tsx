import Gastos from "../components/finanzas/Gastos";

import Resumen from "../components/finanzas/Resumen";

import Doctores from "../components/finanzas/Doctores";

import Comisiones from "../components/finanzas/Comisiones";

import { finanzasService } from "../services/finanzas.service";

import DoctorDetalle from "../components/DoctorDetalle";

import usePeriodo from "../hooks/usePeriodo";

import useIndicadores from "../hooks/useIndicadores";

import useFinanzas from "../hooks/useFinanzas";
 

import {
  useEffect,
  useState,
} from "react";

export default function Finanzas() {

  const finanzas = useFinanzas();

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

const {

  tratamientos,

  pacientes,

  gastos,

  doctores,

  cargarTratamientos,
  cargarPacientes,
  cargarGastos,
  cargarDoctores,

} = finanzas;

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

  try {

    await finanzasService.guardarDoctor(

      nombreDoctor,

      especialidadDoctor,

      porcentajeDoctor

    );

    setNombreDoctor("");

    setEspecialidadDoctor("");

    setPorcentajeDoctor("30");

    cargarDoctores();

  }

  catch (error: any) {

    console.error(error);

    alert(error.message);

  }

}

async function guardarGasto() {

  try {

    await finanzasService.guardarGasto(

      fechaGasto,

      conceptoGasto,

      categoriaGasto,

      Number(
        montoGasto
      ),

      notasGasto

    );

    setFechaGasto("");

    setConceptoGasto("");

    setCategoriaGasto("");

    setMontoGasto("");

    setNotasGasto("");

    cargarGastos();

  }

  catch (error: any) {

    console.error(error);

    alert(error.message);

  }

}

async function eliminarGasto(
  id: number
) {

  const confirmar =
    window.confirm(
      "¿Eliminar este gasto?"
    );

  if (!confirmar) {

    return;

  }

  try {

    await finanzasService.eliminarGasto(
      id
    );

    cargarGastos();

  }

  catch (error: any) {

    console.error(error);

    alert(error.message);

  }

}

const {

  lunesSemana,

  domingoSemana,

  tratamientosFiltrados,

  gastosFiltrados,

} = usePeriodo({

  periodo,

  tratamientos,

  gastos,

});

const {

  ingresos,

  cobrado,

  pendiente,

  totalGastos,

  totalBaseClinica,

  totalComisionesDoctor,

  gananciaNeta,

  totalTarjeta,

  totalTransferencia,

  cajaMXN,

  cajaUSD,

  gastosPorCategoria,

} = useIndicadores({

  tratamientosFiltrados,

  gastosFiltrados,

  doctores,

});


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

  setDoctorDetalle={setDoctorDetalle}

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

  <DoctorDetalle

    doctor={_doctorDetalle}

    pacientes={pacientes}

    tratamientos={tratamientos}

    onClose={() => {

      setDoctorDetalle(
        null
      );

    }}

  />

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