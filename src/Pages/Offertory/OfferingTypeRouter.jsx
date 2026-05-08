import { useParams, Navigate } from "react-router-dom";
import BagOffering from "./BagOffering";
import CoverOffering from "./CoverOffering";

const OfferingTypeRouter = () => {
  const { type } = useParams();

  if (type === "Bag") return <BagOffering />;
  if (type === "Cover") return <CoverOffering />;

  // safety fallback
  return <Navigate to="/admin/offertory/add-offerings" replace />;
};

export default OfferingTypeRouter;
