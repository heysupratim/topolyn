import {
  Router,
  Shield,
  Network,
  Wifi,
  Cpu,
  Laptop,
  Server,
  ServerCrash,
  Cloud,
  CloudCog,
  Globe,
  LucideIcon,
} from "lucide-react";

// Define item types interface
export interface ItemType {
  value: string;
  label: string;
  icon: LucideIcon;
}

// Define item types with their labels and icons
export const itemTypes: ItemType[] = [
  { value: "Router", label: "Router", icon: Router },
  { value: "Firewall", label: "Firewall", icon: Shield },
  { value: "Switch", label: "Switch", icon: Network },
  { value: "Access Point", label: "Access Point", icon: Wifi },
  {
    value: "Single Board Computer",
    label: "Single Board Computer",
    icon: Cpu,
  },
  { value: "Mini PC", label: "Mini PC", icon: Laptop },
  { value: "Tower Server", label: "Tower Server", icon: Server },
  { value: "Rack Server", label: "Rack Server", icon: ServerCrash },
  { value: "VPS", label: "VPS", icon: Cloud },
  { value: "Cloud Compute", label: "Cloud Compute", icon: CloudCog },
  { value: "ISP", label: "ISP", icon: Globe },
];
