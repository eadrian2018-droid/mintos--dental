import Consentimientos from "./consentimientos/Consentimientos";
import GarantiasCuidados from "./garantias/GarantiasCuidados";
import RecetasMedicas from "./recetas/RecetasMedicas";
import JustificantesMedicos from "./justificantes/JustificantesMedicos";

export type ModuloDocumento =
  | "consent"
  | "warranty"
  | "prescription"
  | "certificate";

type DocumentosRouterProps = {
  modulo: ModuloDocumento;
  onBack: () => void;
};

export default function DocumentosRouter({
  modulo,
  onBack,
}: DocumentosRouterProps) {
  switch (modulo) {
    case "consent":
      return <Consentimientos onBack={onBack} />;

    case "warranty":
      return <GarantiasCuidados onBack={onBack} />;

    case "prescription":
      return <RecetasMedicas onBack={onBack} />;

    case "certificate":
      return <JustificantesMedicos onBack={onBack} />;
  }
}