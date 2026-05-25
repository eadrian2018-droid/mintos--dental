import QRCode from "react-qr-code";

export default function QRCodePaciente() {

  const urlFormulario =
    "https://mintos-dental-q77v-4w0x2ube6-eadrian2018-droids-projects.vercel.app/#/formulario";

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
        mb-10
        flex
        flex-col
        items-center
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          text-teal-700
          mb-6
          text-center
        "
      >

        Escanee para llenar historial clínico

      </h2>

      <QRCode
        value={urlFormulario}
        size={220}
      />

      <p
        className="
          mt-6
          text-gray-600
          text-center
        "
      >

        Escanee desde su celular
        <br />
        para llenar su historial clínico

      </p>

    </div>

  );

}