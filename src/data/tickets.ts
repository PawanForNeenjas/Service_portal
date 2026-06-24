import type { Ticket, TicketStatus } from "../types/domain";

export const ticketStages: TicketStatus[] = [
  "Created",
  "Under Review",
  "In Service",
  "Replacement Approved",
  "Dispatched",
  "Resolved",
  "Closed",
];

export const tickets: Ticket[] = [
  {
    id: "T001",
    odooHelpdeskTicketId: 9101,
    odooPartnerId: 5101,
    ticketNumber: "EU-330-20260610-001",
    productId: "P001",
    customerId: "C001",
    issueCategory: "Hardware issue",
    priority: "High",
    status: "Replacement Approved",
    createdAt: "2026-06-10",
    description: "Customer reports a hardware issue in the lower assembly.",
    attachmentNames: ["lower-assembly.jpg", "leak-video.mp4"],
    comments: [
      {
        id: "TC001",
        author: "Rohan Kapoor",
        message: "Replacement approved after invoice and product inspection.",
        createdAt: "2026-06-11",
      },
    ],
  },
  {
    id: "T002",
    odooHelpdeskTicketId: 9102,
    odooPartnerId: 5102,
    ticketNumber: "LV-740-20260608-001",
    productId: "P002",
    customerId: "C002",
    issueCategory: "Installation issue",
    priority: "Medium",
    status: "Under Review",
    createdAt: "2026-06-08",
    description: "Installation issue submitted for review.",
    attachmentNames: [],
    comments: [],
  },
  {
    id: "T003",
    odooHelpdeskTicketId: 9103,
    odooPartnerId: 5103,
    ticketNumber: "EU-330-20260602-001",
    productId: "P003",
    customerId: "C003",
    issueCategory: "Power issue",
    priority: "Low",
    status: "Closed",
    createdAt: "2026-06-02",
    description: "Power adapter replaced by dealer.",
    attachmentNames: ["adapter-photo.jpg"],
    comments: [
      {
        id: "TC002",
        author: "Priya Nair",
        message: "Issue resolved at dealer location.",
        createdAt: "2026-06-03",
      },
    ],
  },
];
