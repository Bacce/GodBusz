import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: RoutingOptions): RoutingControl;
    function osrmv1(options: { serviceUrl: string }): Router;
  }

  interface RoutingOptions {
    waypoints: L.LatLngExpression[];
    router?: Router;
    show?: boolean;
    routeWhileDragging?: boolean;
    routeDragInterval?: number;
    createMarker?: () => L.Marker | null;
    lineOptions?: {
      addWaypoints?: boolean;
      styles?: RoutingLineOptions[];
    };
    [key: string]: unknown;
  }

  interface Router {
    route: (
      waypoints: L.LatLngExpression[],
      callback: (route: any) => void,
      options?: any,
    ) => void;
    // Add other methods if known, otherwise use any/unknown
  }

  interface RoutingLineOptions {
    color: string;
    opacity: number;
    weight: number;
    // Add other properties if known
  }

  class RoutingControl extends L.Control {
    setWaypoints(waypoints: L.LatLngExpression[]): void;
    // Add other methods if needed
  }
}
