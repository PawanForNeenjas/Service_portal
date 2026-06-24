import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import { getVisibleReturns } from "./access";

export function useReturnService() {
  const { user } = useAuth();
  const { state } = useDomainData();
  const returns = getVisibleReturns(state.returns, state.replacements, state.tickets, state.products, user);

  return {
    returns,
    getReturnByReplacementId: (replacementId: string) =>
      returns.find((shipment) => shipment.replacementId === replacementId),
  };
}
