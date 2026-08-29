import type {
  Dispatch,
  SetStateAction,
} from "react";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  Tratamiento,
} from "../../types/Tratamiento";

type ComisionesProps = {

  doctores: Doctor[];

  tratamientos: Tratamiento[];

  setDoctorDetalle:
    Dispatch<
      SetStateAction<
        Doctor | null
      >
    >;

  setMostrarDetalleDoctor:
    Dispatch<
      SetStateAction<boolean>
    >;

};

export default function Comisiones({

  doctores,

  tratamientos,

  setDoctorDetalle,

  setMostrarDetalleDoctor,

}: ComisionesProps) {

  return (

    <div
      className="
        mint-card
        p-6
        mb-6
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          mint-text-primary
          mb-6
        "
      >

        Comisiones por Doctor

      </h2>

      <div
        className="
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
                Doctor
              </th>

              <th className="p-3 text-left">
                %
              </th>

              <th className="p-3 text-left">
                Tratamientos
              </th>

              <th className="p-3 text-left">
                Base Clínica
              </th>

              <th className="p-3 text-left">
                Comisión
              </th>

              <th className="p-3 text-left">
                Detalle
              </th>

            </tr>

          </thead>

          <tbody>

            {

              doctores.map(
                (doctor) => {

                  const tratamientosDoctor =
                    tratamientos.filter(
                      (t) =>
                        t.doctor_id ===
                        doctor.id
                    );

                  const baseClinica =
                    tratamientosDoctor.reduce(
                      (
                        total,
                        t
                      ) =>

                        total +

                        (
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
                          )
                        ),

                      0
                    );

                  const comision =

                    baseClinica *

                    Number(
                      doctor.porcentaje || 0
                    ) /

                    100;

                  return (

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

                      <td
                        className="
                          p-3
                          mint-text-secondary
                        "
                      >

                        {tratamientosDoctor.length}

                      </td>

                      <td
                        className="
                          p-3
                          font-medium
                          text-[var(--mint-info)]
                        "
                      >

                        $

                        {baseClinica.toLocaleString()}

                      </td>

                      <td
                        className="
                          p-3
                          font-bold
                          text-[var(--mint-success)]
                        "
                      >

                        $

                        {comision.toLocaleString()}

                      </td>

                      <td className="p-3">

                        <button
                          onClick={() => {

                            setDoctorDetalle(
                              doctor
                            );

                            setMostrarDetalleDoctor(
                              true
                            );

                          }}
                          className="
                            mint-btn
                            mint-btn-action
                            mint-btn-sm
                          "
                        >

                          Ver Detalle

                        </button>

                      </td>

                    </tr>

                  );

                }
              )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}