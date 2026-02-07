import { Helmet } from "react-helmet";
import { useQRScoutState } from "../store/store";

export function Header() {
  const page_title = useQRScoutState((state) => state.formData.page_title);

  return (
    <Helmet>
      {/* Browser tab title (browser handles dark/light automatically) */}
      <title>QRScout | {page_title}</title>

      {/* Dark-mode aware favicon (SVG) */}
     <link rel="icon" href="/QRScout/favicon-v2.svg" type="image/svg+xml" />
    </Helmet>
  );
}