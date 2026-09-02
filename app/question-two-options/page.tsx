import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Choose an answer — Same Page",
  description: "Choose the answer that best represents your perspective.",
};

export default function QuestionTwoOptionsPage() {
  return <RoomRuntime mode="options" />;
}
