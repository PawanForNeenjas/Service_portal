# Neenjas Service Portal Backend

Production NestJS abstraction layer between the React portal and ODOO ERP.

## Architecture

React Frontend -> NestJS Backend -> ODOO ERP

ODOO is the only source of truth. This service does not use PostgreSQL, temporary databases, seed data, mock APIs, or local persistence.

## Required Environment

Copy `.env.example` to `.env` and provide production values:

```bash
ODOO_URL=
ODOO_DB=
ODOO_USERNAME=
ODOO_PASSWORD=
JWT_SECRET=
```

## Modules

- AuthModule
- ProductsModule
- WarrantyModule
- TicketsModule
- ReplacementModule
- ReturnsModule
- OdooModule

## ODOO Model Mapping

- Product: `product.product`
- Serial Number: `stock.production.lot`
- Customer: `res.partner`
- Warranty: custom warranty model, configured for future ODOO deployment
- Ticket: `helpdesk.ticket`
- Replacement: `stock.picking`
- Return: `stock.picking`

## Run

```bash
npm install
npm run start:dev
```
