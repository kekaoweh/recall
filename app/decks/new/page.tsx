import { Header } from "@/components/header";
import { NewDeckClient } from "./new-deck-client";

export const dynamic = "force-dynamic";

export default function NewDeckPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <NewDeckClient />
    </div>
  );
}
