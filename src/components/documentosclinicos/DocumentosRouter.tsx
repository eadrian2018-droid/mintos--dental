import GarantiasCuidados from "./garantias/GarantiasCuidados";
import RecetasMedicas from "./recetas/RecetasMedicas";
import JustificantesMedicos from "./justificantes/JustificantesMedicos";

export type ModuloDocumento =
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
    case "warranty":
      return <GarantiasCuidados onBack={onBack} />;

    case "prescription":
      return <RecetasMedicas onBack={onBack} />;

    case "certificate":
      return <JustificantesMedicos onBack={onBack} />;
  }
}