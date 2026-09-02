import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Compare answers — Same Page",
  description: "Compare two perspectives in a Same Page room.",
};

export default function QuestionTwoPage() {
  return <RoomRuntime mode="compare" />;
}
