import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getStatusStyle(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-700";

    case "APPLIED":
      return "bg-gray-200 text-gray-800";

    case "SCREENING":
      return "bg-blue-100 text-blue-700";

    case "TECH":
      return "bg-purple-100 text-purple-700";

    case "ONSITE":
      return "bg-indigo-100 text-indigo-700";

    case "OFFER":
      return "bg-green-100 text-green-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "WITHDRAWN":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}
