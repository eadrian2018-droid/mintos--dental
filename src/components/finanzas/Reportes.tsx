import type {
  Tratamiento,
} from "../../types/Tratamiento";

type ReportesProps = {

  ingresos: number;

  cobradoMXN: number;
  cobradoUSD: number;

  pendiente: number;

  totalBaseClinicaMXN: number;
  totalBaseClinicaUSD: number;

  totalComisionesDoctorMXN: number;
  totalComisionesDoctorUSD: number;

  totalGastos: number;
  totalGastosUSD: number;

  gananciaNeta: number;
  gananciaNetaUSD: number;

  cajaMXN: number;
  cajaUSD: number;

  totalTarjeta: number;

  totalTransferencia: number;
  totalTransferenciaUSD: number;

  tratamientosFiltrados: Tratamiento[];

};

export default function Reportes({

  ingresos,

  cobradoMXN,
  cobradoUSD,

  pendiente,

  totalBaseClinicaMXN,
  totalBaseClinicaUSD,

  totalComisionesDoctorMXN,
  totalComisionesDoctorUSD,

  totalGastos,
  totalGastosUSD,

  gananciaNeta,
  gananciaNetaUSD,

  cajaMXN,
  cajaUSD,

  totalTarjeta,

  totalTransferencia,
  totalTransferenciaUSD,

  tratamientosFiltrados,

}: ReportesProps) {

  const formatoMonto =
    (
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

  const tratamientosFinalizados =
    tratamientosFiltrados.filter(
      (tratamiento) =>
        tratamiento.estado ===
        "Finalizado"
    ).length;

const tratamientosPendientes =
  tratamientosFiltrados.filter(
    (tratamiento) =>
      String(
        tratamiento.estado || ""
      ) !== "Finalizado"
      &&
      String(
        tratamiento.estado || ""
      ) !== "Cancelado"
  ).length;

const tratamientosCancelados =
  tratamientosFiltrados.filter(
    (tratamiento) =>
      String(
        tratamiento.estado || ""
      ) === "Cancelado"
  ).length;

  return (

    <div
      className="
        space-y-6
      "
    >

      {/* ENCABEZADO */}

      <section
        className="
          mint-card
          overflow-hidden
        "
      >

        <div
          className="
            px-6
            py-6
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-brand
              "
            >
              Finanzas
            </p>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                mint-text-primary
                mt-1
              "
            >
              Reporte financiero
            </h2>

            <p
              className="
                text-sm
                mint-text-secondary
                mt-1
                max-w-2xl
              "
            >
              Cierre financiero del período seleccionado,
              con ingresos, costos, comisiones, gastos y
              utilidad separados por moneda.
            </p>

          </div>

          <div
            className="
              flex
              items-center
              gap-3
              flex-wrap
            "
          >

            <div
              className="
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-primary-soft)]
                border
                border-[var(--mint-border-primary)]
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                "
              >
                Tratamientos
              </p>

              <p
                className="
                  text-xl
                  font-bold
                  text-[var(--mint-primary)]
                  mt-1
                "
              >
                {
                  tratamientosFiltrados.length
                }
              </p>

            </div>

            <div
              className="
                px-4
                py-3
                rounded-xl
                bg-[var(--mint-success-bg)]
                border
                border-[var(--mint-success-border)]
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                "
              >
                Finalizados
              </p>

              <p
                className="
                  text-xl
                  font-bold
                  text-[var(--mint-success)]
                  mt-1
                "
              >
                {
                  tratamientosFinalizados
                }
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* RESULTADO GENERAL */}

      <section>

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
                uppercase
                tracking-[0.14em]
                font-bold
                mint-text-muted
                mb-1
              "
            >
              Estado financiero
            </p>

            <h3
              className="
                text-xl
                font-bold
                mint-text-primary
              "
            >
              Resultado del período
            </h3>

          </div>

        </div>

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
          "
        >

          {/* MXN */}

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
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >
                  Moneda nacional
                </p>

                <h4
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                    mt-1
                  "
                >
                  Estado de resultados MXN
                </h4>

              </div>

              <span
                className="
                  inline-flex
                  px-3
                  py-1.5
                  rounded-lg
                  text-xs
                  font-bold
                  bg-[var(--mint-primary-soft)]
                  text-[var(--mint-primary)]
                  border
                  border-[var(--mint-border-primary)]
                "
              >
                MXN
              </span>

            </div>

            <div
              className="
                p-6
                space-y-1
              "
            >

              <FilaReporte
                titulo="Cobros recibidos"
                subtitulo="Pagos reales registrados"
                valor={cobradoMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="positivo"
              />

              <FilaReporte
                titulo="Base clínica"
                subtitulo="Resultado después de costos clínicos"
                valor={totalBaseClinicaMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
              />

              <FilaReporte
                titulo="Comisiones doctores"
                subtitulo="Comisiones generadas por tratamientos finalizados"
                valor={totalComisionesDoctorMXN}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <FilaReporte
                titulo="Gastos generales"
                subtitulo="Egresos registrados en el período"
                valor={totalGastos}
                moneda="MXN"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <div
                className="
                  pt-4
                  mt-4
                  border-t-2
                  border-[var(--mint-border-strong)]
                "
              >

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-bold
                        mint-text-primary
                      "
                    >
                      Utilidad neta
                    </p>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-1
                      "
                    >
                      Resultado final del período
                    </p>

                  </div>

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className={`
                        text-2xl
                        font-bold

                        ${
                          gananciaNeta >= 0

                            ? `
                                text-[var(--mint-success)]
                              `

                            : `
                                text-[var(--mint-danger)]
                              `
                        }
                      `}
                    >
                      $
                      {
                        formatoMonto(
                          gananciaNeta
                        )
                      }
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

                </div>

              </div>

            </div>

          </div>


          {/* USD */}

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
                    uppercase
                    tracking-[0.12em]
                    font-bold
                    mint-text-muted
                  "
                >
                  Moneda extranjera
                </p>

                <h4
                  className="
                    text-xl
                    font-bold
                    mint-text-primary
                    mt-1
                  "
                >
                  Estado de resultados USD
                </h4>

              </div>

              <span
                className="
                  inline-flex
                  px-3
                  py-1.5
                  rounded-lg
                  text-xs
                  font-bold
                  bg-[var(--mint-info-bg)]
                  text-[var(--mint-info)]
                  border
                  border-[var(--mint-info-border)]
                "
              >
                USD
              </span>

            </div>

            <div
              className="
                p-6
                space-y-1
              "
            >

              <FilaReporte
                titulo="Cobros recibidos"
                subtitulo="Pagos reales recibidos en dólares"
                valor={cobradoUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="positivo"
              />

              <FilaReporte
                titulo="Base clínica"
                subtitulo="Resultado después de costos clínicos USD"
                valor={totalBaseClinicaUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
              />

              <FilaReporte
                titulo="Comisiones doctores"
                subtitulo="Comisiones generadas en USD"
                valor={totalComisionesDoctorUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <FilaReporte
                titulo="Gastos generales"
                subtitulo="Egresos registrados directamente en USD"
                valor={totalGastosUSD}
                moneda="USD"
                formatoMonto={formatoMonto}
                tipo="negativo"
              />

              <div
                className="
                  pt-4
                  mt-4
                  border-t-2
                  border-[var(--mint-border-strong)]
                "
              >

                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-bold
                        mint-text-primary
                      "
                    >
                      Utilidad neta
                    </p>

                    <p
                      className="
                        text-xs
                        mint-text-muted
                        mt-1
                      "
                    >
                      Resultado real conservado en USD
                    </p>

                  </div>

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className={`
                        text-2xl
                        font-bold

                        ${
                          gananciaNetaUSD >= 0

                            ? `
                                text-[var(--mint-success)]
                              `

                            : `
                                text-[var(--mint-danger)]
                              `
                        }
                      `}
                    >
                      $
                      {
                        formatoMonto(
                          gananciaNetaUSD
                        )
                      }
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

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* LIQUIDEZ */}

      <section>

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.14em]
              font-bold
              mint-text-muted
              mb-1
            "
          >
            Liquidez
          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Disponibilidad financiera
          </h3>

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

          <TarjetaLiquidez
            titulo="Caja MXN"
            valor={cajaMXN}
            moneda="MXN"
            descripcion="Efectivo disponible"
            formatoMonto={formatoMonto}
            tipo="success"
          />

          <TarjetaLiquidez
            titulo="Caja USD"
            valor={cajaUSD}
            moneda="USD"
            descripcion="Efectivo en dólares"
            formatoMonto={formatoMonto}
            tipo="info"
          />

          <TarjetaLiquidez
            titulo="Tarjeta / Banco"
            valor={totalTarjeta}
            moneda="MXN"
            descripcion="Neto recibido por tarjeta"
            formatoMonto={formatoMonto}
            tipo="neutral"
          />

          <div
            className="
              mint-card
              p-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-[0.08em]
                font-bold
                mint-text-muted
              "
            >
              Transferencias
            </p>

            <div
              className="
                mt-4
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
                    mint-text-primary
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalTransferencia
                    )
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
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
                  pl-3
                  border-l
                  border-[var(--mint-border)]
                "
              >

                <p
                  className="
                    text-xl
                    font-bold
                    text-[var(--mint-info)]
                  "
                >
                  $
                  {
                    formatoMonto(
                      totalTransferenciaUSD
                    )
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    font-bold
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


      {/* OPERACIÓN */}

      <section>

        <div
          className="
            mb-4
          "
        >

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.14em]
              font-bold
              mint-text-muted
              mb-1
            "
          >
            Operación
          </p>

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >
            Estado de tratamientos
          </h3>

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
              md:grid-cols-4
            "
          >

            <EstadoTratamiento
              titulo="Total"
              valor={
                tratamientosFiltrados.length
              }
              descripcion="Registrados"
            />

            <EstadoTratamiento
              titulo="Finalizados"
              valor={
                tratamientosFinalizados
              }
              descripcion="Completados"
              tipo="success"
            />

            <EstadoTratamiento
              titulo="En proceso"
              valor={
                tratamientosPendientes
              }
              descripcion="Pendientes de finalizar"
              tipo="warning"
            />

            <EstadoTratamiento
              titulo="Cancelados"
              valor={
                tratamientosCancelados
              }
              descripcion="Sin concluir"
              tipo="danger"
              ultimo
            />

          </div>

        </div>

      </section>


      {/* CUENTAS POR COBRAR */}

      <section>

        <div
          className="
            mint-card
            overflow-hidden
          "
        >

          <div
            className="
              p-6
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.14em]
                  font-bold
                  mint-text-muted
                "
              >
                Cuentas por cobrar
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                  mt-1
                "
              >
                Saldo pendiente de pacientes
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Tratamientos registrados que aún
                conservan saldo pendiente.
              </p>

            </div>

            <div
              className="
                md:text-right
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  text-[var(--mint-danger)]
                "
              >
                $
                {
                  formatoMonto(
                    pendiente
                  )
                }
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN pendiente
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* REFERENCIA DE PRODUCCIÓN */}

      <section>

        <div
          className="
            mint-card
            p-6
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.14em]
                  font-bold
                  mint-text-muted
                "
              >
                Producción clínica
              </p>

              <h3
                className="
                  text-xl
                  font-bold
                  mint-text-primary
                  mt-1
                "
              >
                Valor generado
              </h3>

              <p
                className="
                  text-sm
                  mint-text-secondary
                  mt-1
                "
              >
                Referencia del valor total registrado
                en tratamientos durante el período.
              </p>

            </div>

            <div
              className="
                md:text-right
              "
            >

              <p
                className="
                  text-3xl
                  font-bold
                  text-[var(--mint-primary)]
                "
              >
                $
                {
                  formatoMonto(
                    ingresos
                  )
                }
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.1em]
                  font-bold
                  mint-text-muted
                  mt-1
                "
              >
                MXN
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>

  );

}


