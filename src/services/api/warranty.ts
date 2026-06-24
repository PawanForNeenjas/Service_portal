import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import type { CreateWarrantyDto } from "../../types/dto";
import { canCreateWarranty, getVisibleWarranties } from "./access";

export function useWarrantyService() {
  const { user } = useAuth();
  const { state, createWarranty } = useDomainData();
  const warranties = getVisibleWarranties(state.warranties, state.products, user);

  return {
    warranties,
    createWarranty: (input: CreateWarrantyDto) => {
      if (!canCreateWarranty(user)) {
        throw new Error("Current role cannot register warranties");
      }

      return createWarranty(input);
    },
    getWarrantyById: (warrantyId: string) => warranties.find((warranty) => warranty.id === warrantyId),
  };
}
