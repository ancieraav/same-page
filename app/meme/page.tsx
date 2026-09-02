import type { Metadata } from "next";
import { RoomRuntime } from "@/components/room-runtime";

export const metadata: Metadata = {
  title: "Meme break — Same Page",
  description: "Take a quick meme break between Same Page questions.",
};

export default function MemePage() {
  return <RoomRuntime mode="meme" />;
}
