import type { Metadata } from "next";
import { CreateRoomForm } from "./create-room-form";

export const metadata: Metadata = {
  title: "Create room — Same Page",
  description: "Configure a new Same Page room.",
};

export default function CreateRoomPage() {
  return <CreateRoomForm />;
}