type FilaReporteProps = {

  titulo: string;
  subtitulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo?:
    | "normal"
    | "positivo"
    | "negativo";

};

function FilaReporte({

  titulo,
  subtitulo,

  valor,

  moneda,

  formatoMonto,

  tipo = "normal",

}: FilaReporteProps) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-3.5
        border-b
        border-[var(--mint-border)]
        last:border-b-0
      "
    >

      <div>

        <p
          className="
            text-sm
            font-semibold
            mint-text-primary
          "
        >
          {titulo}
        </p>

        <p
          className="
            text-[11px]
            mint-text-muted
            mt-0.5
          "
        >
          {subtitulo}
        </p>

      </div>

      <div
        className="
          text-right
          shrink-0
        "
      >

        <p
          className={`
            text-base
            font-bold

            ${
              tipo ===
              "positivo"

                ? `
                    text-[var(--mint-success)]
                  `

                : tipo ===
                  "negativo"

                  ? `
                      text-[var(--mint-danger)]
                    `

                  : `
                      mint-text-primary
                    `
            }
          `}
        >
          {
            tipo === "negativo"
              ? "−"
              : ""
          }
          $
          {
            formatoMonto(
              valor
            )
          }
        </p>

        <p
          className="
            text-[9px]
            uppercase
            font-bold
            mint-text-muted
            mt-0.5
          "
        >
          {moneda}
        </p>

      </div>

    </div>

  );

}


