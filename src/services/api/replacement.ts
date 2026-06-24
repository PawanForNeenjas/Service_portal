import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import { getVisibleReplacements } from "./access";

export function useReplacementService() {
  const { user } = useAuth();
  const { state } = useDomainData();
  const replacements = getVisibleReplacements(state.replacements, state.tickets, state.products, user);

  return {
    replacements,
    getReplacementByTicketId: (ticketId: string) =>
      replacements.find((replacement) => replacement.ticketId === ticketId),
  };
}
