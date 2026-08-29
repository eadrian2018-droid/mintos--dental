import {
  useState,
} from "react";

import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

type DoctoresProps = {

  doctores: Doctor[];

  nombreDoctor: string;

  setNombreDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  especialidadDoctor: string;

  setEspecialidadDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  porcentajeDoctor: string;

  setPorcentajeDoctor:
    Dispatch<
      SetStateAction<string>
    >;

  guardarDoctor:
    () => void;

  actualizarDoctor:
    (
      id: number,
      nombre: string,
      especialidad: string,
      porcentaje: number
    ) => Promise<void>;

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

};

export default function Doctores({

  doctores,

  nombreDoctor,
  setNombreDoctor,

  especialidadDoctor,
  setEspecialidadDoctor,

  porcentajeDoctor,
  setPorcentajeDoctor,

  guardarDoctor,

  actualizarDoctor,

  setDoctorDetalle,

}: DoctoresProps) {

  const [
    doctorEditando,
    setDoctorEditando,
  ] = useState<Doctor | null>(
    null
  );

  function iniciarEdicion(
    doctor: Doctor
  ) {

    setDoctorEditando(
      doctor
    );

    setNombreDoctor(
      doctor.nombre
    );

    setEspecialidadDoctor(
      doctor.especialidad
    );

    setPorcentajeDoctor(
      String(
        doctor.porcentaje
      )
    );

  }

  function cancelarEdicion() {

    setDoctorEditando(
      null
    );

    setNombreDoctor("");

    setEspecialidadDoctor("");

    setPorcentajeDoctor(
      "30"
    );

  }

  async function guardarCambios() {

    if (
      !doctorEditando
    ) {

      return;

    }

    await actualizarDoctor(

      doctorEditando.id,

      nombreDoctor,

      especialidadDoctor,

      Number(
        porcentajeDoctor
      )

    );

    setDoctorEditando(
      null
    );

    setNombreDoctor("");

    setEspecialidadDoctor("");

    setPorcentajeDoctor(
      "30"
    );

  }

  return (

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

            Doctores

          </h2>

          {
            doctorEditando

            &&

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
              "
            >

              Editando:
              {" "}
              {doctorEditando.nombre}

            </p>
          }

        </div>

      </div>

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
            mint-input
            w-full
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
            mint-input
            w-full
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
            mint-input
            w-full
            p-3
          "
        />

      </div>

      <div
        className="
          flex
          flex-wrap
          gap-3
          mb-6
        "
      >

        {
          doctorEditando

          ? (

            <button
              onClick={
                guardarCambios
              }
              className="
                mint-btn
                mint-btn-primary
                mint-btn-md
              "
            >

              Actualizar Doctor

            </button>

          )

          : (

            <button
              onClick={
                guardarDoctor
              }
              className="
                mint-btn
                mint-btn-primary
                mint-btn-md
              "
            >

              Guardar Doctor

            </button>

          )
        }

        {
          doctorEditando

          &&

          <button
            onClick={
              cancelarEdicion
            }
            className="
              mint-btn
              mint-btn-neutral
              mint-btn-md
            "
          >

            Cancelar

          </button>
        }

      </div>

      <div
        className="
          mt-8
          overflow-x-auto
        "
      >

        <table
          className="
            mint-table
            w-full
            text-sm
          "
        >

          <thead
            className="
              mint-table-head
            "
          >

            <tr>

              <th className="p-3 text-left">

                Nombre

              </th>

              <th className="p-3 text-left">

                Especialidad

              </th>

              <th className="p-3 text-left">

                Comisión

              </th>

              <th className="p-3 text-left">

                Acciones

              </th>

            </tr>

          </thead>

          <tbody>

            {

              doctores.map(
                (doctor) => (

                  <tr
                    key={doctor.id}
                    className="
                      mint-table-row
                    "
                  >

                    <td
                      className="
                        p-3
                        font-semibold
                        mint-text-primary
                      "
                    >

                      {doctor.nombre}

                    </td>

                    <td
                      className="
                        p-3
                        mint-text-secondary
                      "
                    >

                      {doctor.especialidad}

                    </td>

                    <td className="p-3">

                      <span
                        className="
                          mint-badge
                          mint-badge-accent
                        "
                      >

                        {doctor.porcentaje}%

                      </span>

                    </td>

                    <td className="p-3">

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-2
                        "
                      >

                        <button
                          onClick={() =>
                            iniciarEdicion(
                              doctor
                            )
                          }
                          className="
                            mint-btn
                            mint-btn-neutral
                            mint-btn-sm
                          "
                        >

                          Editar

                        </button>

                        <button
                          onClick={() =>
                            setDoctorDetalle(
                              doctor
                            )
                          }
                          className="
                            mint-btn
                            mint-btn-action
                            mint-btn-sm
                          "
                        >

                          Ver detalle

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}