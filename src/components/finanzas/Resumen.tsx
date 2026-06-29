type ResumenProps = {

  ingresos: number;

  cobrado: number;

  pendiente: number;

  gananciaNeta: number;

  tratamientos: any[];

  totalGastos: number;

  totalBaseClinica: number;

  totalComisionesDoctor: number;

  cajaMXN: number;

  cajaUSD: number;

  totalTarjeta: number;

  totalTransferencia: number;

  pacientes: any[];

  tratamientosFiltrados: any[];

};

export default function Resumen({

  ingresos,

  cobrado,

  pendiente,

  gananciaNeta,

  tratamientos,

  totalGastos,

  totalBaseClinica,

  totalComisionesDoctor,

  cajaMXN,

  cajaUSD,

  totalTarjeta,

  totalTransferencia,

  pacientes,

  // tratamientosFiltrados,
  

}: ResumenProps) {

return (

<>

<>

<h2
  className="
    text-xl
    font-bold
    mb-4
  "
>

  Resumen Financiero

</h2>

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



<div
  className="
    md:col-span-4
    mt-2
    mb-2
  "
>

  <h2
    className="
      text-xl
      font-bold
      text-slate-700
    "
  >

    Indicadores Operativos

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

    Base Clínica

  </p>

  <h2
    className="
      text-3xl
      font-bold
      mt-2
      text-blue-600
    "
  >

    $

    {totalBaseClinica.toLocaleString()}

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

    Comisiones Doctores

  </p>

  <h2
    className="
      text-3xl
      font-bold
      mt-2
      text-orange-600
    "
  >

    $

    {totalComisionesDoctor.toLocaleString()}

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

<div
  className="
    bg-slate-50
    rounded-2xl
    p-6
    mb-6
  "
>

  <h3
    className="
      text-xl
      font-bold
      mb-4
    "
  >

    Corte de Caja

  </h3>

  <div
    className="
      grid
      md:grid-cols-2
      gap-4
    "
  >

    <div>

      <p className="text-slate-500">

        Caja MXN

      </p>

      <p
        className="
          text-2xl
          font-bold
          text-green-600
        "
      >

        $

        {cajaMXN.toLocaleString()}

      </p>

    </div>

    <div>

      <p className="text-slate-500">

        Caja USD

      </p>

      <p
        className="
          text-2xl
          font-bold
          text-blue-600
        "
      >

        $

        {cajaUSD.toLocaleString()}

      </p>

    </div>

    <div>

      <p className="text-slate-500">

        Tarjetas

      </p>

      <p
        className="
          text-2xl
          font-bold
        "
      >

        $

        {totalTarjeta.toLocaleString()}

      </p>

    </div>

    <div>

      <p className="text-slate-500">

        Transferencias

      </p>

      <p
        className="
          text-2xl
          font-bold
        "
      >

        $

        {totalTransferencia.toLocaleString()}

      </p>

    </div>

  </div>

</div>

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

      (p: any) =>

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

</>

</>

);

}