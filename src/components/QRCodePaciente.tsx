export default function QRCodePaciente() {

  const urlFormulario =
    "https://mintos-dental.vercel.app/#/registro-paciente";

  return (

    <div
      className="
        flex
        items-center
        justify-center
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          flex
          flex-col
          items-center
          w-full
        "
      >

        <h1
          className="
            text-3xl
            font-bold
            text-teal-600
            mb-2
          "
        >
          MintOS
        </h1>

        <h2
          className="
            text-xl
            font-bold
            text-gray-800
            mb-3
            text-center
          "
        >
          Historial Clínico Digital
        </h2>

        <p
          className="
            text-gray-500
            text-center
            text-sm
            leading-relaxed
            mb-6
          "
        >
          Escanee el código QR desde su celular
          para llenar el historial clínico.
        </p>

        <div
          className="
            bg-white
            p-4
            rounded-3xl
            shadow-inner
          "
        >

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
              urlFormulario
            )}`}
            alt="Código QR para registro de paciente"
            className="
              rounded-2xl
            "
          />

        </div>

        <a
          href={urlFormulario}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-6
            bg-teal-600
            hover:bg-teal-700
            text-white
            px-5
            py-3
            rounded-2xl
            font-bold
            transition-all
            text-sm
            w-full
            text-center
          "
        >
          Abrir formulario
        </a>

      </div>

    </div>

  );

}