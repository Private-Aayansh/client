export interface Service {
  id: number;
  service_name: string;
  description?: string;
  latitude: number;
  longitude: number;
  location: string;
  cost: number;
  status: number;
  h3_index: string;
  farmer_id: number;
  farmer_name: string;
  distance?: number;
}

export interface CreateServiceRequest {
  service_name: string;
  description?: string;
  latitude: number;
  longitude: number;
  cost: number;
  status?: number;
}

export interface NearbyServicesRequest {
  latitude: number;
  longitude: number;
  k: number;
}

export const SERVICE_TYPES = [
  { value: 'Tractor', label: 'Tractor Services', icon: '🚜' },
  { value: 'Thresher', label: 'Thresher Services', icon: '🌾' },
  { value: 'Harvester', label: 'Harvester Services', icon: '🚛' },
  { value: 'Irrigation', label: 'Irrigation Setup', icon: '💧' },
  { value: 'Plowing', label: 'Plowing Services', icon: '🔄' },
  { value: 'Seeding', label: 'Seeding Services', icon: '🌱' },
  { value: 'Fertilizer', label: 'Fertilizer Supply', icon: '🧪' },
  { value: 'Pesticide', label: 'Pesticide Services', icon: '🛡️' },
  { value: 'Transportation', label: 'Transportation', icon: '🚚' },
  { value: 'Storage', label: 'Storage Services', icon: '🏪' },
  { value: 'End-to-End Contract', label: 'End-to-End Contract', icon: '📋' },
  { value: 'Other', label: 'Other Services', icon: '⚙️' },
];