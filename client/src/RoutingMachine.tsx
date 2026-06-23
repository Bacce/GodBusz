import L from "leaflet";
import { createControlComponent } from "@react-leaflet/core";
import "leaflet-routing-machine";

interface RoutingMachineProps {
  waypoints: L.LatLngExpression[];
  options?: any;
}

const createRoutingMachineLayer = (props: RoutingMachineProps) => {
  return L.Routing.control({
    waypoints: props.waypoints,
    ...props.options,
  });
};

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;
