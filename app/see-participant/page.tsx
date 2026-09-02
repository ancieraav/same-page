import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Participant responses — Same Page",
  description: "Review participant responses from a Same Page room.",
};

export default function SeeParticipantPage() {
  return <RoomRuntime mode="participants" />;
}
