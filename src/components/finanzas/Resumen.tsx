import type { Paciente } from "../../types/Paciente";
import type { Tratamiento } from "../../types/Tratamiento";

type ResumenProps = {
  ingresos: number;

  cobrado: number;
  cobradoMXN: number;
  cobradoUSD: number;

  pendiente: number;
  gananciaNeta: number;
  gananciaNetaUSD: number;

  totalGastos: number;
  totalGastosUSD: number;


  totalBaseClinicaMXN: number;
  totalBaseClinicaUSD: number;

  totalComisionesDoctorMXN: number;
  totalComisionesDoctorUSD: number;

  cajaMXN: number;
  cajaUSD: number;

  totalTarjeta: number;

  totalTransferencia: number;
  totalTransferenciaUSD: number;

  pacientes: Paciente[];

  tratamientosFiltrados: Tratamiento[];
};

export default function Resumen({
  ingresos,

  cobrado,
  cobradoMXN,
  cobradoUSD,

  pendiente,
  gananciaNeta,
  gananciaNetaUSD,

  totalGastos,
  totalGastosUSD,

  totalBaseClinicaMXN,
  totalBaseClinicaUSD,

  totalComisionesDoctorMXN,
  totalComisionesDoctorUSD,

  cajaMXN,
  cajaUSD,

  totalTarjeta,

  totalTransferencia,
  totalTransferenciaUSD,

  pacientes,

  tratamientosFiltrados,
}: ResumenProps) {

  const formatoMoneda = (
    valor: number
  ) =>
    Number(
      valor || 0
    ).toLocaleString(
      "es-MX",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <>

      {/* INDICADORES PRINCIPALES */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
            mb-4
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                mint-text-muted
                mb-1
              "
            >
              Rendimiento
            </p>

            <h2
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Panorama financiero
            </h2>

          </div>

          <p
            className="
              hidden
              md:block
              text-xs
              mint-text-muted
            "
          >
            Resultados del período seleccionado
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
          "
        >

          {/* INGRESOS */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-primary)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  Ingresos
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Valor total generado
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  font-bold
                  text-sm
                "
              >
                $
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  mint-text-primary
                "
              >
                ${formatoMoneda(
                  ingresos
                )}
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                  font-semibold
                "
              >
                MXN
              </p>

            </div>

          </div>

          {/* COBRADO */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-success)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  Cobrado
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Pagos realmente recibidos
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-success-bg)]
                  text-[var(--mint-success)]
                  font-bold
                  text-sm
                "
              >
                ✓
              </div>

            </div>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-success)]
                  "
                >
                  ${formatoMoneda(
                    cobradoMXN
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  MXN
                </p>

              </div>

              <div
                className="
                  border-l
                  border-[var(--mint-border)]
                  pl-3
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-info)]
                  "
                >
                  ${formatoMoneda(
                    cobradoUSD
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  USD
                </p>

              </div>

            </div>

          </div>

          {/* PENDIENTE */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-danger)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  Pendiente
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Saldo por cobrar
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-danger-bg)]
                  text-[var(--mint-danger)]
                  font-bold
                  text-sm
                "
              >
                !
              </div>

            </div>

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[var(--mint-danger)]
                "
              >
                ${formatoMoneda(
                  pendiente
                )}
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                  font-semibold
                "
              >
                MXN
              </p>

            </div>

          </div>

          {/* GANANCIA NETA */}

          <div
            className="
              mint-card
              relative
              overflow-hidden
              p-5
              min-h-[170px]
              flex
              flex-col
              justify-between
            "
          >

            <div
              className="
                absolute
                top-0
                left-0
                right-0
                h-[3px]
                bg-[var(--mint-accent)]
              "
            />

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                  "
                >
                  Ganancia neta
                </p>

                <p
                  className="
                    text-xs
                    mint-text-secondary
                    mt-1
                  "
                >
                  Resultado estimado
                </p>

              </div>

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-[var(--mint-bg-soft)]
                  mint-text-accent
                  font-bold
                  text-sm
                "
              >
                ↗
              </div>

            </div>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    mint-text-primary
                  "
                >
                  ${formatoMoneda(
                    gananciaNeta
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  MXN
                </p>

              </div>

              <div
                className="
                  border-l
                  border-[var(--mint-border)]
                  pl-3
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-[var(--mint-info)]
                  "
                >
                  ${formatoMoneda(
                    gananciaNetaUSD
                  )}
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    mint-text-muted
                    mt-1
                  "
                >
                  USD
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

            {/* INDICADORES OPERATIVOS */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              mint-text-muted
              mb-1
            "
          >
            Operación
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Indicadores operativos
          </h2>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            {/* TRATAMIENTOS */}

            <div
              className="
                p-5
                border-b
                sm:border-r
                xl:border-b-0
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-2
                "
              >
                Tratamientos
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mint-text-primary
                "
              >
                {
                  tratamientosFiltrados
                    .length
                }
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                "
              >
                Registrados en el período
              </p>

            </div>

            {/* GASTOS */}

            <div
              className="
                p-5
                border-b
                xl:border-b-0
                xl:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                Gastos
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

                <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-danger)]
                    "
                  >
                    ${formatoMoneda(
                      totalGastos
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>

                <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalGastosUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                Egresos registrados
              </p>

            </div>

            {/* BASE CLÍNICA */}

            <div
              className="
                p-5
                border-b
                sm:border-b-0
                sm:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                Base clínica
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

                <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalBaseClinicaMXN
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>

                <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-accent)]
                    "
                  >
                    ${formatoMoneda(
                      totalBaseClinicaUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                Después de costos clínicos
              </p>

            </div>

            {/* COMISIONES */}

            <div
              className="
                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  mint-text-secondary
                  mb-3
                "
              >
                Comisiones doctores
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

                <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-[var(--mint-warning)]
                    "
                  >
                    ${formatoMoneda(
                      totalComisionesDoctorMXN
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>

                <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalComisionesDoctorUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                Comisiones de tratamientos finalizados
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* CORTE DE CAJA */}

      <section
        className="
          mb-8
        "
      >

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.14em]
              mint-text-muted
              mb-1
            "
          >
            Liquidez
          </p>

          <h2
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Corte de caja
          </h2>

        </div>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            {/* CAJA MXN */}

            <div
              className="
                p-5
                border-b
                md:border-r
                xl:border-b-0
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                Caja MXN
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-success)]
                "
              >
                ${formatoMoneda(
                  cajaMXN
                )}
              </p>

              <span
                className="
                  inline-flex
                  mt-3
                  px-2
                  py-1
                  rounded-md
                  bg-[var(--mint-success-bg)]
                  text-[var(--mint-success)]
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                "
              >
                Efectivo MXN
              </span>

            </div>

            {/* CAJA USD */}

            <div
              className="
                p-5
                border-b
                xl:border-b-0
                xl:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                Caja USD
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  text-[var(--mint-info)]
                "
              >
                ${formatoMoneda(
                  cajaUSD
                )}
              </p>

              <span
                className="
                  inline-flex
                  mt-3
                  px-2
                  py-1
                  rounded-md
                  bg-[var(--mint-info-bg)]
                  text-[var(--mint-info)]
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                "
              >
                Efectivo USD
              </span>

            </div>

            {/* TARJETAS */}

            <div
              className="
                p-5
                border-b
                md:border-b-0
                md:border-r
                border-[var(--mint-border)]
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-2
                "
              >
                Tarjetas
              </p>

              <p
                className="
                  text-2xl
                  font-bold
                  mint-text-primary
                "
              >
                ${formatoMoneda(
                  totalTarjeta
                )}
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.08em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN neto
              </p>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                Depósito después de comisión
              </p>

            </div>

            {/* TRANSFERENCIAS */}

            <div
              className="
                p-5
              "
            >

              <p
                className="
                  text-xs
                  mint-text-secondary
                  mb-3
                "
              >
                Transferencias
              </p>

              <div
                className="
                  flex
                  items-end
                  gap-4
                  flex-wrap
                "
              >

                <div>

                  <p
                    className="
                      text-2xl
                      font-bold
                      mint-text-primary
                    "
                  >
                    ${formatoMoneda(
                      totalTransferencia
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    MXN
                  </p>

                </div>

                <div
                  className="
                    border-l
                    border-[var(--mint-border)]
                    pl-4
                  "
                >

                  <p
                    className="
                      text-lg
                      font-bold
                      text-[var(--mint-info)]
                    "
                  >
                    ${formatoMoneda(
                      totalTransferenciaUSD
                    )}
                  </p>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.08em]
                      font-bold
                      mint-text-muted
                      mt-1
                    "
                  >
                    USD
                  </p>

                </div>

              </div>

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-2
                "
              >
                Transferencias recibidas
              </p>

            </div>

          </div>

        </div>

      </section>

            {/* MOVIMIENTOS */}

      <section>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-[var(--mint-border)]
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  mint-text-muted
                  mb-1
                "
              >
                Actividad
              </p>

              <h2
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                "
              >
                Movimientos
              </h2>

            </div>

            <div
              className="
                hidden
                md:flex
                items-center
                px-3
                py-1.5
                rounded-lg
                bg-[var(--mint-bg-soft)]
                border
                border-[var(--mint-border)]
                text-xs
                font-medium
                mint-text-secondary
              "
            >
              {
                tratamientosFiltrados
                  .length
              }{" "}
              registros
            </div>

          </div>

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

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                    "
                  >
                    Fecha
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                    "
                  >
                    Paciente
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                    "
                  >
                    Tratamiento
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    Total
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    Pagado
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-right
                    "
                  >
                    Pendiente
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  tratamientosFiltrados.map(
                    (item) => {

                      const paciente =
                        pacientes.find(
                          (p) =>
                            p.id ===
                            item.paciente_id
                        );

                      return (

                        <tr
                          key={item.id}
                          className="
                            mint-table-row
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              whitespace-nowrap
                              mint-text-secondary
                            "
                          >
                            {item.fecha}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              font-semibold
                              mint-text-primary
                            "
                          >
                            {
                              paciente?.nombre ||
                              "-"
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              mint-text-secondary
                            "
                          >
                            {
                              item.tratamiento
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              font-medium
                              mint-text-primary
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.total ||
                                  0
                                )
                              )
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              text-[var(--mint-success)]
                              font-semibold
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.pago ||
                                  0
                                )
                              )
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              text-[var(--mint-danger)]
                              font-semibold
                            "
                          >
                            $
                            {
                              formatoMoneda(
                                Number(
                                  item.resta ||
                                  0
                                )
                              )
                            }
                          </td>

                        </tr>

                      );

                    }
                  )
                }

                <tr
                  className="
                    bg-[var(--mint-bg-soft)]
                    font-bold
                    border-t-2
                    border-[var(--mint-border-strong)]
                    mint-text-primary
                  "
                >

                  <td
                    className="
                      px-5
                      py-4
                    "
                    colSpan={3}
                  >
                    TOTAL GENERAL
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        ingresos
                      )
                    }
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                      text-[var(--mint-success)]
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        cobrado
                      )
                    }
                  </td>

                  <td
                    className="
                      px-5
                      py-4
                      text-right
                      text-[var(--mint-danger)]
                    "
                  >
                    $
                    {
                      formatoMoneda(
                        pendiente
                      )
                    }
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </>
  );

}