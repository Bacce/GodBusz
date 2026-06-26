import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import React from "react";
import "leaflet-routing-machine";

interface RoutingMachineProps {
  waypoints: L.LatLngExpression[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

const createRoutingMachineLayer = (props: RoutingMachineProps) => {
  return L.Routing.control({
    waypoints: props.waypoints,
    routeWhileDragging: true,
    routeDragInterval: 10,
    ...props.options,
  });
};

const RoutingMachine = createControlComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createRoutingMachineLayer as any,
) as React.ComponentType<RoutingMachineProps>;

export default RoutingMachine;
