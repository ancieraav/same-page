import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Waiting room — Same Page",
  description: "Wait for everyone to join your Same Page room.",
};

export default function WaitingRoomPage() {
  return <RoomRuntime mode="waiting" />;
}
