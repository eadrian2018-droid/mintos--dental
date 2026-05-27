import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

export default function PacienteDetalle() {

  const { id } = useParams();

  const [paciente,
    setPaciente] =
    useState<any>(null);

  useEffect(() => {

    cargarPaciente();

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

    if (data) {

      setPaciente(data);

    }

  }

  if (!paciente) {

    return (

      <div className="
        p-10
        text-2xl
      ">
        Cargando expediente...
      </div>

    );

  }

  return (

    <div className="
      p-10
      space-y-8
    ">

      <div>

        <h1 className="
          text-5xl
          font-bold
          text-gray-800
        ">
          {paciente.nombre}
        </h1>

        <p className="
          text-gray-500
          mt-2
          text-lg
        ">
          Expediente del paciente
        </p>

      </div>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-6
      ">

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-4
          ">
            Información General
          </h2>

          <div className="
            space-y-3
            text-lg
          ">

            <p>
              <strong>Nombre:</strong>{" "}
              {paciente.nombre}
            </p>

            <p>
              <strong>Teléfono:</strong>{" "}
              {paciente.telefono || "-"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {paciente.email || "-"}
            </p>

            <p>
              <strong>Alergias:</strong>{" "}
              {paciente.alergias || "-"}
            </p>

          </div>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-4
          ">
            Observaciones
          </h2>

          <div className="
            min-h-[200px]
            border
            rounded-2xl
            p-4
            text-gray-700
          ">

            {paciente.observaciones ||
              "Sin observaciones"}

          </div>

        </div>

      </div>

      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-6
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-6
        ">
          Próximamente
        </h2>

        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
        ">

          <div className="
            bg-gray-100
            rounded-2xl
            p-6
            text-center
            font-semibold
          ">
            Odontograma
          </div>

          <div className="
            bg-gray-100
            rounded-2xl
            p-6
            text-center
            font-semibold
          ">
            Radiografías
          </div>

          <div className="
            bg-gray-100
            rounded-2xl
            p-6
            text-center
            font-semibold
          ">
            Tratamientos
          </div>

          <div className="
            bg-gray-100
            rounded-2xl
            p-6
            text-center
            font-semibold
          ">
            Pagos
          </div>

        </div>

      </div>

    </div>

  );

}