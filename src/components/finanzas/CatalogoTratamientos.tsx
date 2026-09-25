import { useState } from "react";

import { useLanguage }
  from "../../context/LanguageContext";

import type {
  Doctor,
} from "../../types/Doctor";

import type {
  TratamientoCatalogo,
  TratamientoMaestro,
  TipoTratamiento,
} from "../../types/TratamientoCatalogo";

type CatalogoTratamientosProps = {

  doctores: Doctor[];

  catalogoTratamientos:
    TratamientoCatalogo[];

  catalogoMaestroTratamientos:
    TratamientoMaestro[];

  guardarTratamientoCatalogo:
    (
      tratamiento:
        Omit<
          TratamientoCatalogo,
          "id"
        >
    ) => Promise<void>;

  actualizarTratamientoCatalogo:
    (
      id: number,
      cambios:
        Partial<
          Omit<
            TratamientoCatalogo,
            "id"
          >
        >
    ) => Promise<void>;

  cambiarEstadoTratamientoCatalogo:
    (
      id: number,
      activo: boolean
    ) => Promise<void>;

};

export default function CatalogoTratamientos({

  doctores,

  catalogoTratamientos,

  catalogoMaestroTratamientos,

  guardarTratamientoCatalogo,

  actualizarTratamientoCatalogo,

  cambiarEstadoTratamientoCatalogo,

}: CatalogoTratamientosProps) {

  const { language } = useLanguage();

  const es = language === "es";

  function traducirCategoria(
    categoriaTratamiento: string
  ) {

    const traducciones: Record<
      string,
      string
    > = es
      ? {
          Preventive: "Preventivo",
          Restorative: "Restaurativo",
          Endodontics: "Endodoncia",
          Periodontics: "Periodoncia",
          Surgery: "Cirugía",
          Prosthodontics: "Prótesis",
          Implants: "Implantes",
          Orthodontics: "Ortodoncia",
          Cosmetic: "Estética",
          Diagnostic: "Diagnóstico",
          Other: "Otro",
        }
      : {};

    return (
      traducciones[
        categoriaTratamiento
      ] ??
      categoriaTratamiento
    );

  }

  const [
    tratamientoMaestroId,
    setTratamientoMaestroId,
  ] = useState("");

  const [
    esPersonalizado,
    setEsPersonalizado,
  ] = useState(false);

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    nombreEn,
    setNombreEn,
  ] = useState("");

  const [
    categoria,
    setCategoria,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] = useState<TipoTratamiento>(
    "clinica"
  );

  const [
    precioMXN,
    setPrecioMXN,
  ] = useState("");

  const [
    precioUSD,
    setPrecioUSD,
  ] = useState("");

  const [
    costoEspecialistaMXN,
    setCostoEspecialistaMXN,
  ] = useState("");

  const [
    costoEspecialistaUSD,
    setCostoEspecialistaUSD,
  ] = useState("");

  const [
    doctorId,
    setDoctorId,
  ] = useState("");

  const [
    tratamientoEditandoId,
    setTratamientoEditandoId,
  ] = useState<number | null>(
    null
  );

  const [
    modalEdicionAbierto,
    setModalEdicionAbierto,
  ] = useState(false);

  function limpiarFormulario() {

    setTratamientoMaestroId("");

    setEsPersonalizado(false);

    setNombre("");

    setNombreEn("");

    setCategoria("");

    setTipo(
      "clinica"
    );

    setPrecioMXN("");

    setPrecioUSD("");

    setCostoEspecialistaMXN("");

    setCostoEspecialistaUSD("");

    setDoctorId("");

    setTratamientoEditandoId(
      null
    );

    setModalEdicionAbierto(false);

  }

  async function guardar() {

    if (!tratamientoMaestroId && !esPersonalizado) {

      window.alert(
        es
          ? "Selecciona un tratamiento del catálogo maestro o elige tratamiento personalizado."
          : "Select a treatment from the master catalog or choose custom treatment."
      );

      return;

    }

    if (!nombre.trim()) {

      window.alert(
        es
          ? "Ingresa el nombre del tratamiento."
          : "Enter the treatment name."
      );

      return;

    }

    if (esPersonalizado && !nombreEn.trim()) {

      window.alert(
        es
          ? "Ingresa también el nombre del tratamiento en inglés."
          : "Also enter the treatment name in English."
      );

      return;

    }

    if (!categoria.trim()) {

      window.alert(
        es
          ? "Selecciona una categoría."
          : "Select a category."
      );

      return;

    }

    const datosTratamiento = {

      nombre:
        nombre.trim(),

      nombre_en:
        nombreEn.trim() || null,

      tratamiento_maestro_id:
        tratamientoMaestroId
          ? Number(tratamientoMaestroId)
          : null,

      categoria:
        categoria.trim(),

      tipo,

      precio_mxn:
        Number(
          precioMXN || 0
        ),

      precio_usd:
        Number(
          precioUSD || 0
        ),

      costo_especialista_mxn:
        tipo === "especialista"
          ? Number(
              costoEspecialistaMXN || 0
            )
          : 0,

      costo_especialista_usd:
        tipo === "especialista"
          ? Number(
              costoEspecialistaUSD || 0
            )
          : 0,

      doctor_id:
        tipo === "especialista"
          && doctorId

          ? Number(
              doctorId
            )

          : null,

      activo: true,

    };

    if (
      tratamientoEditandoId !==
      null
    ) {

      const tratamientoActual =
        catalogoTratamientos.find(
          (tratamiento) =>
            tratamiento.id ===
            tratamientoEditandoId
        );

      await actualizarTratamientoCatalogo(

        tratamientoEditandoId,

        {
          ...datosTratamiento,

          activo:
            tratamientoActual
              ?.activo ?? true,
        }

      );

    } else {

      await guardarTratamientoCatalogo(
        datosTratamiento
      );

    }

    limpiarFormulario();

  }

  function editarTratamiento(
    tratamiento:
      TratamientoCatalogo
  ) {

    setTratamientoEditandoId(
      tratamiento.id
    );

    setTratamientoMaestroId(
      tratamiento.tratamiento_maestro_id
        ? String(tratamiento.tratamiento_maestro_id)
        : ""
    );

    setEsPersonalizado(
      !tratamiento.tratamiento_maestro_id
    );

    setNombre(
      tratamiento.nombre
    );

    setNombreEn(
      tratamiento.nombre_en ?? ""
    );

    setCategoria(
      tratamiento.categoria
    );

    setTipo(
      tratamiento.tipo
    );

    setPrecioMXN(
      String(
        tratamiento.precio_mxn ?? 0
      )
    );

    setPrecioUSD(
      String(
        tratamiento.precio_usd ?? 0
      )
    );

    setCostoEspecialistaMXN(
      String(
        tratamiento
          .costo_especialista_mxn ??
        0
      )
    );

    setCostoEspecialistaUSD(
      String(
        tratamiento
          .costo_especialista_usd ??
        0
      )
    );

    setDoctorId(
      tratamiento.doctor_id
        ? String(
            tratamiento.doctor_id
          )
        : ""
    );

    setModalEdicionAbierto(true);

  }

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          mint-card
          p-6
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            mint-text-primary
          "
        >

          {es ? "Catálogo de Tratamientos" : "Treatment Catalog"}

        </h2>

        <p
          className="
            mint-text-secondary
            mt-1
          "
        >

          {es ? "Configura precios de clínica y precios de especialistas" : "Configure clinic prices and specialist prices"}

        </p>

      </div>

      <div
        className="
          mint-card
          p-6
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            gap-4
            mb-6
          "
        >

          <h3
            className="
              text-xl
              font-bold
              mint-text-primary
            "
          >

            {es ? "Nuevo Tratamiento" : "New Treatment"}

          </h3>



        </div>

        <div
          className="
            grid
            md:grid-cols-2
            gap-4
          "
        >

          <select
            value={
              esPersonalizado
                ? "__custom__"
                : tratamientoMaestroId
            }
            onChange={(e) => {

              const valor =
                e.target.value;

              if (valor === "__custom__") {

                setEsPersonalizado(true);
                setTratamientoMaestroId("");
                setNombre("");
                setNombreEn("");
                setCategoria("");

                return;

              }

              setEsPersonalizado(false);
              setTratamientoMaestroId(valor);

              const maestro =
                catalogoMaestroTratamientos.find(
                  (item) =>
                    item.id === Number(valor)
                );

              if (maestro) {

                setNombre(
                  maestro.nombre_es
                );

                setNombreEn(
                  maestro.nombre_en
                );

                setCategoria(
                  maestro.categoria
                );

              } else {

                setNombre("");
                setNombreEn("");
                setCategoria("");

              }

            }}
            className="
              mint-input
              w-full
              p-3
              md:col-span-2
            "
          >

            <option value="">
              {es ? "Seleccionar tratamiento" : "Select treatment"}
            </option>

            {
              catalogoMaestroTratamientos.map(
                (tratamiento) => (

                  <option
                    key={
                      tratamiento.id
                    }
                    value={
                      tratamiento.id
                    }
                  >
                    {
                      es
                        ? tratamiento.nombre_es
                        : tratamiento.nombre_en
                    }
                    {" — "}
                    {
                      traducirCategoria(
                        tratamiento.categoria
                      )
                    }
                  </option>

                )
              )
            }

            <option value="__custom__">
              {es ? "+ Tratamiento personalizado" : "+ Custom treatment"}
            </option>

          </select>

          {
            esPersonalizado

            ? (

              <>

                <input
                  type="text"
                  placeholder={es ? "Nombre en español" : "Spanish name"}
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
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
                  placeholder={es ? "Nombre en inglés" : "English name"}
                  value={nombreEn}
                  onChange={(e) =>
                    setNombreEn(
                      e.target.value
                    )
                  }
                  className="
                    mint-input
                    w-full
                    p-3
                  "
                />

                <select
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(
                      e.target.value
                    )
                  }
                  className="
                    mint-input
                    w-full
                    p-3
                    md:col-span-2
                  "
                >

                  <option value="">
                    {es ? "Seleccionar categoría" : "Select category"}
                  </option>

                  <option value="Preventive">
                    {es ? "Preventivo" : "Preventive"}
                  </option>

                  <option value="Restorative">
                    {es ? "Restaurativo" : "Restorative"}
                  </option>

                  <option value="Endodontics">
                    {es ? "Endodoncia" : "Endodontics"}
                  </option>

                  <option value="Periodontics">
                    {es ? "Periodoncia" : "Periodontics"}
                  </option>

                  <option value="Surgery">
                    {es ? "Cirugía" : "Surgery"}
                  </option>

                  <option value="Prosthodontics">
                    {es ? "Prótesis" : "Prosthodontics"}
                  </option>

                  <option value="Implants">
                    {es ? "Implantes" : "Implants"}
                  </option>

                  <option value="Orthodontics">
                    {es ? "Ortodoncia" : "Orthodontics"}
                  </option>

                  <option value="Cosmetic">
                    {es ? "Estética" : "Cosmetic"}
                  </option>

                  <option value="Diagnostic">
                    {es ? "Diagnóstico" : "Diagnostic"}
                  </option>

                  <option value="Pediatric">
                    {es ? "Odontopediatría" : "Pediatric"}
                  </option>

                  <option value="Other">
                    {es ? "Otro" : "Other"}
                  </option>

                </select>

              </>

            )

            : tratamientoMaestroId

              ? (

                <>

                  <div
                    className="
                      mint-card
                      p-4
                    "
                  >
                    <p className="text-xs font-semibold mint-text-muted">
                      {es ? "Tratamiento" : "Treatment"}
                    </p>

                    <p className="mt-1 font-semibold mint-text-primary">
                      {es ? nombre : nombreEn}
                    </p>
                  </div>

                  <div
                    className="
                      mint-card
                      p-4
                    "
                  >
                    <p className="text-xs font-semibold mint-text-muted">
                      {es ? "Categoría" : "Category"}
                    </p>

                    <p className="mt-1 font-semibold mint-text-primary">
                      {traducirCategoria(categoria)}
                    </p>
                  </div>

                </>

              )

              : null
          }

          <input
            type="number"
            placeholder={es ? "Precio clínica MXN" : "Clinic price MXN"}
            value={precioMXN}
            onChange={(e) =>
              setPrecioMXN(
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
            placeholder={es ? "Precio clínica USD" : "Clinic price USD"}
            value={precioUSD}
            onChange={(e) =>
              setPrecioUSD(
                e.target.value
              )
            }
            className="
              mint-input
              w-full
              p-3
            "
          />

          <select
            value={doctorId}
            onChange={(e) => {

              const nuevoDoctorId =
                e.target.value;

              setDoctorId(
                nuevoDoctorId
              );

              if (nuevoDoctorId) {

                setTipo(
                  "especialista"
                );

              } else {

                setTipo(
                  "clinica"
                );

                setCostoEspecialistaMXN(
                  ""
                );

                setCostoEspecialistaUSD(
                  ""
                );

              }

            }}
            className="
              mint-input
              w-full
              p-3
              md:col-span-2
            "
          >

            <option value="">

              {es
                ? "Sin especialista — tratamiento de clínica"
                : "No specialist — clinic treatment"}

            </option>

            {
              doctores.map(
                (doctor) => (

                  <option
                    key={
                      doctor.id
                    }
                    value={
                      doctor.id
                    }
                  >

                    {doctor.nombre}

                  </option>

                )
              )
            }

          </select>

          {
            tipo ===
            "especialista"

            &&

            <>

              <input
                type="number"
                placeholder={es ? "Precio especialista MXN" : "Specialist price MXN"}
                value={
                  costoEspecialistaMXN
                }
                onChange={(e) =>
                  setCostoEspecialistaMXN(
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
                placeholder={es ? "Precio especialista USD" : "Specialist price USD"}
                value={
                  costoEspecialistaUSD
                }
                onChange={(e) =>
                  setCostoEspecialistaUSD(
                    e.target.value
                  )
                }
                className="
                  mint-input
                  w-full
                  p-3
                "
              />

            </>
          }

          <button
            onClick={
              guardar
            }
            className="
              mint-btn
              mint-btn-primary
              md:col-span-2
              justify-center
            "
          >

            {es ? "Guardar tratamiento" : "Save treatment"}

          </button>

        </div>

      </div>

      <div
        className="
          mint-card
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mint-text-primary
            mb-6
          "
        >

          {es ? "Tratamientos Configurados" : "Configured Treatments"}

        </h3>

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

                  {es ? "Tratamiento" : "Treatment"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Categoría" : "Category"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Tipo" : "Type"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Precio MXN" : "Price MXN"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Precio USD" : "Price USD"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Precio Especialista MXN" : "Specialist Price MXN"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Precio Especialista USD" : "Specialist Price USD"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Estado" : "Status"}

                </th>

                <th className="p-3 text-left">

                  {es ? "Acción" : "Action"}

                </th>

              </tr>

            </thead>

            <tbody>

              {
                catalogoTratamientos.map(
                  (tratamiento) => (

                    <tr
                      key={
                        tratamiento.id
                      }
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

                        {
                          es
                            ? tratamiento.nombre
                            : tratamiento.nombre_en ||
                              catalogoMaestroTratamientos.find(
                                (maestro) =>
                                  maestro.id ===
                                  tratamiento.tratamiento_maestro_id
                              )?.nombre_en ||
                              tratamiento.nombre
                        }

                      </td>

                      <td className="p-3">

                        <span
                          className="
                            mint-badge
                            mint-badge-muted
                          "
                        >

                          {
                            traducirCategoria(
                              tratamiento.categoria
                            )
                          }

                        </span>

                      </td>

                      <td className="p-3">

                        <span
                          className={`
                            mint-badge

                            ${
                              tratamiento.tipo ===
                              "clinica"

                                ? "mint-badge-primary"

                                : "mint-badge-accent"
                            }
                          `}
                        >

                          {
                            tratamiento.tipo ===
                            "clinica"

                              ? es ? "Clínica" : "Clinic"

                              : es ? "Especialista" : "Specialist"
                          }

                        </span>

                      </td>

                      <td
                        className="
                          p-3
                          font-medium
                          mint-text-primary
                        "
                      >

                        $

                        {
                          Number(
                            tratamiento
                              .precio_mxn ||
                            0
                          ).toLocaleString()
                        }

                      </td>

                      <td
                        className="
                          p-3
                          font-medium
                          mint-text-primary
                        "
                      >

                        $

                        {
                          Number(
                            tratamiento
                              .precio_usd ||
                            0
                          ).toLocaleString()
                        }

                      </td>

                      <td
                        className="
                          p-3
                          mint-text-secondary
                        "
                      >

                        {
                          tratamiento.tipo ===
                          "especialista"

                            ? `$${Number(
                                tratamiento
                                  .costo_especialista_mxn ||
                                0
                              ).toLocaleString()}`

                            : "-"
                        }

                      </td>

                      <td
                        className="
                          p-3
                          mint-text-secondary
                        "
                      >

                        {
                          tratamiento.tipo ===
                          "especialista"

                            ? `$${Number(
                                tratamiento
                                  .costo_especialista_usd ||
                                0
                              ).toLocaleString()}`

                            : "-"
                        }

                      </td>

                      <td className="p-3">

                        <span
                          className={`
                            mint-badge

                            ${
                              tratamiento.activo

                                ? "mint-badge-success"

                                : "mint-badge-muted"
                            }
                          `}
                        >

                          {
                            tratamiento.activo
                              ? es ? "Activo" : "Active"
                              : es ? "Inactivo" : "Inactive"
                          }

                        </span>

                      </td>

                      <td className="p-3">

                        <div
                          className="
                            flex
                            gap-2
                            flex-wrap
                          "
                        >

                          <button
                            onClick={() =>
                              editarTratamiento(
                                tratamiento
                              )
                            }
                            className="
                              mint-btn
                              mint-btn-action
                              mint-btn-sm
                            "
                          >

                            {es ? "Editar" : "Edit"}

                          </button>

                          <button
                            onClick={() =>
                              cambiarEstadoTratamientoCatalogo(
                                tratamiento.id,
                                !tratamiento.activo
                              )
                            }
                            className="
                              mint-btn
                              mint-btn-neutral
                              mint-btn-sm
                            "
                          >

                            {
                              tratamiento.activo
                                ? es ? "Desactivar" : "Deactivate"
                                : es ? "Activar" : "Activate"
                            }

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

      {
        modalEdicionAbierto &&
        tratamientoEditandoId !== null && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              p-4
              bg-black/50
              backdrop-blur-sm
            "
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                limpiarFormulario();
              }
            }}
          >

            <div
              className="
                mint-card
                w-full
                max-w-3xl
                max-h-[90vh]
                overflow-y-auto
                shadow-2xl
              "
            >

              <div
                className="
                  sticky
                  top-0
                  z-10
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-6
                  py-5
                  border-b
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                "
              >

                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[var(--mint-primary)]
                    "
                  >
                    {es ? "Tratamiento configurado" : "Configured treatment"}
                  </p>

                  <h3
                    className="
                      mt-1
                      text-xl
                      font-bold
                      mint-text-primary
                    "
                  >
                    {es ? "Editar Tratamiento" : "Edit Treatment"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="
                    mint-btn
                    mint-btn-ghost
                    px-3
                    py-2
                    text-xl
                    leading-none
                  "
                  aria-label={es ? "Cerrar" : "Close"}
                >
                  ×
                </button>

              </div>

              <div className="p-6">

                <div
                  className="
                    grid
                    md:grid-cols-2
                    gap-4
                  "
                >

                  <select
                    value={
                      esPersonalizado
                        ? "__custom__"
                        : tratamientoMaestroId
                    }
                    onChange={(e) => {

                      const valor =
                        e.target.value;

                      if (valor === "__custom__") {

                        setEsPersonalizado(true);
                        setTratamientoMaestroId("");
                        setNombre("");
                        setNombreEn("");
                        setCategoria("");

                        return;
                      }

                      setEsPersonalizado(false);
                      setTratamientoMaestroId(valor);

                      const maestro =
                        catalogoMaestroTratamientos.find(
                          (item) =>
                            item.id === Number(valor)
                        );

                      if (maestro) {

                        setNombre(
                          maestro.nombre_es
                        );

                        setNombreEn(
                          maestro.nombre_en
                        );

                        setCategoria(
                          maestro.categoria
                        );

                      } else {

                        setNombre("");
                        setNombreEn("");
                        setCategoria("");
                      }

                    }}
                    className="
                      mint-input
                      w-full
                      p-3
                      md:col-span-2
                    "
                  >

                    <option value="">
                      {es ? "Seleccionar tratamiento" : "Select treatment"}
                    </option>

                    {
                      catalogoMaestroTratamientos.map(
                        (tratamiento) => (

                          <option
                            key={tratamiento.id}
                            value={tratamiento.id}
                          >
                            {
                              es
                                ? tratamiento.nombre_es
                                : tratamiento.nombre_en
                            }
                            {" — "}
                            {
                              traducirCategoria(
                                tratamiento.categoria
                              )
                            }
                          </option>

                        )
                      )
                    }

                    <option value="__custom__">
                      {es ? "+ Tratamiento personalizado" : "+ Custom treatment"}
                    </option>

                  </select>

                  {
                    esPersonalizado

                      ? (

                        <>

                          <input
                            type="text"
                            placeholder={es ? "Nombre en español" : "Spanish name"}
                            value={nombre}
                            onChange={(e) =>
                              setNombre(
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
                            placeholder={es ? "Nombre en inglés" : "English name"}
                            value={nombreEn}
                            onChange={(e) =>
                              setNombreEn(
                                e.target.value
                              )
                            }
                            className="
                              mint-input
                              w-full
                              p-3
                            "
                          />

                          <select
                            value={categoria}
                            onChange={(e) =>
                              setCategoria(
                                e.target.value
                              )
                            }
                            className="
                              mint-input
                              w-full
                              p-3
                              md:col-span-2
                            "
                          >

                            <option value="">
                              {es ? "Seleccionar categoría" : "Select category"}
                            </option>

                            <option value="Preventive">
                              {es ? "Preventivo" : "Preventive"}
                            </option>
                            <option value="Restorative">
                              {es ? "Restaurativo" : "Restorative"}
                            </option>
                            <option value="Endodontics">
                              {es ? "Endodoncia" : "Endodontics"}
                            </option>
                            <option value="Periodontics">
                              {es ? "Periodoncia" : "Periodontics"}
                            </option>
                            <option value="Surgery">
                              {es ? "Cirugía" : "Surgery"}
                            </option>
                            <option value="Prosthodontics">
                              {es ? "Prótesis" : "Prosthodontics"}
                            </option>
                            <option value="Implants">
                              {es ? "Implantes" : "Implants"}
                            </option>
                            <option value="Orthodontics">
                              {es ? "Ortodoncia" : "Orthodontics"}
                            </option>
                            <option value="Cosmetic">
                              {es ? "Estética" : "Cosmetic"}
                            </option>
                            <option value="Diagnostic">
                              {es ? "Diagnóstico" : "Diagnostic"}
                            </option>
                            <option value="Pediatric">
                              {es ? "Odontopediatría" : "Pediatric"}
                            </option>
                            <option value="Other">
                              {es ? "Otro" : "Other"}
                            </option>

                          </select>

                        </>

                      )

                      : tratamientoMaestroId

                        ? (

                          <>

                            <div className="mint-card p-4">
                              <p className="text-xs font-semibold mint-text-muted">
                                {es ? "Tratamiento" : "Treatment"}
                              </p>
                              <p className="mt-1 font-semibold mint-text-primary">
                                {es ? nombre : nombreEn}
                              </p>
                            </div>

                            <div className="mint-card p-4">
                              <p className="text-xs font-semibold mint-text-muted">
                                {es ? "Categoría" : "Category"}
                              </p>
                              <p className="mt-1 font-semibold mint-text-primary">
                                {traducirCategoria(categoria)}
                              </p>
                            </div>

                          </>

                        )

                        : null
                  }

                  <input
                    type="number"
                    placeholder={es ? "Precio clínica MXN" : "Clinic price MXN"}
                    value={precioMXN}
                    onChange={(e) =>
                      setPrecioMXN(
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
                    placeholder={es ? "Precio clínica USD" : "Clinic price USD"}
                    value={precioUSD}
                    onChange={(e) =>
                      setPrecioUSD(
                        e.target.value
                      )
                    }
                    className="
                      mint-input
                      w-full
                      p-3
                    "
                  />

                  <select
                    value={doctorId}
                    onChange={(e) => {

                      const nuevoDoctorId =
                        e.target.value;

                      setDoctorId(
                        nuevoDoctorId
                      );

                      if (nuevoDoctorId) {

                        setTipo(
                          "especialista"
                        );

                      } else {

                        setTipo(
                          "clinica"
                        );

                        setCostoEspecialistaMXN(
                          ""
                        );

                        setCostoEspecialistaUSD(
                          ""
                        );
                      }

                    }}
                    className="
                      mint-input
                      w-full
                      p-3
                      md:col-span-2
                    "
                  >

                    <option value="">
                      {es
                        ? "Sin especialista — tratamiento de clínica"
                        : "No specialist — clinic treatment"}
                    </option>

                    {
                      doctores.map(
                        (doctor) => (

                          <option
                            key={doctor.id}
                            value={doctor.id}
                          >
                            {doctor.nombre}
                          </option>

                        )
                      )
                    }

                  </select>

                  {
                    tipo === "especialista" && (

                      <>

                        <input
                          type="number"
                          placeholder={es ? "Precio especialista MXN" : "Specialist price MXN"}
                          value={costoEspecialistaMXN}
                          onChange={(e) =>
                            setCostoEspecialistaMXN(
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
                          placeholder={es ? "Precio especialista USD" : "Specialist price USD"}
                          value={costoEspecialistaUSD}
                          onChange={(e) =>
                            setCostoEspecialistaUSD(
                              e.target.value
                            )
                          }
                          className="
                            mint-input
                            w-full
                            p-3
                          "
                        />

                      </>

                    )
                  }

                </div>

              </div>

              <div
                className="
                  sticky
                  bottom-0
                  flex
                  justify-end
                  gap-3
                  px-6
                  py-4
                  border-t
                  border-[var(--mint-border)]
                  bg-[var(--mint-bg-card)]
                "
              >

                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="
                    mint-btn
                    mint-btn-neutral
                    px-4
                    py-2.5
                  "
                >
                  {es ? "Cancelar" : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={guardar}
                  className="
                    mint-btn
                    mint-btn-primary
                    px-5
                    py-2.5
                  "
                >
                  {es ? "Guardar cambios" : "Save changes"}
                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );

}