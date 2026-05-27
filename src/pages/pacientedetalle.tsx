import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

export default function PacienteDetalle() {

  const { id } =
    useParams();

  const [paciente,
    setPaciente] =
    useState<any>(null);

  const [tratamientos,
    setTratamientos] =
    useState<any[]>([]);

  const [tratamiento,
    setTratamiento] =
    useState("");

  const [total,
    setTotal] =
    useState("");

  const [pago,
    setPago] =
    useState("");

  useEffect(() => {

    cargarPaciente();

    cargarTratamientos();

  }, []);

  async function cargarPaciente() {

    const { data } =

      await supabase

        .from("pacientes")

        .select("*")

        .eq(
          "id",
          id
        )

        .single();

    setPaciente(data);

  }

  async function cargarTratamientos() {

    const { data } =

      await supabase

        .from("tratamientos")

        .select("*")

        .eq(
          "paciente_id",
          id
        )

        .order(
          "fecha",
          {
            ascending: false,
          }
        );

    setTratamientos(
      data || []
    );

  }

  async function agregarTratamiento() {

    const totalNumero =
      Number(total);

    const pagoNumero =
      Number(pago);

    const resta =
      totalNumero - pagoNumero;

    await supabase

      .from("tratamientos")

      .insert([

        {

          paciente_id:
            id,

          tratamiento,

          total:
            totalNumero,

          pago:
            pagoNumero,

          resta,

          pendiente:
            resta > 0,

        },

      ]);

    setTratamiento("");

    setTotal("");

    setPago("");

    cargarTratamientos();

  }

  const totalGeneral =

    tratamientos.reduce(

      (acc, t)=>

        acc + Number(t.total),

      0

    );

  const totalPagado =

    tratamientos.reduce(

      (acc, t)=>

        acc + Number(t.pago),

      0

    );

  const pendienteTotal =

    tratamientos.reduce(

      (acc, t)=>

        acc + Number(t.resta),

      0

    );

  if (!paciente) {

    return (

      <div className="
        text-2xl
        font-bold
      ">
        Cargando...
      </div>

    );

  }

  return (

    <div className="
      space-y-8
    ">

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <h1 className="
          text-5xl
          font-bold
          text-gray-800
        ">
          {paciente.nombre}
        </h1>

        <div className="
          grid
          grid-cols-2
          gap-6
          mt-6
          text-lg
        ">

          <div>

            <span className="
              font-bold
            ">
              Teléfono:
            </span>

            {" "}

            {paciente.telefono}

          </div>

          <div>

            <span className="
              font-bold
            ">
              Email:
            </span>

            {" "}

            {paciente.email}

          </div>

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-8
        ">

          <h2 className="
            text-4xl
            font-bold
          ">
            Tratamientos
          </h2>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
          mb-8
        ">

          <input

            value={tratamiento}

            onChange={(e)=>
              setTratamiento(
                e.target.value
              )
            }

            placeholder="
Tratamiento
            "

            className="
              border
              rounded-xl
              p-4
            "

          />

          <input

            value={total}

            onChange={(e)=>
              setTotal(
                e.target.value
              )
            }

            placeholder="
Total
            "

            type="number"

            className="
              border
              rounded-xl
              p-4
            "

          />

          <input

            value={pago}

            onChange={(e)=>
              setPago(
                e.target.value
              )
            }

            placeholder="
Pago
            "

            type="number"

            className="
              border
              rounded-xl
              p-4
            "

          />

          <button

            onClick={
              agregarTratamiento
            }

            className="
              bg-teal-600
              hover:bg-teal-700
              text-white
              rounded-xl
              font-bold
              p-4
            "
          >
            Agregar
          </button>

        </div>

        <div className="
          overflow-auto
        ">

          <table className="
            w-full
            border-collapse
          ">

            <thead>

              <tr className="
                bg-gray-100
              ">

                <th className="
                  p-4
                  text-left
                ">
                  Fecha
                </th>

                <th className="
                  p-4
                  text-left
                ">
                  Tratamiento
                </th>

                <th className="
                  p-4
                  text-left
                ">
                  Total
                </th>

                <th className="
                  p-4
                  text-left
                ">
                  Pago
                </th>

                <th className="
                  p-4
                  text-left
                ">
                  Resta
                </th>

                <th className="
                  p-4
                  text-left
                ">
                  Pendiente
                </th>

              </tr>

            </thead>

            <tbody>

              {

                tratamientos.map((t)=>(

                  <tr

                    key={t.id}

                    className="
                      border-b
                    "
                  >

                    <td className="
                      p-4
                    ">

                      {

                        new Date(
                          t.fecha
                        ).toLocaleDateString()

                      }

                    </td>

                    <td className="
                      p-4
                    ">
                      {t.tratamiento}
                    </td>

                    <td className="
                      p-4
                    ">
                      ${t.total}
                    </td>

                    <td className="
                      p-4
                    ">
                      ${t.pago}
                    </td>

                    <td className="
                      p-4
                    ">
                      ${t.resta}
                    </td>

                    <td className="
                      p-4
                      font-bold
                    ">

                      {

                        t.pendiente

                        ? (

                          <span className="
                            text-red-600
                          ">
                            Sí
                          </span>

                        )

                        : (

                          <span className="
                            text-green-600
                          ">
                            No
                          </span>

                        )

                      }

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

        <div className="
          flex
          flex-wrap
          gap-8
          mt-8
          text-xl
          font-bold
        ">

          <div>
            Total:
            {" "}
            ${totalGeneral}
          </div>

          <div>
            Pagado:
            {" "}
            ${totalPagado}
          </div>

          <div className="
            text-red-600
          ">
            Pendiente:
            {" "}
            ${pendienteTotal}
          </div>

        </div>

      </div>

    </div>

  );

}