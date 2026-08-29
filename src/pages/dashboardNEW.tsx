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

    <div
      className="
        space-y-8
      "
    >

      <div>

        <h1
          className="
            text-4xl
            font-bold
            mint-text-primary
          "
        >
          Dashboard
        </h1>

        <p
          className="
            mint-text-secondary
            mt-2
            text-base
          "
        >
          Resumen general del consultorio
        </p>

      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        "
      >

        <div
          className="
            mint-card-primary
            p-6
          "
        >

          <p
            className="
              mint-text-secondary
              text-sm
              font-medium
            "
          >
            Total Pacientes
          </p>

          <h2
            className="
              text-4xl
              font-bold
              mt-3
              text-[var(--mint-primary)]
            "
          >
            {totalPacientes}
          </h2>

        </div>

        <div
          className="
            mint-card-info
            p-6
          "
        >

          <p
            className="
              mint-text-secondary
              text-sm
              font-medium
            "
          >
            Total Citas
          </p>

          <h2
            className="
              text-4xl
              font-bold
              mt-3
              text-[var(--mint-info)]
            "
          >
            {totalCitas}
          </h2>

        </div>

        <div
          className="
            mint-card-warning
            p-6
          "
        >

          <p
            className="
              mint-text-secondary
              text-sm
              font-medium
            "
          >
            Citas Hoy
          </p>

          <h2
            className="
              text-4xl
              font-bold
              mt-3
              text-[var(--mint-warning)]
            "
          >
            {citasHoy.length}
          </h2>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-6
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-bold
                mint-text-primary
              "
            >
              Agenda de Hoy
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >
              Citas programadas para el día
            </p>

          </div>

        </div>

        <div
          className="
            space-y-3
          "
        >

          {

            citasHoy.length === 0 && (

              <div
                className="
                  mint-empty
                  py-8
                "
              >
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
                  border-[var(--mint-border)]
                  rounded-2xl
                  p-5
                  flex
                  items-center
                  justify-between
                  bg-[var(--mint-bg-card)]
                  hover:bg-[var(--mint-bg-soft)]
                  transition-colors
                "
              >

                <div>

                  <h3
                    className="
                      text-base
                      font-bold
                      mint-text-primary
                    "
                  >
                    {cita.paciente}
                  </h3>

                  <p
                    className="
                      text-sm
                      mint-text-secondary
                      mt-1
                    "
                  >
                    {cita.doctor}
                  </p>

                </div>

                <div
                  className="
                    text-sm
                    font-semibold
                    text-[var(--mint-primary)]
                    bg-[var(--mint-primary-soft)]
                    border
                    border-[var(--mint-border-primary)]
                    rounded-xl
                    px-3
                    py-2
                  "
                >

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