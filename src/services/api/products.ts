import { useCallback, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDomainData } from "../../contexts/DomainDataContext";
import type { PortalProductConfigurationDto, PortalProductDetailDto, PortalProductSummaryDto } from "../../types/dto";
import { getVisibleProducts } from "./access";
import { apiRequest } from "./client";

export function useProductService() {
  const { user } = useAuth();
  const { state, getProductView } = useDomainData();
  const products = getVisibleProducts(state.products, user);
  const visibleProductIds = useMemo(() => new Set(products.map((product) => product.id)), [products]);
  const visibleCustomerIds = useMemo(() => new Set(products.map((product) => product.customerId)), [products]);
  const visibleDealerIds = useMemo(() => new Set(products.map((product) => product.dealerId)), [products]);
  const getVisibleProductView = useCallback(
    (productId: string) => (visibleProductIds.has(productId) ? getProductView(productId) : undefined),
    [getProductView, visibleProductIds],
  );

  const searchProducts = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      return products.filter((product) => {
        const view = getVisibleProductView(product.id);
        return `${product.serialNumber} ${product.model} ${product.productType} ${view?.customer?.name ?? ""}`
          .toLowerCase()
          .includes(normalized);
      });
    },
    [getVisibleProductView, products],
  );

  return {
    products,
    customers: state.customers.filter((customer) => visibleCustomerIds.has(customer.id)),
    dealers: state.dealers.filter((dealer) => user?.role === "CUSTOMER_SERVICE" || user?.role === "ADMIN" || visibleDealerIds.has(dealer.id)),
    notifications: state.notifications,
    getProductView: getVisibleProductView,
    searchProducts,
  };
}

export async function searchPortalProductBySerial(serialNumber: string) {
  return apiRequest<PortalProductDetailDto>(`/products/serial?serialNumber=${encodeURIComponent(serialNumber)}`);
}

export async function getPortalProductById(productId: string) {
  return apiRequest<PortalProductDetailDto>(`/products/${productId}`);
}

export async function listPortalProducts() {
  return apiRequest<PortalProductSummaryDto[]>("/products");
}

export async function listCustomerProductConfigurations() {
  return apiRequest<PortalProductConfigurationDto[]>("/products/configurations");
}
