import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

export default function Dashboard() {

  const [totalPacientes,
    setTotalPacientes] =
    useState(0);

  const [totalCitas,
    setTotalCitas] =
    useState(0);

  const [citasHoy,
    setCitasHoy] =
    useState<any[]>([]);

  useEffect(() => {

    cargarDashboard();

  }, []);

  async function cargarDashboard() {

    const { count: pacientes } =

      await supabase

        .from("pacientes")

        .select("*",
          {
            count: "exact",
            head: true,
          }
        );

    setTotalPacientes(
      pacientes || 0
    );

    const { count: citas } =

      await supabase

        .from("citas")

        .select("*",
          {
            count: "exact",
            head: true,
          }
        );

    setTotalCitas(
      citas || 0
    );

    const hoy =

      new Date()
        .toISOString()
        .split("T")[0];

    const { data } =

      await supabase

        .from("citas")

        .select("*")

        .gte(
          "inicio",
          `${hoy}T00:00:00`
        )

        .lte(
          "inicio",
          `${hoy}T23:59:59`
        )

        .order(
          "inicio",
          {
            ascending: true,
          }
        );

    setCitasHoy(
      data || []
    );

  }

  return (

    <div className="
      space-y-8
    ">

      <div>

        <h1 className="
          text-5xl
          font-bold
          text-gray-800
        ">
          Dashboard
        </h1>

        <p className="
          text-gray-500
          mt-2
          text-lg
        ">
          Resumen general del consultorio
        </p>

      </div>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-6
      ">

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <p className="
            text-gray-500
            text-lg
          ">
            Total Pacientes
          </p>

          <h2 className="
            text-5xl
            font-bold
            mt-4
            text-teal-600
          ">
            {totalPacientes}
          </h2>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <p className="
            text-gray-500
            text-lg
          ">
            Total Citas
          </p>

          <h2 className="
            text-5xl
            font-bold
            mt-4
            text-blue-600
          ">
            {totalCitas}
          </h2>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
        ">

          <p className="
            text-gray-500
            text-lg
          ">
            Citas Hoy
          </p>

          <h2 className="
            text-5xl
            font-bold
            mt-4
            text-orange-500
          ">
            {citasHoy.length}
          </h2>

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
          mb-6
        ">

          <h2 className="
            text-3xl
            font-bold
          ">
            Agenda de Hoy
          </h2>

        </div>

        <div className="
          space-y-4
        ">

          {

            citasHoy.length === 0 && (

              <div className="
                text-gray-500
                text-lg
              ">
                No hay citas hoy
              </div>

            )

          }

          {

            citasHoy.map((cita)=>(

              <div

                key={cita.id}

                className="
                  border
                  rounded-2xl
                  p-5
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h3 className="
                    text-xl
                    font-bold
                  ">
                    {cita.paciente}
                  </h3>

                  <p className="
                    text-gray-500
                    mt-1
                  ">
                    {cita.doctor}
                  </p>

                </div>

                <div className="
                  text-lg
                  font-semibold
                ">

                  {

                    new Date(
                      cita.inicio
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )

                  }

                </div>

              </div>

            ))

          }

        </div>

      </div>

    </div>

  );

}