
import { Project } from "@/types";

export const sampleProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Website Redesign",
    clientName: "Fashion Boutique Inc.",
    description: "Complete redesign of the client's e-commerce platform with new product catalog and checkout flow.",
    url: "https://fashionboutique.com",
    credentials: {
      username: "admin",
      password: "securepass123"
    },
    hosting: {
      provider: "AWS",
      credentials: {
        username: "aws-admin",
        password: "aws-secure-password"
      },
      url: "https://aws.amazon.com/console"
    },
    otherAccess: [
      {
        id: "access-1",
        type: "email",
        name: "Marketing Email",
        credentials: {
          username: "marketing@fashionboutique.com",
          password: "emailpass123"
        }
      },
      {
        id: "access-2",
        type: "ftp",
        name: "Media Files FTP",
        credentials: {
          username: "ftpuser",
          password: "ftppass456"
        }
      }
    ],
    startDate: new Date("2023-03-15"),
    endDate: new Date("2023-06-30"),
    price: 12000,
    payments: [
      {
        id: "payment-1",
        amount: 4000,
        date: new Date("2023-03-15"),
        description: "Initial payment (30%)",
        status: "completed"
      },
      {
        id: "payment-2",
        amount: 4000,
        date: new Date("2023-05-01"),
        description: "Mid-project payment (30%)",
        status: "completed"
      },
      {
        id: "payment-3",
        amount: 4000,
        date: new Date("2023-06-30"),
        description: "Final payment (40%)",
        status: "pending"
      }
    ],
    status: "active",
    notes: "Client requested additional animations on product pages.",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-06-25")
  },
  {
    id: "2",
    name: "Corporate Website",
    clientName: "Tech Solutions Ltd.",
    description: "Development of a new corporate website with blog and case studies section.",
    url: "https://techsolutions.com",
    credentials: {
      username: "techadmin",
      password: "techpass789"
    },
    hosting: {
      provider: "Digital Ocean",
      credentials: {
        username: "do-admin",
        password: "do-secure-password"
      },
      url: "https://cloud.digitalocean.com"
    },
    otherAccess: [
      {
        id: "access-3",
        type: "cms",
        name: "WordPress Admin",
        credentials: {
          username: "wp-admin",
          password: "wp-password"
        }
      }
    ],
    startDate: new Date("2023-01-10"),
    endDate: new Date("2023-03-25"),
    price: 8500,
    payments: [
      {
        id: "payment-4",
        amount: 2125,
        date: new Date("2023-01-10"),
        description: "25% upfront",
        status: "completed"
      },
      {
        id: "payment-5",
        amount: 6375,
        date: new Date("2023-03-25"),
        description: "75% upon completion",
        status: "completed"
      }
    ],
    status: "completed",
    createdAt: new Date("2023-01-05"),
    updatedAt: new Date("2023-03-25")
  },
  {
    id: "3",
    name: "Mobile App Development",
    clientName: "Health Tracker Inc.",
    description: "iOS and Android mobile application for health tracking and fitness.",
    url: "https://apps.apple.com/healthtracker",
    credentials: {
      username: "appadmin",
      password: "apppass321"
    },
    hosting: {
      provider: "Firebase",
      credentials: {
        username: "firebase-admin",
        password: "firebase-secure-password"
      },
      url: "https://console.firebase.google.com"
    },
    otherAccess: [
      {
        id: "access-4",
        type: "other",
        name: "App Store Connect",
        credentials: {
          username: "appstore@healthtracker.com",
          password: "appstore-password"
        }
      },
      {
        id: "access-5",
        type: "other",
        name: "Google Play Console",
        credentials: {
          username: "playstore@healthtracker.com",
          password: "playstore-password"
        }
      }
    ],
    startDate: new Date("2023-05-01"),
    price: 25000,
    payments: [
      {
        id: "payment-6",
        amount: 7500,
        date: new Date("2023-05-01"),
        description: "30% upfront",
        status: "completed"
      }
    ],
    status: "active",
    createdAt: new Date("2023-04-25"),
    updatedAt: new Date("2023-06-28")
  }
];
