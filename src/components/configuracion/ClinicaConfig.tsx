import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

import { supabase }
  from "../../lib/supabase";

type Clinica = {
  id: number;
  nombre: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  pais: string | null;
  horario: string | null;
  zona_horaria: string | null;
};

const formularioInicial = {
  nombre: "",
  telefono: "",
  whatsapp: "",
  email: "",
  direccion: "",
  ciudad: "",
  estado: "",
  pais: "México",
  horario: "",
  zona_horaria: "America/Hermosillo",
};

export default function ClinicaConfig() {

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    clinicaId,
    setClinicaId,
  ] = useState<number | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState(
    formularioInicial
  );

  useEffect(() => {

    cargarClinica();

  }, []);

  async function cargarClinica() {

    setCargando(true);

    const {
      data,
      error,
    } = await supabase
      .from("configuracion_clinica")
      .select(`
        id,
        nombre,
        telefono,
        whatsapp,
        email,
        direccion,
        ciudad,
        estado,
        pais,
        horario,
        zona_horaria
      `)
      .limit(1)
      .maybeSingle();

    if (error) {

      console.error(
        "Error cargando clínica:",
        error
      );

      setCargando(false);

      return;

    }

    if (data) {

      const clinica =
        data as Clinica;

      setClinicaId(
        clinica.id
      );

      setForm({
        nombre:
          clinica.nombre || "",
        telefono:
          clinica.telefono || "",
        whatsapp:
          clinica.whatsapp || "",
        email:
          clinica.email || "",
        direccion:
          clinica.direccion || "",
        ciudad:
          clinica.ciudad || "",
        estado:
          clinica.estado || "",
        pais:
          clinica.pais || "México",
        horario:
          clinica.horario || "",
        zona_horaria:
          clinica.zona_horaria ||
          "America/Hermosillo",
      });

    }

    setCargando(false);

  }

  function actualizarCampo(
    campo: keyof typeof form,
    valor: string
  ) {

    setForm(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

  }

  async function guardarClinica() {

    if (
      !form.nombre.trim()
    ) {

      alert(
        "Ingresa el nombre del consultorio."
      );

      return;

    }

    setGuardando(true);

    const datos = {
      nombre:
        form.nombre.trim(),

      telefono:
        form.telefono
          .trim() || null,

      whatsapp:
        form.whatsapp
          .replace(/\D/g, "") ||
        null,

      email:
        form.email
          .trim() || null,

      direccion:
        form.direccion
          .trim() || null,

      ciudad:
        form.ciudad
          .trim() || null,

      estado:
        form.estado
          .trim() || null,

      pais:
        form.pais
          .trim() || null,

      horario:
        form.horario
          .trim() || null,

      zona_horaria:
        form.zona_horaria
          .trim() || null,
    };

    let error;

    if (clinicaId) {

      const respuesta =
        await supabase
          .from(
            "configuracion_clinica"
          )
          .update(datos)
          .eq(
            "id",
            clinicaId
          );

      error =
        respuesta.error;

    } else {

      const respuesta =
        await supabase
          .from(
            "configuracion_clinica"
          )
          .insert(datos)
          .select("id")
          .single();

      error =
        respuesta.error;

      if (
        respuesta.data?.id
      ) {

        setClinicaId(
          respuesta.data.id
        );

      }

    }

    setGuardando(false);

    if (error) {

      console.error(
        "Error guardando clínica:",
        error
      );

      alert(
        "No se pudo guardar la información."
      );

      return;

    }

    alert(
      "Información de la clínica guardada."
    );

  }

  if (cargando) {

    return (
      <div
        className="
          bg-white
          rounded-2xl
          border
          border-slate-200
          p-6
        "
      >

        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Cargando información...
        </p>

      </div>
    );

  }

  return (

    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200
        overflow-hidden
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          p-6
          border-b
          border-slate-200
        "
      >

        <div
          className="
            flex
            items-start
            gap-3
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-teal-50
              text-teal-700
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >

            <Building2
              size={22}
            />

          </div>

          <div>

            <h1
              className="
                text-xl
                font-bold
                text-slate-800
              "
            >
              Clínica
            </h1>

            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              Información general del
              consultorio.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={
            guardarClinica
          }
          disabled={
            guardando
          }
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-teal-600
            text-white
            text-sm
            font-semibold
            hover:bg-teal-700
            disabled:opacity-50
            transition
          "
        >

          <Save
            size={17}
          />

          {
            guardando
              ? "Guardando..."
              : "Guardar cambios"
          }

        </button>

      </div>

      <div
        className="
          p-6
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
        "
      >

        <div
          className="
            space-y-5
          "
        >

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              Nombre del consultorio
            </label>

            <input
              type="text"
              value={
                form.nombre
              }
              onChange={(e) =>
                actualizarCampo(
                  "nombre",
                  e.target.value
                )
              }
              placeholder="Ej. Dra. Marlene Group"
              className="
                w-full
                px-3
                py-2.5
                rounded-xl
                border
                border-slate-300
                text-sm
                outline-none
                focus:ring-2
                focus:ring-teal-100
                focus:border-teal-500
              "
            />

          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Teléfono
              </label>

              <div
                className="
                  relative
                "
              >

                <Phone
                  size={16}
                  className="
                    absolute
                    left-3
                    top-3
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={
                    form.telefono
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      "telefono",
                      e.target.value
                    )
                  }
                  placeholder="653 000 0000"
                  className="
                    w-full
                    pl-9
                    pr-3
                    py-2.5
                    rounded-xl
                    border
                    border-slate-300
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-teal-100
                    focus:border-teal-500
                  "
                />

              </div>

            </div>

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                WhatsApp
              </label>

              <input
                type="text"
                value={
                  form.whatsapp
                }
                onChange={(e) =>
                  actualizarCampo(
                    "whatsapp",
                    e.target.value
                  )
                }
                placeholder="526530000000"
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-100
                  focus:border-teal-500
                "
              />

              <p
                className="
                  text-[11px]
                  text-slate-400
                  mt-1
                "
              >
                Código de país y número,
                solo dígitos.
              </p>

            </div>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              Correo electrónico
            </label>

            <div
              className="
                relative
              "
            >

              <Mail
                size={16}
                className="
                  absolute
                  left-3
                  top-3
                  text-slate-400
                "
              />

              <input
                type="email"
                value={
                  form.email
                }
                onChange={(e) =>
                  actualizarCampo(
                    "email",
                    e.target.value
                  )
                }
                placeholder="correo@clinica.com"
                className="
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-100
                  focus:border-teal-500
                "
              />

            </div>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              Dirección
            </label>

            <div
              className="
                relative
              "
            >

              <MapPin
                size={16}
                className="
                  absolute
                  left-3
                  top-3
                  text-slate-400
                "
              />

              <input
                type="text"
                value={
                  form.direccion
                }
                onChange={(e) =>
                  actualizarCampo(
                    "direccion",
                    e.target.value
                  )
                }
                placeholder="Calle, número y colonia"
                className="
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-100
                  focus:border-teal-500
                "
              />

            </div>

          </div>

        </div>

        <div
          className="
            space-y-5
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Ciudad
              </label>

              <input
                type="text"
                value={
                  form.ciudad
                }
                onChange={(e) =>
                  actualizarCampo(
                    "ciudad",
                    e.target.value
                  )
                }
                placeholder="San Luis Río Colorado"
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-100
                  focus:border-teal-500
                "
              />

            </div>

            <div>

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-2
                "
              >
                Estado
              </label>

              <input
                type="text"
                value={
                  form.estado
                }
                onChange={(e) =>
                  actualizarCampo(
                    "estado",
                    e.target.value
                  )
                }
                placeholder="Sonora"
                className="
                  w-full
                  px-3
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-teal-100
                  focus:border-teal-500
                "
              />

            </div>

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              País
            </label>

            <input
              type="text"
              value={
                form.pais
              }
              onChange={(e) =>
                actualizarCampo(
                  "pais",
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2.5
                rounded-xl
                border
                border-slate-300
                text-sm
                outline-none
                focus:ring-2
                focus:ring-teal-100
                focus:border-teal-500
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              Horario
            </label>

            <textarea
              value={
                form.horario
              }
              onChange={(e) =>
                actualizarCampo(
                  "horario",
                  e.target.value
                )
              }
              placeholder={
                "Lunes a Viernes: 9:00 AM - 1:00 PM / 4:00 PM - 8:00 PM\nSábado: 9:00 AM - 2:00 PM"
              }
              rows={4}
              className="
                w-full
                px-3
                py-2.5
                rounded-xl
                border
                border-slate-300
                text-sm
                outline-none
                resize-none
                focus:ring-2
                focus:ring-teal-100
                focus:border-teal-500
              "
            />

          </div>

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-slate-700
                mb-2
              "
            >
              Zona horaria
            </label>

            <select
              value={
                form.zona_horaria
              }
              onChange={(e) =>
                actualizarCampo(
                  "zona_horaria",
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2.5
                rounded-xl
                border
                border-slate-300
                text-sm
                outline-none
                bg-white
                focus:ring-2
                focus:ring-teal-100
                focus:border-teal-500
              "
            >

              <option
                value="America/Hermosillo"
              >
                Sonora / Arizona
              </option>

              <option
                value="America/Tijuana"
              >
                Baja California
              </option>

              <option
                value="America/Mexico_City"
              >
                Centro de México
              </option>

            </select>

          </div>

        </div>

      </div>

    </div>

  );

}