import { useEffect, useState } from "react";

import {
  Routes,
  Route,
} from "react-router-dom";

import { supabase } from "./lib/supabase";

import Odontograma from "./components/Odontograma";

import FormularioPacientePublico from "./components/FormularioPacientePublico";

import QRCodePaciente from "./components/QRCodePaciente";

type Paciente = {

  id?: number;

  nombre: string;

  telefono: string;

  edad: string;

  sexo: string;

  observaciones?: any;

};

function AdminApp() {

  const [nombre,
    setNombre] =
    useState("");

  const [telefono,
    setTelefono] =
    useState("");

  const [edad,
    setEdad] =
    useState("");

  const [sexo,
    setSexo] =
    useState("");

  const [busqueda,
    setBusqueda] =
    useState("");

  const [pacientes,
    setPacientes] =
    useState<Paciente[]>([]);

  const [pacienteAbierto,
    setPacienteAbierto] =
    useState<Paciente | null>(null);

  const [observacionesDientes,
    setObservacionesDientes] =
    useState<Record<string, string>>({});

  const [estadoDientes,
    setEstadoDientes] =
    useState<Record<string, string>>({});

  useEffect(() => {

    cargarPacientes();

  }, []);

  async function cargarPacientes() {

    const { data, error } =
      await supabase

        .from("pacientes")

        .select("*")

        .order(
          "id",
          { ascending: false }
        );

    if (!error && data) {

      setPacientes(data);

    }

  }

  async function guardarPaciente() {

    if (
      !nombre ||
      !telefono
    ) {

      alert(
        "Complete nombre y teléfono"
      );

      return;

    }

    const { error } =
      await supabase

        .from("pacientes")

        .insert([{

          nombre,

          telefono,

          edad,

          sexo,

        }]);

    if (error) {

      alert(
        "Error guardando paciente"
      );

      return;

    }

    setNombre("");
    setTelefono("");
    setEdad("");
    setSexo("");

    cargarPacientes();

  }

  async function guardarExpediente() {

    if (!pacienteAbierto?.id) {

      return;

    }

    const { error } =
      await supabase

        .from("pacientes")

        .update({

          observaciones: {

            dientes:
              observacionesDientes,

            estados:
              estadoDientes,

          },

        })

        .eq(
          "id",
          pacienteAbierto.id
        );

    if (error) {

      alert(
        "Error guardando expediente"
      );

      return;

    }

    alert(
      "Expediente guardado"
    );

  }

  function abrirPaciente(
    paciente: Paciente
  ) {

    setPacienteAbierto(
      paciente
    );

    if (
      paciente.observaciones
    ) {

      setObservacionesDientes(

        paciente
          .observaciones
          .dientes || {}

      );

      setEstadoDientes(

        paciente
          .observaciones
          .estados || {}

      );

    } else {

      setObservacionesDientes(
        {}
      );

      setEstadoDientes(
        {}
      );

    }

  }

  const pacientesFiltrados =
    pacientes.filter((p)=>

      p.nombre
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )

    );

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-teal-700 mb-10">
          MintOS Dental
        </h1>

        {/* QR */}

        <div className="mb-10">

          <QRCodePaciente />

        </div>

        {/* NUEVO PACIENTE */}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-8">
            Nuevo Paciente
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              value={nombre}
              onChange={(e)=>
                setNombre(
                  e.target.value
                )
              }
              placeholder="Nombre"
              className="border rounded-xl p-4"
            />

            <input
              value={telefono}
              onChange={(e)=>
                setTelefono(
                  e.target.value
                )
              }
              placeholder="Teléfono"
              className="border rounded-xl p-4"
            />

            <input
              value={edad}
              onChange={(e)=>
                setEdad(
                  e.target.value
                )
              }
              placeholder="Edad"
              className="border rounded-xl p-4"
            />

            <input
              value={sexo}
              onChange={(e)=>
                setSexo(
                  e.target.value
                )
              }
              placeholder="Sexo"
              className="border rounded-xl p-4"
            />

          </div>

          <button
            onClick={
              guardarPaciente
            }
            className="
              mt-6
              bg-teal-600
              hover:bg-teal-700
              text-white
              px-8
              py-4
              rounded-2xl
              font-bold
            "
          >
            Guardar Paciente
          </button>

        </div>

        {/* LISTA */}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">

          <h2 className="text-3xl font-bold mb-8">
            Lista de Pacientes
          </h2>

          <input
            value={busqueda}
            onChange={(e)=>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="Buscar paciente..."
            className="
              border
              rounded-xl
              p-4
              w-full
              mb-6
            "
          />

          <div className="space-y-4">

            {

              pacientesFiltrados
                .map((p)=>(

                  <div
                    key={p.id}
                    className="
                      border
                      rounded-2xl
                      p-5
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div>

                      <h3 className="text-xl font-bold">
                        {p.nombre}
                      </h3>

                      <p>
                        Teléfono: {p.telefono}
                      </p>

                      <p>
                        Edad: {p.edad}
                        {" | "}
                        Sexo: {p.sexo}
                      </p>

                    </div>

                    <button
                      onClick={()=>
                        abrirPaciente(p)
                      }
                      className="
                        bg-teal-600
                        hover:bg-teal-700
                        text-white
                        px-6
                        py-3
                        rounded-xl
                      "
                    >
                      Abrir
                    </button>

                  </div>

                ))

            }

          </div>

        </div>

        {/* EXPEDIENTE */}

        {

          pacienteAbierto && (

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-4xl font-bold text-teal-700">
                  Expediente Clínico
                </h2>

                <button
                  onClick={()=>
                    setPacienteAbierto(
                      null
                    )
                  }
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-6
                    py-3
                    rounded-xl
                  "
                >
                  Cerrar
                </button>

              </div>

              <Odontograma
                observacionesDientes={
                  observacionesDientes
                }
                setObservacionesDientes={
                  setObservacionesDientes
                }
                estadoDientes={
                  estadoDientes
                }
                setEstadoDientes={
                  setEstadoDientes
                }
              />

              <button
                onClick={
                  guardarExpediente
                }
                className="
                  mt-8
                  bg-teal-600
                  hover:bg-teal-700
                  text-white
                  px-8
                  py-4
                  rounded-2xl
                  font-bold
                "
              >
                Guardar Expediente
              </button>

            </div>

          )

        }

      </div>

    </div>

  );

}

export default function App() {

  return (

    <Routes>

      <Route
        index
        element={<AdminApp />}
      />

      <Route
        path="/formulario"
        element={<FormularioPacientePublico />}
      />

    </Routes>

  );

}