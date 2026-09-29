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

import { registrarBitacora }
  from "../../lib/registrarBitacora";

import { useLanguage }
  from "../../context/LanguageContext";

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
  responsable: string | null;
  sitio_web: string | null;
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
  responsable: "",
  sitio_web: "",
};

export default function ClinicaConfig() {

  const { language } = useLanguage();

  const es = language === "es";

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

  const [
    formOriginal,
    setFormOriginal,
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
        zona_horaria,
        responsable,
        sitio_web
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

      const datosClinica = {
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
        responsable:
          clinica.responsable || "",
        sitio_web:
          clinica.sitio_web || "",
      };

      setForm(
        datosClinica
      );

      setFormOriginal(
        datosClinica
      );

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
        es ? "Ingresa el nombre del consultorio." : "Enter the clinic name."
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

      responsable:
        form.responsable
          .trim() || null,

      sitio_web:
        form.sitio_web
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
        es ? "No se pudo guardar la información." : "The information could not be saved."
      );

      return;

    }

    const cambios: string[] = [];

    const etiquetas: Record<
      keyof typeof form,
      string
    > = {
      nombre: "Nombre",
      telefono: "Teléfono",
      whatsapp: "WhatsApp",
      email: "Correo",
      direccion: "Dirección",
      ciudad: "Ciudad",
      estado: "Estado",
      pais: "País",
      horario: "Horario",
      zona_horaria: "Zona horaria",
      responsable: "Responsable",
      sitio_web: "Sitio web",
    };

    (
      Object.keys(
        form
      ) as Array<
        keyof typeof form
      >
    ).forEach(
      (campo) => {

        if (
          form[campo] !==
          formOriginal[campo]
        ) {
          cambios.push(
            etiquetas[campo]
          );
        }

      }
    );

    await registrarBitacora({
      accion:
        clinicaId
          ? "Editar configuración de clínica"
          : "Crear configuración de clínica",
      modulo: "Configuración",
      detalle:
        `Clínica: ${datos.nombre} | Campos modificados: ${cambios.length > 0 ? cambios.join(", ") : "Sin cambios efectivos"}`,
    });

    setFormOriginal(
      form
    );

    alert(
      es ? "Información de la clínica guardada." : "Clinic information saved."
    );

  }

  if (cargando) {

    return (
      <div
        className="
          rounded-[22px]
          border
          border-[var(--mint-border)]
          bg-white
          p-6
          shadow-[0_10px_30px_rgba(15,42,65,0.06)]
        "
      >

        <p
          className="
            text-sm
            mint-text-secondary
          "
        >
          {es ? "Cargando información..." : "Loading information..."}
        </p>

      </div>
    );

  }

  return (

    <div
      className="
        overflow-hidden
        rounded-[24px]
        border
        border-[var(--mint-border)]
        bg-white
        shadow-[0_16px_42px_rgba(15,42,65,0.09)]
      "
    >

      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-5
          overflow-hidden
          px-7
          py-7
          border-b
          border-white/10
          bg-[linear-gradient(120deg,#1b4f68_0%,#23677a_52%,#249884_100%)]
          after:absolute
          after:inset-x-0
          after:bottom-0
          after:h-[3px]
          after:bg-[linear-gradient(90deg,#19a991_0%,#65cdb8_55%,#d8bd72_100%)]
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
              relative
              z-10
              w-11
              h-11
              rounded-xl
              bg-white/12
              text-white
              border
              border-white/20
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
                tracking-[-0.02em]
                text-white
              "
            >
              {es ? "Clínica" : "Clinic"}
            </h1>

            <p
              className="
                text-sm
                text-white/75
                mt-1
              "
            >
              {es ? "Información general del consultorio." : "General clinic information."}
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
            relative
            z-10
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/25
            bg-white
            px-4
            py-2.5
            text-sm
            font-bold
            text-[var(--mint-navy)]
            shadow-[0_8px_22px_rgba(15,42,65,0.18)]
            transition
            hover:-translate-y-0.5
            hover:bg-[var(--mint-teal-pale)]
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >

          <Save
            size={17}
          />

          {
            guardando
              ? es ? "Guardando..." : "Saving..."
              : es ? "Guardar cambios" : "Save changes"
          }

        </button>

      </div>

      <div
        className="
          px-6
          py-4
          border-b
          border-[var(--mint-border-teal)]
          bg-[linear-gradient(90deg,#eaf8f5_0%,#f7fbfa_72%,#ffffff_100%)]
        "
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--mint-teal)] shadow-[0_0_0_4px_rgba(11,143,128,0.10)]" />
          <div>
            <p className="text-sm font-bold text-[var(--mint-navy)]">
              {es ? "Información institucional" : "Institutional information"}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--mint-text-secondary)]">
              {es
                ? "Estos datos identifican a la clínica dentro de MintOS y se utilizan en documentos generados por el sistema, como consentimientos y presupuestos."
                : "These details identify the clinic within MintOS and are used in system-generated documents such as consent forms and estimates."}
            </p>
          </div>
        </div>
      </div>

      <div
        className="
          p-6
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
          bg-[var(--mint-app-bg)]
        "
      >

        <div
          className="
            space-y-5
            rounded-[20px]
            border
            border-[var(--mint-border)]
            bg-white
            p-5
            shadow-[0_8px_24px_rgba(15,42,65,0.045)]
          "
        >

          <div className="pb-4 border-b border-[var(--mint-border-soft)]">
            <p className="text-[10px] uppercase tracking-[0.16em] font-extrabold text-[var(--mint-teal)]">
              {es ? "Identidad y contacto" : "Identity and contact"}
            </p>
            <h2 className="mt-1 text-base font-bold text-[var(--mint-navy)]">
              {es ? "Datos del consultorio" : "Clinic details"}
            </h2>
            <p className="mt-1 text-xs text-[var(--mint-text-secondary)]">
              {es ? "Información institucional utilizada por MintOS." : "Institutional information used by MintOS."}
            </p>
          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Nombre del consultorio" : "Clinic name"}
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
                mint-input
                w-full
                px-3
                py-2.5
              "
            />

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Responsable / Doctora principal" : "Primary doctor / Responsible person"}
            </label>

            <input
              type="text"
              value={
                form.responsable
              }
              onChange={(e) =>
                actualizarCampo(
                  "responsable",
                  e.target.value
                )
              }
              placeholder={
                es
                  ? "Ej. Dra. Marlene Verdugo"
                  : "E.g. Dr. Marlene Verdugo"
              }
              className="
                mint-input
                w-full
                px-3
                py-2.5
              "
            />

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Sitio web" : "Website"}
            </label>

            <input
              type="text"
              value={
                form.sitio_web
              }
              onChange={(e) =>
                actualizarCampo(
                  "sitio_web",
                  e.target.value
                )
              }
              placeholder="drmarlenedentalgroup.com"
              className="
                mint-input
                w-full
                px-3
                py-2.5
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
                  mint-label
                  block
                  mb-2
                "
              >
                {es ? "Teléfono" : "Phone"}
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
                    mint-text-muted
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
                    mint-input
                    w-full
                    pl-9
                    pr-3
                    py-2.5
                  "
                />

              </div>

            </div>

            <div>

              <label
                className="
                  mint-label
                  block
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
                  mint-input
                  w-full
                  px-3
                  py-2.5
                "
              />

              <p
                className="
                  text-[11px]
                  mint-text-muted
                  mt-1
                "
              >
                {es ? "Código de país y número, solo dígitos." : "Country code and number, digits only."}
              </p>

            </div>

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Correo electrónico" : "Email"}
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
                  mint-text-muted
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
                  mint-input
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                "
              />

            </div>

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Dirección" : "Address"}
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
                  mint-text-muted
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
                placeholder={es ? "Calle, número y colonia" : "Street, number and neighborhood"}
                className="
                  mint-input
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                "
              />

            </div>

          </div>

        </div>

        <div
          className="
            space-y-5
            rounded-[20px]
            border
            border-[var(--mint-border)]
            bg-white
            p-5
            shadow-[0_8px_24px_rgba(15,42,65,0.045)]
          "
        >

          <div className="pb-4 border-b border-[var(--mint-border-soft)]">
            <p className="text-[10px] uppercase tracking-[0.16em] font-extrabold text-[#9b7a28]">
              {es ? "Ubicación y operación" : "Location and operations"}
            </p>
            <h2 className="mt-1 text-base font-bold text-[var(--mint-navy)]">
              {es ? "Datos operativos" : "Operational details"}
            </h2>
            <p className="mt-1 text-xs text-[var(--mint-text-secondary)]">
              {es ? "Dirección regional, horario y zona horaria de la clínica." : "Regional address, business hours and clinic time zone."}
            </p>
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
                  mint-label
                  block
                  mb-2
                "
              >
                {es ? "Ciudad" : "City"}
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
                  mint-input
                  w-full
                  px-3
                  py-2.5
                "
              />

            </div>

            <div>

              <label
                className="
                  mint-label
                  block
                  mb-2
                "
              >
                {es ? "Estado" : "State"}
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
                  mint-input
                  w-full
                  px-3
                  py-2.5
                "
              />

            </div>

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "País" : "Country"}
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
                mint-input
                w-full
                px-3
                py-2.5
              "
            />

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Horario" : "Business hours"}
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
                es
                  ? "Lunes a Viernes: 9:00 AM - 1:00 PM / 4:00 PM - 8:00 PM\nSábado: 9:00 AM - 2:00 PM"
                  : "Monday to Friday: 9:00 AM - 1:00 PM / 4:00 PM - 8:00 PM\nSaturday: 9:00 AM - 2:00 PM"
              }
              rows={4}
              className="
                mint-input
                w-full
                px-3
                py-2.5
                resize-none
              "
            />

          </div>

          <div>

            <label
              className="
                mint-label
                block
                mb-2
              "
            >
              {es ? "Zona horaria" : "Time zone"}
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
                mint-input
                w-full
                px-3
                py-2.5
              "
            >

              <optgroup label={es ? "América" : "Americas"}>
                <option value="America/Anchorage">Alaska</option>
                <option value="America/Los_Angeles">Pacific Time — Los Angeles / Vancouver</option>
                <option value="America/Tijuana">Tijuana / Baja California</option>
                <option value="America/Phoenix">Arizona</option>
                <option value="America/Hermosillo">Hermosillo / Sonora</option>
                <option value="America/Denver">Mountain Time — Denver</option>
                <option value="America/Chicago">Central Time — Chicago</option>
                <option value="America/Mexico_City">Mexico City</option>
                <option value="America/New_York">Eastern Time — New York / Toronto</option>
                <option value="America/Halifax">Atlantic Time — Halifax</option>
                <option value="America/St_Johns">Newfoundland — St. John's</option>
                <option value="America/Bogota">Bogotá / Lima / Quito</option>
                <option value="America/Caracas">Caracas</option>
                <option value="America/Santiago">Santiago</option>
                <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
                <option value="America/Sao_Paulo">São Paulo</option>
              </optgroup>

              <optgroup label={es ? "Europa" : "Europe"}>
                <option value="Europe/London">London / Dublin</option>
                <option value="Europe/Lisbon">Lisbon</option>
                <option value="Europe/Madrid">Madrid / Paris / Berlin / Rome</option>
                <option value="Europe/Athens">Athens / Helsinki / Bucharest</option>
                <option value="Europe/Istanbul">Istanbul</option>
                <option value="Europe/Moscow">Moscow</option>
              </optgroup>

              <optgroup label={es ? "África" : "Africa"}>
                <option value="Africa/Casablanca">Casablanca</option>
                <option value="Africa/Cairo">Cairo</option>
                <option value="Africa/Johannesburg">Johannesburg</option>
                <option value="Africa/Nairobi">Nairobi</option>
              </optgroup>

              <optgroup label={es ? "Asia" : "Asia"}>
                <option value="Asia/Dubai">Dubai / Abu Dhabi</option>
                <option value="Asia/Karachi">Karachi</option>
                <option value="Asia/Kolkata">India — Kolkata / Mumbai / Delhi</option>
                <option value="Asia/Dhaka">Dhaka</option>
                <option value="Asia/Bangkok">Bangkok / Jakarta</option>
                <option value="Asia/Singapore">Singapore / Kuala Lumpur</option>
                <option value="Asia/Shanghai">China — Shanghai / Beijing</option>
                <option value="Asia/Hong_Kong">Hong Kong</option>
                <option value="Asia/Tokyo">Tokyo / Seoul</option>
              </optgroup>

              <optgroup label={es ? "Oceanía" : "Oceania"}>
                <option value="Australia/Perth">Perth</option>
                <option value="Australia/Adelaide">Adelaide</option>
                <option value="Australia/Sydney">Sydney / Melbourne</option>
                <option value="Pacific/Auckland">Auckland</option>
                <option value="Pacific/Honolulu">Honolulu</option>
              </optgroup>

              <optgroup label="UTC">
                <option value="UTC">UTC</option>
              </optgroup>

            </select>

          </div>

        </div>

      </div>

    </div>

  );

}