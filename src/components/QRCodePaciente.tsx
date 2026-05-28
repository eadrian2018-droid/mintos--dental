import QRCode from "react-qr-code";

export default function QRCodePaciente() {

  const urlFormulario =

    "https://mintos-dental.vercel.app/registro-paciente";

  return (

    <div
      className="
        min-h-[80vh]
        flex
        items-center
        justify-center
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-10
          flex
          flex-col
          items-center
          max-w-xl
          w-full
        "
      >

        <div className="
          text-center
          mb-8
        ">

          <h1
            className="
              text-4xl
              font-bold
              text-teal-600
              mb-3
            "
          >
            MintOS
          </h1>

          <h2
            className="
              text-2xl
              font-bold
              text-gray-800
              mb-3
            "
          >
            Historial Clínico Digital
          </h2>

          <p
            className="
              text-gray-500
              leading-relaxed
            "
          >
            Escanee el código QR desde su celular
            para llenar el historial clínico
            antes de su consulta.
          </p>

        </div>

        <div
          className="
            bg-white
            p-6
            rounded-3xl
            shadow-inner
          "
        >

          <QRCode

            value={urlFormulario}

            size={300}

          />

        </div>

        <div className="
          mt-6
          bg-slate-100
          p-3
          rounded-2xl
          text-sm
          break-all
          text-center
          text-slate-600
          w-full
        ">

          {urlFormulario}

        </div>

        <button

          onClick={() => {

            navigator.clipboard.writeText(
              urlFormulario
            );

            alert(
              "Link copiado"
            );

          }}

          className="
            mt-6
            bg-teal-600
            hover:bg-teal-700
            text-white
            px-6
            py-3
            rounded-2xl
            font-bold
            transition-all
          "
        >

          Copiar Link

        </button>

      </div>

    </div>

  );

}