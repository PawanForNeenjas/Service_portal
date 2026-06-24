import type { DomainState } from "../types/domain";
import { customers } from "./customers";
import { dealers } from "./dealers";
import { notifications } from "./notifications";
import { products } from "./products";
import { replacements } from "./replacements";
import { returns } from "./returns";
import { tickets } from "./tickets";
import { users } from "./users";
import { warranties } from "./warranties";

export const domainSeed: DomainState = {
  users,
  customers,
  dealers,
  products,
  warranties,
  tickets,
  replacements,
  returns,
  notifications,
};
