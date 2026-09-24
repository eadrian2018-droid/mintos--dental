import {
  Search,
  UserPlus,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type IdiomaTablet = "es" | "en";

type PacienteBusqueda = {
  id: number;
  nombre: string;
  telefono: string | null;
  correo: string | null;
};

type TabletInicioProps = {
  onNuevoPaciente: (
    idioma: IdiomaTablet
  ) => void;

  onPacienteSeleccionado: (
    paciente: PacienteBusqueda,
    idioma: IdiomaTablet
  ) => void;
};

export default function TabletInicio({
  onNuevoPaciente,
  onPacienteSeleccionado,
}: TabletInicioProps) {
  const [idioma, setIdioma] =
    useState<IdiomaTablet>("es");

  const [busqueda, setBusqueda] =
    useState("");

  const [resultados, setResultados] =
    useState<PacienteBusqueda[]>([]);

  const [buscando, setBuscando] =
    useState(false);

  const [errorBusqueda, setErrorBusqueda] =
    useState("");

  const esIngles = idioma === "en";

  useEffect(() => {
    const termino = busqueda.trim();

    if (termino.length < 2) {
      setResultados([]);
      setBuscando(false);
      setErrorBusqueda("");
      return;
    }

    const timeout = window.setTimeout(
      async () => {
        setBuscando(true);
        setErrorBusqueda("");

        try {
          const { data, error } =
            await supabase.rpc(
              "buscar_pacientes_tablet",
              {
                p_busqueda: termino,
              }
            );

          if (error) {
            console.error(
              "Error buscando pacientes:",
              error
            );

            setResultados([]);

            setErrorBusqueda(
              esIngles
                ? "Patients could not be searched."
                : "No se pudieron buscar pacientes."
            );

            return;
          }

          setResultados(
            (data || []) as PacienteBusqueda[]
          );
        } catch (error) {
          console.error(
            "Error inesperado buscando pacientes:",
            error
          );

          setResultados([]);

          setErrorBusqueda(
            esIngles
              ? "Patients could not be searched."
              : "No se pudieron buscar pacientes."
          );
        } finally {
          setBuscando(false);
        }
      },
      350
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [busqueda, esIngles]);

  function ocultarTelefono(
    telefono: string | null
  ) {
    if (!telefono) {
      return null;
    }

    const limpio = telefono.trim();

    if (limpio.length <= 4) {
      return limpio;
    }

    return `•••• ${limpio.slice(-4)}`;
  }

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        p-4
        md:p-8
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          max-w-3xl
          bg-white
          border
          border-slate-200
          rounded-3xl
          shadow-xl
          overflow-hidden
        "
      >
        <header
          className="
            bg-slate-900
            text-white
            px-6
            md:px-10
            py-7
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-5
            "
          >
            <div>
              <p
                className="
                  text-teal-300
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.18em]
                "
              >
                MintOS
              </p>

              <h1
                className="
                  text-2xl
                  md:text-3xl
                  font-bold
                  mt-1
                "
              >
                {esIngles
                  ? "Patient Check-In"
                  : "Registro de pacientes"}
              </h1>
            </div>

            <div
              className="
                inline-flex
                self-start
                sm:self-auto
                rounded-xl
                bg-white/10
                p-1
                border
                border-white/15
              "
            >
              <button
                type="button"
                onClick={() =>
                  setIdioma("es")
                }
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-bold
                  transition
                  ${
                    idioma === "es"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-200 hover:bg-white/10"
                  }
                `}
              >
                Español
              </button>

              <button
                type="button"
                onClick={() =>
                  setIdioma("en")
                }
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-bold
                  transition
                  ${
                    idioma === "en"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-200 hover:bg-white/10"
                  }
                `}
              >
                English
              </button>
            </div>
          </div>

          <p
            className="
              text-slate-300
              mt-4
              max-w-xl
            "
          >
            {esIngles
              ? "Find an existing patient or start a new patient registration."
              : "Busque un paciente existente o inicie el registro de un paciente nuevo."}
          </p>
        </header>

        <div
          className="
            p-6
            md:p-10
            space-y-8
          "
        >
          <section>
            <div
              className="
                flex
                items-center
                gap-3
                mb-4
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-teal-50
                  text-teal-700
                  flex
                  items-center
                  justify-center
                "
              >
                <Search size={20} />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                  "
                >
                  {esIngles
                    ? "Existing patient"
                    : "Paciente existente"}
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  {esIngles
                    ? "Search by the patient's name."
                    : "Busque por el nombre del paciente."}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                size={20}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(
                    event.target.value
                  )
                }
                placeholder={
                  esIngles
                    ? "Enter patient name..."
                    : "Escriba el nombre del paciente..."
                }
                autoComplete="off"
                className="
                  w-full
                  border
                  border-slate-300
                  rounded-2xl
                  bg-white
                  py-4
                  pl-12
                  pr-4
                  text-base
                  text-slate-900
                  outline-none
                  transition
                  focus:border-teal-500
                  focus:ring-4
                  focus:ring-teal-500/10
                "
              />
            </div>

            {busqueda.trim().length === 1 && (
              <p
                className="
                  text-sm
                  text-slate-500
                  mt-3
                "
              >
                {esIngles
                  ? "Enter at least 2 characters."
                  : "Escriba al menos 2 caracteres."}
              </p>
            )}

            {buscando && (
              <div
                className="
                  mt-4
                  text-sm
                  text-slate-500
                "
              >
                {esIngles
                  ? "Searching..."
                  : "Buscando..."}
              </div>
            )}

            {errorBusqueda && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {errorBusqueda}
              </div>
            )}

            {!buscando &&
              !errorBusqueda &&
              busqueda.trim().length >= 2 &&
              resultados.length === 0 && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-4
                    text-sm
                    text-slate-500
                  "
                >
                  {esIngles
                    ? "No matching patients were found."
                    : "No se encontraron pacientes con ese nombre."}
                </div>
              )}

            {resultados.length > 0 && (
              <div
                className="
                  mt-4
                  border
                  border-slate-200
                  rounded-2xl
                  overflow-hidden
                  divide-y
                  divide-slate-200
                "
              >
                {resultados.map(
                  (paciente) => {
                    const telefono =
                      ocultarTelefono(
                        paciente.telefono
                      );

                    return (
                      <button
                        key={paciente.id}
                        type="button"
                        onClick={() =>
                          onPacienteSeleccionado(
                            paciente,
                            idioma
                          )
                        }
                        className="
                          w-full
                          flex
                          items-center
                          gap-4
                          p-4
                          text-left
                          bg-white
                          hover:bg-teal-50/60
                          transition
                        "
                      >
                        <div
                          className="
                            shrink-0
                            w-11
                            h-11
                            rounded-xl
                            bg-slate-100
                            text-slate-600
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <UserRound
                            size={21}
                          />
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              font-bold
                              text-slate-900
                              truncate
                            "
                          >
                            {paciente.nombre}
                          </p>

                          {telefono && (
                            <p
                              className="
                                text-sm
                                text-slate-500
                                mt-0.5
                              "
                            >
                              {esIngles
                                ? "Phone"
                                : "Tel."}
                              : {telefono}
                            </p>
                          )}
                        </div>

                        <span
                          className="
                            text-sm
                            font-bold
                            text-teal-700
                          "
                        >
                          {esIngles
                            ? "Select"
                            : "Seleccionar"}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                h-px
                bg-slate-200
                flex-1
              "
            />

            <span
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              {esIngles ? "or" : "o"}
            </span>

            <div
              className="
                h-px
                bg-slate-200
                flex-1
              "
            />
          </div>

          <section>
            <button
              type="button"
              onClick={() =>
                onNuevoPaciente(idioma)
              }
              className="
                w-full
                flex
                items-center
                justify-center
                gap-3
                bg-teal-600
                hover:bg-teal-700
                text-white
                px-6
                py-4
                rounded-2xl
                font-bold
                text-lg
                shadow-sm
                transition
              "
            >
              <UserPlus size={22} />

              {esIngles
                ? "Register New Patient"
                : "Registrar nuevo paciente"}
            </button>

            <p
              className="
                text-center
                text-sm
                text-slate-500
                mt-3
              "
            >
              {esIngles
                ? "Use this option only if the patient does not already have a record."
                : "Use esta opción solamente si el paciente todavía no tiene expediente."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}