import QRCode from "react-qr-code";

export default function QRCodePaciente() {

  return (

    <div
      className="
        bg-white
        rounded-3xl
        shadow-xl
        p-8
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
        value="https://mintos-dental.vercel.app/#/formulario"
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