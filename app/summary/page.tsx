import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Room summary — Same Page",
  description: "Review the outcome of a Same Page room.",
};

export default function SummaryPage() {
  return <RoomRuntime mode="summary" />;
}
