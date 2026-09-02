import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Question — Same Page",
  description: "Answer a question together in Same Page.",
};

export default function QuestionPage() {
  return <RoomRuntime mode="question" />;
}
