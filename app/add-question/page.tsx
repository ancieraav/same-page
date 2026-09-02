import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Add a question — Same Page",
  description: "Add the next question to your Same Page room.",
};

export default function AddQuestionPage() {
  return <RoomRuntime mode="add-question" />;
}
