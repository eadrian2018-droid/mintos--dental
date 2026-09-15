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

import { supabase }
  from "../../lib/supabase";

import { useAuth }
  from "../../context/AuthContext";

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

  const {
    perfil,
    permisos,
  } = useAuth();

  const esAdmin =
    perfil?.rol === "admin";

  const puedeConfigurarComisiones =
    esAdmin ||
    permisos?.configurar_comisiones === true;

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

    if (
      !puedeConfigurarComisiones
    ) {

      return;

    }

    if (esAdmin) {

      await actualizarDoctor(

        doctorEditando.id,

        nombreDoctor,

        especialidadDoctor,

        Number(
          porcentajeDoctor
        )

      );

    }
    else {

      const porcentaje =
        Number(
          porcentajeDoctor
        );

      if (
        !Number.isFinite(
          porcentaje
        ) ||
        porcentaje < 0 ||
        porcentaje > 100
      ) {

        alert(
          "Ingresa un porcentaje válido entre 0 y 100."
        );

        return;

      }

      const {
        error,
      } = await supabase.rpc(
        "actualizar_comision_doctor",
        {
          p_doctor_id:
            doctorEditando.id,
          p_porcentaje:
            porcentaje,
        }
      );

      if (error) {

        console.error(
          "Error actualizando comisión:",
          error
        );

        alert(
          "No se pudo actualizar la comisión."
        );

        return;

      }

      window.location.reload();

      return;

    }

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

              {
                esAdmin
                  ? "Editando:"
                  : "Editando comisión:"
              }
              {" "}
              {doctorEditando.nombre}

            </p>
          }

        </div>

      </div>

      {
        esAdmin

        &&

        <>

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

        </>

      }

      {
        !esAdmin &&
        puedeConfigurarComisiones &&
        doctorEditando

        &&

        <div
          className="
            mb-6
            p-4
            rounded-2xl
            border
            border-[var(--mint-border)]
            bg-[var(--mint-bg-soft)]
          "
        >

          <label
            className="
              block
              text-sm
              font-semibold
              mint-text-primary
              mb-2
            "
          >

            Porcentaje de comisión

          </label>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-3
              sm:items-end
            "
          >

            <div
              className="
                w-full
                sm:max-w-[220px]
              "
            >

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
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

              Guardar comisión

            </button>

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

          </div>

        </div>

      }

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

                        {
                          puedeConfigurarComisiones

                          &&

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

                            {
                              esAdmin
                                ? "Editar"
                                : "Editar comisión"
                            }

                          </button>
                        }

                        {
                          esAdmin

                          &&

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
                        }

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