type TarjetaLiquidezProps = {

  titulo: string;

  valor: number;

  moneda:
    | "MXN"
    | "USD";

  descripcion: string;

  formatoMonto:
    (
      valor: number
    ) => string;

  tipo:
    | "success"
    | "info"
    | "neutral";

};

function TarjetaLiquidez({

  titulo,

  valor,

  moneda,

  descripcion,

  formatoMonto,

  tipo,

}: TarjetaLiquidezProps) {

  return (

    <div
      className="
        mint-card
        p-5
      "
    >

      <p
        className="
          text-xs
          uppercase
          tracking-[0.08em]
          font-bold
          mint-text-muted
        "
      >
        {titulo}
      </p>

      <p
        className={`
          text-2xl
          font-bold
          mt-3

          ${
            tipo ===
            "success"

              ? `
                  text-[var(--mint-success)]
                `

              : tipo ===
                "info"

                ? `
                    text-[var(--mint-info)]
                  `

                : `
                    mint-text-primary
                  `
          }
        `}
      >
        $
        {
          formatoMonto(
            valor
          )
        }
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
        {moneda}
      </p>

      <p
        className="
          text-[11px]
          mint-text-secondary
          mt-3
        "
      >
        {descripcion}
      </p>

    </div>

  );

}


type EstadoTratamientoProps = {

  titulo: string;

  valor: number;

  descripcion: string;

  tipo?:
    | "normal"
    | "success"
    | "warning"
    | "danger";

  ultimo?: boolean;

};

function EstadoTratamiento({

  titulo,

  valor,

  descripcion,

  tipo = "normal",

  ultimo = false,

}: EstadoTratamientoProps) {

  return (

    <div
      className={`
        p-5

        ${
          !ultimo

            ? `
                border-b
                md:border-b-0
                md:border-r
                border-[var(--mint-border)]
              `

            : ""
        }
      `}
    >

      <p
        className="
          text-xs
          font-semibold
          mint-text-secondary
        "
      >
        {titulo}
      </p>

      <p
        className={`
          text-2xl
          font-bold
          mt-2

          ${
            tipo ===
            "success"

              ? `
                  text-[var(--mint-success)]
                `

              : tipo ===
                "warning"

                ? `
                    text-[var(--mint-warning)]
                  `

                : tipo ===
                  "danger"

                  ? `
                      text-[var(--mint-danger)]
                    `

                  : `
                      mint-text-primary
                    `
          }
        `}
      >
        {valor}
      </p>

      <p
        className="
          text-[11px]
          mint-text-muted
          mt-1
        "
      >
        {descripcion}
      </p>

    </div>

  );

}